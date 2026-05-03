"use client";

import { motion } from "framer-motion";

const etapas = [
  { id: "retratar", label: "Retratar" },
  { id: "descomponer", label: "Descomponer" },
  { id: "reinterpretar", label: "Reinterpretar" },
  { id: "completado", label: "Completado" },
];

interface ProgressTrackerProps {
  etapa: string;
}

export function ProgressTracker({ etapa }: ProgressTrackerProps) {
  const currentIndex = etapas.findIndex((e) => e.id === etapa);
  const progressPercent = Math.max(
    0,
    Math.min(100, (currentIndex / (etapas.length - 1)) * 100)
  );

  return (
    <div className="py-2">
      <div className="relative flex items-center justify-between">
        {/* Background track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white/[0.08] rounded-full" />

        {/* Active track with brand gradient */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] rounded-full"
          style={{
            background: "linear-gradient(90deg, #7A2CFF, #FF3CAC, #00E0FF)",
          }}
        />

        {/* Steps */}
        {etapas.map((e, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div key={e.id} className="relative flex flex-col items-center gap-2.5 z-10">
              {/* Dot */}
              <motion.div
                initial={false}
                animate={{ scale: isActive ? 1.2 : 1 }}
                transition={{ duration: 0.3 }}
                className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                  isCompleted
                    ? "bg-[#7A2CFF] border-[#7A2CFF]"
                    : isActive
                    ? "bg-[#090A12] border-[#FF3CAC] dot-glow"
                    : "bg-[#090A12] border-white/20"
                }`}
              >
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-[#FF3CAC]"
                  />
                )}
              </motion.div>

              {/* Label */}
              <span
                className={`text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-[#FF3CAC]"
                    : isCompleted
                    ? "text-white/80"
                    : "text-white/30"
                }`}
              >
                {e.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
