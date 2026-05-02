"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessage, ChatSession, ApiChatResponse } from "@/types/chat";

const STORAGE_KEY = "chatConversation";
const STORAGE_EXPIRY_HOURS = 2;
const BATCH_DELAY = 10000; // 10 segundos

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return "session_" + crypto.randomUUID();
  }
  return "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

function generateMessageId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return "msg_" + crypto.randomUUID();
  }
  return "msg_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
}

function isDataExpired(expiresAt?: string): boolean {
  if (!expiresAt) return true;
  return new Date() > new Date(expiresAt);
}

function getInitialSession(): ChatSession {
  return {
    messages: [],
    sessionId: generateSessionId(),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + STORAGE_EXPIRY_HOURS * 60 * 60 * 1000).toISOString(),
  };
}

export function useChat() {
  const [session, setSession] = useState<ChatSession>(() => {
    if (typeof window === "undefined") return getInitialSession();
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: ChatSession = JSON.parse(saved);
        if (!isDataExpired(parsed.expiresAt)) {
          return parsed;
        }
      }
    } catch {
      // ignore parse errors
    }
    return getInitialSession();
  });

  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const pendingMessages = useRef<string[]>([]);
  const messageTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentMessage = useRef<string | null>(null);
  const sessionRef = useRef(session);

  // Keep session ref in sync for use in callbacks without stale closures
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Save to localStorage whenever session changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, [session]);

  // Validation interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDataExpired(sessionRef.current.expiresAt)) {
        const fresh = getInitialSession();
        setSession(fresh);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Core function: add a message using functional update (no stale closure)
  const addMessage = useCallback(
    (message: Omit<ChatMessage, "id" | "timestamp">) => {
      const newMessage: ChatMessage = {
        ...message,
        id: generateMessageId(),
        timestamp: new Date().toISOString(),
      };
      
      setSession((prev) => {
        const updated = {
          ...prev,
          messages: [...prev.messages, newMessage],
        };
        return updated;
      });
      
      return newMessage;
    },
    []
  );

  const clearSession = useCallback(() => {
    const fresh = getInitialSession();
    setSession(fresh);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    }
  }, []);

  const processAgentResponse = useCallback(
    (data: ApiChatResponse) => {
      setConnectionError(false);

      if (!data || typeof data !== "object") {
        setSession((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: generateMessageId(),
              role: "assistant",
              content: "He recibido tu mensaje pero hubo un problema al procesar la respuesta.",
              mimetype: "text/plain",
              timestamp: new Date().toISOString(),
            },
          ],
        }));
        return;
      }

      // Check for full study report
      if (data.Informe && typeof data.Informe === "string") {
        localStorage.setItem("studyReport", data.Informe);
        localStorage.setItem("studyTimestamp", Date.now().toString());
        return;
      }

      const responseFields = ["response", "message", "text", "content", "answer", "reply", "output", "result"];
      for (const field of responseFields) {
        const value = data[field];
        if (value && typeof value === "string") {
          setSession((prev) => ({
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: generateMessageId(),
                role: "assistant",
                content: value,
                mimetype: "text/plain",
                timestamp: new Date().toISOString(),
              },
            ],
          }));
          return;
        }
      }

      // Multi-part response
      const parts: Record<string, string> = {};
      Object.keys(data).forEach((key) => {
        const val = data[key];
        if (val && typeof val === "string") {
          parts[key] = val;
        }
      });

      const sortedKeys = Object.keys(parts).sort();
      if (sortedKeys.length > 0) {
        sortedKeys.forEach((key, index) => {
          setTimeout(() => {
            setSession((prev) => ({
              ...prev,
              messages: [
                ...prev.messages,
                {
                  id: generateMessageId(),
                  role: "assistant",
                  content: parts[key],
                  mimetype: "text/plain",
                  isMultiPart: true,
                  partIndex: index + 1,
                  totalParts: sortedKeys.length,
                  timestamp: new Date().toISOString(),
                },
              ],
            }));
          }, index * 3000);
        });
      } else {
        setSession((prev) => ({
          ...prev,
          messages: [
            ...prev.messages,
            {
              id: generateMessageId(),
              role: "assistant",
              content: "He recibido tu audio pero no pude procesar la respuesta correctamente.",
              mimetype: "text/plain",
              timestamp: new Date().toISOString(),
            },
          ],
        }));
      }
    },
    []
  );

  const sendToApi = useCallback(
    async (message: string, type: "text" | "audio" = "text", audioBlob?: Blob) => {
      setIsLoading(true);
      setConnectionError(false);
      lastSentMessage.current = message;

      try {
        if (!navigator.onLine) {
          setConnectionError(true);
          setIsLoading(false);
          return;
        }

        let response: Response;
        const currentSessionId = sessionRef.current.sessionId;

        if (type === "audio" && audioBlob) {
          const formData = new FormData();
          formData.append("audio", audioBlob, "audio.wav");
          formData.append("sessionId", currentSessionId);
          formData.append("type", "audio");

          response = await fetch("/api/chat", {
            method: "POST",
            body: formData,
          });
        } else {
          response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message,
              sessionId: currentSessionId,
              type: "text",
            }),
          });
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`);
        }

        const data: ApiChatResponse = await response.json();
        processAgentResponse(data);
      } catch (error) {
        console.error("Error sending message:", error);
        if (!navigator.onLine || (error instanceof Error && (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")))) {
          setConnectionError(true);
        } else {
          setSession((prev) => ({
            ...prev,
            messages: [
              ...prev.messages,
              {
                id: generateMessageId(),
                role: "system",
                content: `Error del servidor: ${error instanceof Error ? error.message : "Unknown"}`,
                mimetype: "text/plain",
                timestamp: new Date().toISOString(),
              },
            ],
          }));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [processAgentResponse]
  );

  const sendBatchedMessages = useCallback(() => {
    if (pendingMessages.current.length === 0) return;
    const combined = pendingMessages.current.join("\n\n");
    pendingMessages.current = [];
    if (messageTimeout.current) {
      clearTimeout(messageTimeout.current);
      messageTimeout.current = null;
    }
    sendToApi(combined, "text");
  }, [sendToApi]);

  const queueMessage = useCallback(
    (message: string) => {
      pendingMessages.current.push(message);
      if (messageTimeout.current) {
        clearTimeout(messageTimeout.current);
      }
      messageTimeout.current = setTimeout(() => {
        sendBatchedMessages();
      }, BATCH_DELAY);
    },
    [sendBatchedMessages]
  );

  const sendMessage = useCallback(
    (message: string) => {
      addMessage({
        role: "user",
        content: message,
        mimetype: "text/plain",
      });
      queueMessage(message);
    },
    [addMessage, queueMessage]
  );

  const sendAudio = useCallback(
    (audioBlob: Blob) => {
      addMessage({
        role: "user",
        content: "Audio message",
        mimetype: "audio/wav",
      });
      sendToApi("audio_message", "audio", audioBlob);
    },
    [addMessage, sendToApi]
  );

  const retryLastMessage = useCallback(() => {
    if (lastSentMessage.current) {
      setConnectionError(false);
      sendToApi(lastSentMessage.current, "text");
    }
  }, [sendToApi]);

  return {
    messages: session.messages,
    sessionId: session.sessionId,
    isLoading,
    connectionError,
    sendMessage,
    sendAudio,
    retryLastMessage,
    clearSession,
    addMessage,
  };
}
