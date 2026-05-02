"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface ScrollToBottomProps {
  show: boolean;
  onClick: () => void;
}

export function ScrollToBottom({ show, onClick }: ScrollToBottomProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={onClick}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
          <span>Mensajes nuevos</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
