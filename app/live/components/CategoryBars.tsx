"use client";

import { motion } from "framer-motion";

interface CategoryBarsProps {
  respuestas: Record<string, string>;
}

const categories = [
  { id: "marketing", label: "Marketing", color: "bg-pink-500" },
  { id: "procesos", label: "Procesos", color: "bg-amber-500" },
  { id: "tecnologia", label: "Tecnología", color: "bg-cyan-500" },
];

export function CategoryBars({ respuestas }: CategoryBarsProps) {
  const total = Object.keys(respuestas).length;
  const maxPerCategory = 4;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Cobertura por Área
      </h3>
      <div className="space-y-2">
        {categories.map((cat) => {
          const count = Math.min(total, maxPerCategory);
          const percentage = (count / maxPerCategory) * 100;

          return (
            <div key={cat.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">{cat.label}</span>
                <span className="text-muted-foreground">{count}/{maxPerCategory}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.6 }}
                  className={`h-full ${cat.color} rounded-full`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
