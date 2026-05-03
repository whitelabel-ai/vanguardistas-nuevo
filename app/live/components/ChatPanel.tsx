"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { LiveMessage } from "../hooks/useChatStream";
import { Send, Mic, MicOff, BarChart3, ArrowRight } from "lucide-react";

interface ChatPanelProps {
  messages: LiveMessage[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  onSend: () => void;
  onSendAudio?: (blob: Blob) => void;
  onOpenAnalysis?: () => void;
}

const etapaLabels: Record<string, string> = {
  retratar: "Retratar",
  descomponer: "Descomponer",
  reinterpretar: "Reinterpretar",
  completado: "Completado",
};

export function ChatPanel({
  messages,
  input,
  setInput,
  isLoading,
  onSend,
  onSendAudio,
  onOpenAnalysis,
}: ChatPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // MediaRecorder audio capture
  const startRecording = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Tu navegador no soporta grabación de audio.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });
        onSendAudio?.(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.onerror = () => {
        setIsRecording(false);
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access error:", err);
      alert("Necesitas permitir el acceso al micrófono.");
    }
  }, [onSendAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 sm:px-7 lg:px-8 xl:px-10 py-6 sm:py-7 lg:py-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {/* Qubra Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full overflow-hidden avatar-pulse-ring">
              <img
                src="/img/qubra.png"
                alt="Qubra"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#00E0FF] border-2 border-[#090A12] online-dot" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-white">Qubra</h2>
            <p className="text-xs sm:text-sm text-[#E8E4F5]/50">
              {isLoading ? "Escribiendo..." : "En línea"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00E0FF] online-dot" />
          <span className="text-[11px] sm:text-xs text-white/40">Activo</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 sm:px-7 lg:px-8 xl:px-10"
      >
        {messages.length === 0 && (
          <div className="py-12 sm:py-16 lg:py-20 flex flex-col items-start">
            <div className="max-w-[85%] sm:max-w-[75%]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src="/img/qubra.png"
                    alt="Qubra"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#E8E4F5]/50">
                  Qubra
                </span>
              </div>
              <div className="qubra-message-border pl-4">
                <p className="text-xl sm:text-2xl lg:text-[28px] font-semibold text-white/90 leading-relaxed">
                  Detecté que tu marca necesita un diagnóstico. Vamos a encontrar las fugas.
                </p>
              </div>
              <p className="text-sm sm:text-base text-white/40 mt-4 leading-relaxed">
                Soy Qubra, tu consultor digital de Vanguardistas. Voy a hacerte algunas preguntas 
                para entender tu negocio y generar un diagnóstico personalizado.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-5 pt-4">
          {messages.map((message) => {
            const isProgress = message.type === "progress";
            const etapa = message.metadata?.etapa || "";
            const progreso = message.metadata?.progreso || 0;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className={`max-w-[85%] sm:max-w-[75%] ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}>
                  {/* Label + avatar row */}
                  <div className={`flex items-center gap-2 mb-1.5 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}>
                    {message.role === "assistant" && (
                      <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src="/img/qubra.png"
                          alt="Qubra"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <span className={`text-[11px] font-medium uppercase tracking-wider ${
                      message.role === "user" ? "text-white/40" : "text-[#E8E4F5]/50"
                    }`}>
                      {message.role === "user" ? "Tú" : "Qubra"}
                    </span>
                  </div>

                  {/* Message bubble */}
                  {isProgress ? (
                    <div className="rounded-2xl rounded-tl-sm overflow-hidden bg-[#0B0B16] border border-white/[0.06]">
                      {/* Top accent line */}
                      <div className="h-0.5 w-full bg-gradient-to-r from-[#7A2CFF] via-[#00E0FF] to-[#FF3CAC]" />
                      
                      <div className="px-4 py-3.5">
                        <p className="text-[15px] text-white/90 leading-relaxed mb-3">
                          Hemos completado la fase{" "}
                          <span className="text-[#00E0FF] font-semibold">
                            {etapaLabels[etapa] || etapa}
                          </span>
                          . Tu diagnóstico avanza.
                        </p>

                        <div className="flex items-center gap-3">
                          {/* Score */}
                          <div className="flex items-baseline gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04]">
                            <span className="text-sm font-semibold text-white">
                              {progreso * 3}
                            </span>
                            <span className="text-[11px] text-white/40">/ 30 pts</span>
                          </div>

                          {/* CTA */}
                          {onOpenAnalysis && (
                            <button
                              onClick={onOpenAnalysis}
                              className="group flex items-center gap-1.5 text-[13px] text-white/60 hover:text-[#00E0FF] transition-colors"
                            >
                              <BarChart3 className="w-3.5 h-3.5" />
                              Ver diagnóstico
                              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-white/[0.06] rounded-tr-sm"
                        : "qubra-message-border pl-4 bg-white/[0.02] rounded-tl-sm"
                    }`}>
                      {message.content === "__AUDIO__" ? (
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-[#00E0FF]" />
                          <span className="text-[15px] text-white/70">Mensaje de voz</span>
                        </div>
                      ) : (
                        <p className="text-[15px] text-white/90 leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="max-w-[85%] sm:max-w-[75%]">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src="/img/qubra.png"
                      alt="Qubra"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#E8E4F5]/50">
                    Qubra
                  </span>
                </div>
                <div className="rounded-2xl rounded-tl-sm px-4 py-3 qubra-message-border pl-4 bg-white/[0.02]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7A2CFF] animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF3CAC] animate-pulse" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00E0FF] animate-pulse" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom spacer for scroll */}
        <div className="h-4" />
      </div>

      {/* Input */}
      <div className="px-6 sm:px-7 lg:px-8 xl:px-10 py-4 sm:py-5 lg:py-6 shrink-0">
        <div className="relative bg-white/[0.03] rounded-2xl px-4 py-3 flex items-end gap-3">
          {/* Mic button */}
          <button
            onClick={toggleRecording}
            disabled={isLoading}
            className={`relative flex-shrink-0 p-2 rounded-full transition-all ${
              isRecording
                ? "bg-red-500/20 text-red-400 animate-pulse"
                : "text-white/30 hover:text-[#00E0FF] hover:bg-white/[0.05]"
            } disabled:opacity-30`}
            title={isRecording ? "Detener grabación" : "Grabar audio"}
          >
            {isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            {/* Recording ring */}
            {isRecording && (
              <span className="absolute inset-0 rounded-full border-2 border-red-400/50 animate-ping" />
            )}
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isRecording ? "Grabando..." : "Escribe tu respuesta..."}
            className="flex-1 bg-transparent border-0 text-[15px] text-white placeholder:text-white/30 resize-none focus:outline-none py-1 leading-relaxed"
            rows={2}
            disabled={isLoading || isRecording}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || isLoading || isRecording}
            className="text-white/30 hover:text-[#00E0FF] disabled:opacity-30 disabled:hover:text-white/30 transition-colors pb-1"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
