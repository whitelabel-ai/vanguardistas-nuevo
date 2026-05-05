"use client";

import { motion } from "framer-motion";

interface BuyerPersonaBadgeProps {
  persona: string | null;
}

export function BuyerPersonaBadge({ persona }: BuyerPersonaBadgeProps) {
  if (!persona || persona === "Perfil en evaluación") {
    return (
      <p className="text-sm text-white/30">
        El perfil se detectará cuando tengamos más información...
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/[0.04] border border-[#8E58A4]/20"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-[#8E58A4] mr-2 dot-glow" />
      <span className="text-sm text-white/80">{persona}</span>
    </motion.div>
  );
}
