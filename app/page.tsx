"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <div className="absolute inset-0 mesh-gradient-bg pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl mx-auto px-6"
      >
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-white tracking-tight leading-[1.1]">
          Tu diagnóstico digital en vivo
        </h1>

        <p className="text-lg sm:text-xl text-white/50 mt-6 max-w-xl leading-relaxed">
          Conversa con Qubra mientras descubrimos el estado de tu marca. 
          Análisis en tiempo real, hallazgos claros y un informe completo al final.
        </p>

        <div className="mt-10">
          <Link href="/live">
            <Button
              size="lg"
              className="h-14 px-8 bg-white text-black hover:bg-white/90 rounded-xl text-base font-medium transition-colors"
            >
              Comenzar diagnóstico
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-white/30">
          También disponible:{" "}
          <Link href="/legacy" className="text-white/50 hover:text-white/80 transition-colors underline underline-offset-4">
            versión clásica
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
