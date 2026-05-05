"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Target, Lightbulb } from "lucide-react";

interface OnboardingScreenProps {
  onComplete: () => void;
  firstMessageReady: boolean;
}

const phases = [
  {
    icon: Search,
    title: "Retratar",
    color: "#EF5095",
    tooltip: "Descubrimos la esencia y propósito de tu marca",
  },
  {
    icon: Target,
    title: "Descomponer",
    color: "#FFC906",
    tooltip: "Identificamos las fugas en ventas, proceso y visibilidad",
  },
  {
    icon: Lightbulb,
    title: "Reinterpretar",
    color: "#8E58A4",
    tooltip: "Construimos un plan de acción personalizado",
  },
];

export function OnboardingScreen({ onComplete, firstMessageReady }: OnboardingScreenProps) {
  const [showTooltip, setShowTooltip] = useState<number | null>(null);
  const [canExit, setCanExit] = useState(false);

  // Minimum animation duration: 400ms
  useEffect(() => {
    const timer = setTimeout(() => setCanExit(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Exit when animation complete AND first message is ready
  useEffect(() => {
    if (canExit && firstMessageReady) {
      const timer = setTimeout(onComplete, 400);
      return () => clearTimeout(timer);
    }
  }, [canExit, firstMessageReady, onComplete]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.05 },
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: { duration: 0.3, ease: "easeInOut" as const },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.15, ease: "easeOut" as const } },
  };

  const phaseVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.12, ease: "easeOut" as const } },
  };

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute inset-0 z-30 flex flex-col items-center justify-center"
      >
        {/* Qubra Avatar */}
        <motion.div variants={itemVariants} className="relative mb-4">
          <div className="w-14 h-14 rounded-full overflow-hidden avatar-pulse-ring">
            <img src="/img/qubra.png" alt="Qubra" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#8E58A4] border-[2.5px] border-[#0B0B16]" />
        </motion.div>

        {/* Methodology label */}
        <motion.p
          variants={itemVariants}
          className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40 mb-6"
        >
          Metodología de diagnóstico
        </motion.p>

        {/* Phases */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 sm:gap-4"
        >
          {phases.map((phase, i) => (
            <motion.div
              key={phase.title}
              variants={phaseVariants}
              className="relative"
              onMouseEnter={() => setShowTooltip(i)}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <div
                className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-default transition-colors hover:bg-white/[0.06] hover:border-white/[0.12]"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${phase.color}15` }}
                >
                  <phase.icon className="w-4 h-4" style={{ color: phase.color }} />
                </div>
                <span className="text-[11px] font-semibold text-white/80">{phase.title}</span>
              </div>

              {/* Tooltip */}
              <AnimatePresence>
                {showTooltip === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl bg-[#0B0B16] border border-white/[0.08] shadow-xl whitespace-nowrap z-40"
                  >
                    <p className="text-[11px] text-white/70">{phase.tooltip}</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-2 h-2 bg-[#0B0B16] border-r border-b border-white/[0.08] rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Optional: connecting dots between phases */}
        <motion.div variants={itemVariants} className="flex items-center gap-1 mt-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: i === 0 ? "#EF5095" : i === 1 ? "#FFC906" : "#8E58A4",
              }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
