"use client";

import { useState, useCallback, useRef } from "react";

export interface LiveMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "progress" | "audio";
  metadata?: {
    etapa?: string;
    progreso?: number;
  };
}

export interface LiveAnalysis {
  etapa: "retratar" | "descomponer" | "reinterpretar" | "completado";
  progreso: number;
  completado: boolean;
  datosUsuario: {
    nombre: string | null;
    empresa: string | null;
    email: string | null;
  };
  respuestas: Record<string, string>;
  insights: {
    categoria: "marketing" | "procesos" | "tecnologia";
    titulo: string;
    descripcion: string;
    icono: string;
  }[];
}

function toApiMessage(m: LiveMessage) {
  return { role: m.role, content: m.content };
}

export function useChatStream() {
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useCallback((message: Omit<LiveMessage, "id">) => {
    const newMessage: LiveMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: LiveMessage = {
        id: Date.now().toString(),
        role: "user",
        content,
        type: "text",
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const apiMessages = messages
          .filter((m) => !m.type || m.type === "text" || m.type === "audio")
          .map(toApiMessage);

        const response = await fetch("/api/chat-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...apiMessages, { role: "user", content }],
          }),
        });

        if (!response.ok) throw new Error("Failed to stream");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        if (reader) {
          const assistantMessage: LiveMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "",
            type: "text",
          };
          setMessages((prev) => [...prev, assistantMessage]);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            assistantContent += chunk;

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, content: assistantContent }
                  : m
              )
            );
          }
        }
      } catch (error) {
        console.error("Chat stream error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Lo siento, hubo un error. ¿Podemos intentar de nuevo?",
            type: "text",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  const sendAudio = useCallback(
    async (audioBlob: Blob) => {
      if (isLoading) return;

      const userMessage: LiveMessage = {
        id: Date.now().toString(),
        role: "user",
        content: "__AUDIO__",
        type: "audio",
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const apiMessages = messages
          .filter((m) => !m.type || m.type === "text" || m.type === "audio")
          .map(toApiMessage);

        const formData = new FormData();
        formData.append(
          "messages",
          JSON.stringify([...apiMessages, { role: "user", content: "__AUDIO__" }])
        );
        formData.append("audio", audioBlob, "recording.webm");

        const response = await fetch("/api/chat-stream", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to stream audio");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        if (reader) {
          const assistantMessage: LiveMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "",
            type: "text",
          };
          setMessages((prev) => [...prev, assistantMessage]);

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            assistantContent += chunk;

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id
                  ? { ...m, content: assistantContent }
                  : m
              )
            );
          }
        }
      } catch (error) {
        console.error("Audio stream error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "No pude procesar tu audio. ¿Podrías intentar de nuevo?",
            type: "text",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    sendAudio,
    addMessage,
  };
}
