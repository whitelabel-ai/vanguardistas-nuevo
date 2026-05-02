"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface TransitionOverlayProps {
  show: boolean;
}

export function TransitionOverlay({ show }: TransitionOverlayProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (!show) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowCheck(true);
          setTimeout(() => {
            router.push("/resumen");
          }, 800);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [show, router]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-8 max-w-md w-full px-6"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden avatar-pulse">
                <Image
                  src="/img/qubra.png"
                  alt="Qubra"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Text */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-white">
                Generando tu estudio personalizado...
              </h2>
              <p className="text-sm text-white/50">
                Estamos preparando tu diagnóstico completo
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-xs">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-center text-xs text-white/40 mt-2">{progress}%</p>
            </div>

            {/* Checkmark */}
            <AnimatePresence>
              {showCheck && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path
                      className="checkmark-path checkmark-animate"
                      d="M5 12l5 5L20 7"
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
