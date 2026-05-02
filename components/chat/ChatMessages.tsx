"use client";

import { useRef, useEffect } from "react";
import { ChatMessage } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Play, Pause, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedMessage } from "./AnimatedMessage";
import { AnimatedAvatar } from "./AnimatedAvatar";
import { TypingIndicator } from "./TypingIndicator";
import { CopyButton } from "./CopyButton";
import { ScrollToBottom } from "./ScrollToBottom";
import { useScrollPosition } from "@/hooks/useScrollPosition";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  connectionError: boolean;
  onRetry: () => void;
  playingMessageId: string | null;
  onToggleAudio: (message: ChatMessage) => void;
}

function formatMessageContent(content: string) {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br>");
}

export function ChatMessages({
  messages,
  isLoading,
  connectionError,
  onRetry,
  playingMessageId,
  onToggleAudio,
}: ChatMessagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { showScrollButton, scrollToBottom } = useScrollPosition(containerRef);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 150;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    if (isNearBottom || messages.length <= 2) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 max-w-[85%]">
                <AnimatedAvatar isTyping={false} />
                <div className="bg-secondary/80 text-foreground rounded-2xl rounded-tl-sm px-4 py-3 text-sm">
                  Empezar mi diagnóstico
                </div>
              </div>
            </motion.div>
          )}

          {messages.map((message) => (
            <AnimatedMessage
              key={message.id}
              role={message.role}
              index={message.isMultiPart ? message.partIndex || 0 : 0}
            >
              <div
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  {message.role === "user" ? (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <AnimatedAvatar
                      isTyping={false}
                      hasError={message.role === "system"}
                    />
                  )}

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      "group relative rounded-2xl px-4 py-3 text-sm",
                      message.role === "user"
                        ? "bg-gradient-to-br from-violet-600 to-pink-600 text-white rounded-tr-sm"
                        : message.role === "system"
                        ? "bg-destructive/10 border border-destructive/20 text-destructive-foreground rounded-tl-sm"
                        : "bg-secondary/80 text-foreground rounded-tl-sm"
                    )}
                  >
                    {/* Copy button for assistant messages */}
                    {message.role === "assistant" && !message.mimetype.startsWith("audio/") && (
                      <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyButton text={message.content} />
                      </div>
                    )}

                    {message.mimetype.startsWith("audio/") ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onToggleAudio(message)}
                          className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                          {playingMessageId === message.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                        <span className="text-xs opacity-80">
                          {message.role === "user" ? "Escuchar tu audio..." : "Audio message"}
                        </span>
                      </div>
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatMessageContent(message.content),
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </AnimatedMessage>
          ))}

          {/* Connection Error */}
          {connectionError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex justify-center"
            >
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-center max-w-sm">
                <p className="text-destructive-foreground mb-2">
                  Se perdi la conexion por un momento
                </p>
                <button
                  onClick={onRetry}
                  className="text-sm underline text-foreground hover:text-white transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </motion.div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 max-w-[85%]">
                <AnimatedAvatar isTyping={true} />
                <div className="bg-secondary/80 rounded-2xl rounded-tl-sm px-4 py-3">
                  <TypingIndicator />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll to bottom button */}
      <ScrollToBottom
        show={showScrollButton}
        onClick={() => scrollToBottom("smooth")}
      />
    </div>
  );
}
