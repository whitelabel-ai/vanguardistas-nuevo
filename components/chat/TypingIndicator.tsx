"use client";

import { useTypingEffect } from "@/hooks/useTypingEffect";

const typingTexts = [
  "Qubra está pensando...",
  "Analizando tu marca...",
  "Preparando tu diagnóstico...",
  "Qubra está escribiendo...",
];

export function TypingIndicator() {
  const displayText = useTypingEffect(typingTexts, 2500);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-end gap-[3px] h-5">
        <div className="equalizer-bar" />
        <div className="equalizer-bar" />
        <div className="equalizer-bar" />
        <div className="equalizer-bar" />
        <div className="equalizer-bar" />
      </div>
      <span className="text-xs text-muted-foreground min-w-[180px]">
        {displayText}
        <span className="animate-pulse">|</span>
      </span>
    </div>
  );
}
