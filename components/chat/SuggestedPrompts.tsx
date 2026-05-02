"use client";

import { motion } from "framer-motion";
import { Rocket, Lightbulb, Target, BarChart3 } from "lucide-react";

const prompts = [
  { icon: Rocket, text: "Quiero vender más en redes" },
  { icon: Lightbulb, text: "Mi marca no conecta con mi audiencia" },
  { icon: Target, text: "Necesito un embudo de ventas" },
  { icon: BarChart3, text: "Quiero entender mi competencia" },
];

interface SuggestedPromptsProps {
  onSelect: (text: string) => void;
}

export function SuggestedPrompts({ onSelect }: SuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {prompts.map((prompt, index) => (
        <motion.button
          key={prompt.text}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(prompt.text)}
          className="prompt-glow flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/80 hover:text-white hover:border-violet-500/50 hover:bg-white/10 transition-all cursor-pointer"
        >
          <prompt.icon className="w-4 h-4 text-violet-400" />
          <span>{prompt.text}</span>
        </motion.button>
      ))}
    </div>
  );
}
