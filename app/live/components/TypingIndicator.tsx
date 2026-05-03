"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const diagnosticPhrases = [
  "Analizando tu marca...",
  "Detectando fugas...",
  "Mapeando oportunidades...",
  "Construyendo tu diagnóstico...",
  "Descubriendo tu esencia...",
  "Revisando tu presencia digital...",
  "Conectando los puntos...",
];

export function TypingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % diagnosticPhrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 px-1">
      {/* Animated dots */}
      <div className="flex items-center gap-[5px]">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor:
                i === 0 ? "#7A2CFF" : i === 1 ? "#FF3CAC" : "#00E0FF",
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.5, 1, 0.5],
              y: [0, -4, 0],
            }}
            transition={{
              duration: 0.9,
              repeat: Infinity,
              delay: i * 0.18,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Rotating phrase */}
      <div className="relative h-5 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={phraseIndex}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="block text-[13px] text-white/50 font-medium whitespace-nowrap"
          >
            {diagnosticPhrases[phraseIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
