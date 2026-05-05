"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTypingEffect } from "@/hooks/useTypingEffect";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const consejos = [
  "Estoy calibrando tu Mapa de Calor...",
  "Analizando tus puntos de fuga comerciales...",
  "Pintando el retrato de tu marca digital...",
  "Detectando dónde se pierden tus oportunidades...",
  "Preparando tu plan de acción táctico...",
  "Revisando que todo esté perfecto para ti...",
];

const TIMEOUT_SECONDS = 30;

interface SendingModalProps {
  isOpen: boolean;
  nombre?: string | null;
  onTimeout?: () => void;
  onRetry?: () => void;
}

export function SendingModal({ isOpen, nombre, onTimeout, onRetry }: SendingModalProps) {
  const tipText = useTypingEffect(consejos, 2500);
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(TIMEOUT_SECONDS);
      setHasTimedOut(false);
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setHasTimedOut(true);
          onTimeout?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onTimeout]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0B0B16]/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center text-center px-8 max-w-md"
          >
            {/* Avatar animado */}
            <div className="relative mb-8">
              <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-[#7A2CFF]/30 ring-offset-4 ring-offset-[#0B0B16] avatar-typing avatar-ripple">
                <img
                  src="/img/qubra.png"
                  alt="Qubra"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Pulse rings */}
              <span className="absolute inset-0 rounded-full bg-[#7A2CFF]/20 animate-ping" />
              <span className="absolute -inset-3 rounded-full bg-[#7A2CFF]/10 animate-pulse" />
            </div>

            {hasTimedOut ? (
              /* ── Estado de error / timeout ── */
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Algo salió mal
                </h2>
                <p className="text-sm text-[#E8E4F5]/50 mb-6 max-w-xs">
                  No pudimos enviar tu Mapa de Fugas a tiempo. Puedes intentar de nuevo desde el panel de diagnóstico.
                </p>
                {onRetry && (
                  <Button
                    onClick={onRetry}
                    className="h-11 px-6 gradient-btn rounded-xl font-medium text-sm flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Intentar de nuevo
                  </Button>
                )}
              </>
            ) : (
              /* ── Estado de envío normal ── */
              <>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Preparando tu Mapa de Fugas
                </h2>
                {nombre && (
                  <p className="text-sm text-[#E8E4F5]/50 mb-6">
                    Esto no tomará más de unos segundos, {nombre}
                  </p>
                )}

                {/* Consejo rotativo con typewriter */}
                <div className="h-8 flex items-center justify-center mb-8">
                  <p className="text-sm text-[#FFC906] font-medium min-h-[1.5rem]">
                    {tipText}
                    <span className="inline-block w-0.5 h-4 bg-[#FFC906] ml-0.5 animate-pulse align-middle" />
                  </p>
                </div>

                {/* Barra de progreso animada */}
                <div className="w-64 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#7A2CFF] via-[#DD256C] to-[#FFC906]"
                    initial={{ width: "0%" }}
                    animate={{ width: ["0%", "40%", "70%", "90%", "95%"] }}
                    transition={{
                      duration: 20,
                      times: [0, 0.2, 0.5, 0.8, 1],
                      ease: "easeInOut",
                      repeat: Infinity,
                    }}
                  />
                </div>

                {/* Subtle label + countdown */}
                <div className="flex items-center gap-2 mt-4 text-[11px] text-white/30">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Enviando diagnóstico + PDF a tu correo</span>
                  <span className="text-white/20">· {secondsLeft}s</span>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
