"use client";

import { motion } from "framer-motion";

interface ScoreMeterProps {
  score: number;
  maxScore?: number;
}

export function ScoreMeter({ score, maxScore = 30 }: ScoreMeterProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);

  return (
    <div className="py-2">
      <div className="flex flex-col items-center">
        <motion.span
          key={score}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-5xl font-semibold text-white tracking-tight tabular-nums glow-text"
        >
          {score}
        </motion.span>
        <span className="text-sm text-[#E8E4F5]/40 mt-1">
          de {maxScore} puntos
        </span>
      </div>
      <div className="mt-6 h-px bg-white/[0.06] relative overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute inset-y-0 left-0"
          style={{
            background: "linear-gradient(90deg, #8E58A4, #EF5095)",
          }}
        />
      </div>
      <div className="flex justify-between mt-3 text-[11px] text-white/30">
        <span>En desarrollo</span>
        <span>Avanzado</span>
      </div>
    </div>
  );
}
