"use client";

import { motion } from "framer-motion";

interface Insight {
  categoria: "marketing" | "procesos" | "tecnologia";
  titulo: string;
  descripcion: string;
  icono: string;
}

interface InsightCardsProps {
  insights: Insight[];
}

const categoryConfig = {
  marketing: {
    border: "border-neon-marketing",
    iconColor: "text-[#FF3CAC]",
  },
  procesos: {
    border: "border-neon-procesos",
    iconColor: "text-[#00E0FF]",
  },
  tecnologia: {
    border: "border-neon-tecnologia",
    iconColor: "text-[#7A2CFF]",
  },
};

export function InsightCards({ insights }: InsightCardsProps) {
  if (insights.length === 0) {
    return (
      <p className="text-sm text-white/30 py-2">
        Los hallazgos aparecerán aquí a medida que avances...
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, index) => {
        const config = categoryConfig[insight.categoria];
        return (
          <motion.div
            key={`${insight.titulo}-${index}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className={`p-5 rounded-[20px] bg-[#0B0B16] border ${config.border} transition-colors`}
          >
            <div className="flex items-start gap-3">
              <span className={`text-lg flex-shrink-0 ${config.iconColor}`}>
                {insight.icono}
              </span>
              <div>
                <p className="text-[15px] text-white/90 leading-relaxed font-medium">
                  {insight.titulo}
                </p>
                <p className="text-sm text-white/50 leading-relaxed mt-1">
                  {insight.descripcion}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
