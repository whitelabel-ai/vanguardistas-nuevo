"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedMessageProps {
  children: ReactNode;
  role: "user" | "assistant" | "system";
  index?: number;
}

export function AnimatedMessage({ children, role, index = 0 }: AnimatedMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 50 : -50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{
        duration: isUser ? 0.25 : 0.35,
        delay: index * 0.15,
        ease: "easeOut",
      }}
      layout
    >
      {children}
    </motion.div>
  );
}
