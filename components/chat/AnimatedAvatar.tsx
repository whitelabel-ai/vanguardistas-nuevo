"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface AnimatedAvatarProps {
  isTyping?: boolean;
  hasError?: boolean;
  size?: "sm" | "md";
}

export function AnimatedAvatar({ isTyping = false, hasError = false, size = "sm" }: AnimatedAvatarProps) {
  const sizeClasses = size === "md" ? "w-10 h-10" : "w-8 h-8";

  return (
    <div className="relative flex-shrink-0">
      <div
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center",
          sizeClasses,
          hasError && "animate-shake",
          !hasError && !isTyping && "avatar-pulse",
          isTyping && "avatar-typing avatar-ripple"
        )}
      >
        <div className="w-full h-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
          <Image
            src="/img/qubra.png"
            alt="Qubra"
            width={size === "md" ? 40 : 32}
            height={size === "md" ? 40 : 32}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      {/* Online dot */}
      <div
        className={cn(
          "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-black",
          isTyping ? "bg-pink-accent online-dot" : "bg-green-500"
        )}
      />
    </div>
  );
}
