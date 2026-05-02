"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useChat } from "@/hooks/useChat";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ChatModals } from "./ChatModals";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { GradientBorder } from "./GradientBorder";
import { TransitionOverlay } from "./TransitionOverlay";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "@/types/chat";

export function ChatContainer() {
  const router = useRouter();
  const {
    messages,
    isLoading,
    connectionError,
    sendMessage,
    sendAudio,
    retryLastMessage,
  } = useChat();

  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [whatYouGetOpen, setWhatYouGetOpen] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const currentAudio = useRef<HTMLAudioElement | null>(null);

  const handleToggleAudio = useCallback(
    (message: ChatMessage) => {
      if (playingMessageId === message.id) {
        if (currentAudio.current) {
          currentAudio.current.pause();
          currentAudio.current = null;
        }
        setPlayingMessageId(null);
      } else {
        if (currentAudio.current) {
          currentAudio.current.pause();
        }
        const audio = new Audio(message.content);
        currentAudio.current = audio;
        audio.onended = () => {
          setPlayingMessageId(null);
          currentAudio.current = null;
        };
        audio.onerror = () => {
          setPlayingMessageId(null);
          currentAudio.current = null;
        };
        audio.play();
        setPlayingMessageId(message.id);
      }
    },
    [playingMessageId]
  );

  const handleSuggestedPrompt = (text: string) => {
    sendMessage(text);
  };

  const isEmpty = messages.length === 0;

  return (
    <section className="min-h-screen pt-20 pb-8 flex flex-col relative overflow-hidden">
      {/* Animated mesh gradient background - mas sutil */}
      <div className="absolute inset-0 mesh-gradient-bg pointer-events-none" />

      {/* Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center px-4 py-10 max-w-3xl mx-auto"
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
          Logra tu plan para vender mas adaptado a tu marca en{" "}
          <span className="chat-gradient-text">2 minutos.</span>
        </h1>
        <p className="text-white/50 text-lg">Habla con Qubra y obten tu diagnostico.</p>
      </motion.div>

      {/* Chat Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 flex flex-col max-w-3xl w-full mx-auto px-4"
      >
        {/* Altura fija para el chat */}
        <GradientBorder intense={isLoading} className="h-[600px]">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/5 flex-shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden">
                <Image
                  src="/img/qubra.png"
                  alt="Qubra"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#111] ${
                  isLoading ? "bg-pink-accent online-dot" : "bg-green-500"
                }`}
              />
            </div>
            <div>
              <h3 className="text-foreground font-semibold text-sm">Hola, Soy Qubra!</h3>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Escribiendo..." : "En linea"}
              </p>
            </div>
          </div>

          {/* Messages - toma el espacio restante */}
          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            connectionError={connectionError}
            onRetry={retryLastMessage}
            playingMessageId={playingMessageId}
            onToggleAudio={handleToggleAudio}
          />

          {/* Input - siempre abajo */}
          <ChatInput
            onSendMessage={sendMessage}
            onSendAudio={sendAudio}
            isLoading={isLoading}
          />
        </GradientBorder>

        {/* Suggested Prompts (only when empty) */}
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <SuggestedPrompts onSelect={handleSuggestedPrompt} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-6">
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
            onClick={() => setHowItWorksOpen(true)}
          >
            Como funciona?
          </Button>
          <Button
            variant="gradient"
            className="rounded-full"
            onClick={() => setWhatYouGetOpen(true)}
          >
            Que obtienes?
          </Button>
        </div>
      </motion.div>

      {/* Modals */}
      <ChatModals
        howItWorksOpen={howItWorksOpen}
        setHowItWorksOpen={setHowItWorksOpen}
        whatYouGetOpen={whatYouGetOpen}
        setWhatYouGetOpen={setWhatYouGetOpen}
      />

      {/* Transition Overlay */}
      <TransitionOverlay show={showTransition} />
    </section>
  );
}
