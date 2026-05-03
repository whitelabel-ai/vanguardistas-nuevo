"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { LiveMessage } from "./useChatStream";

export interface LiveAnalysis {
  etapa: "retratar" | "descomponer" | "reinterpretar" | "completado";
  progreso: number;
  completado: boolean;
  datosUsuario: {
    nombre: string | null;
    empresa: string | null;
    email: string | null;
  };
  respuestas: Record<string, string>;
  insights: {
    categoria: "marketing" | "procesos" | "tecnologia";
    titulo: string;
    descripcion: string;
    icono: string;
  }[];
}

const initialAnalysis: LiveAnalysis = {
  etapa: "retratar",
  progreso: 0,
  completado: false,
  datosUsuario: { nombre: null, empresa: null, email: null },
  respuestas: {},
  insights: [],
};

export function useLiveAnalysis(messages: LiveMessage[]) {
  const [analysis, setAnalysis] = useState<LiveAnalysis>(initialAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastAnalyzedCount = useRef(0);

  const analyze = useCallback(async () => {
    if (messages.length === 0) return;
    if (messages.length === lastAnalyzedCount.current) return;

    setIsAnalyzing(true);
    lastAnalyzedCount.current = messages.length;

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages
            .filter((m) => m.type !== "progress" && m.content !== "__AUDIO__")
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        console.error("Analyze API error:", response.status, errorText);
        throw new Error(`Analyze failed: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [messages]);

  // Analyze every time messages change, but debounced
  useEffect(() => {
    const timeout = setTimeout(() => {
      analyze();
    }, 2000);

    return () => clearTimeout(timeout);
  }, [messages, analyze]);

  const generateInforme = useCallback(async () => {
    if (!analysis.datosUsuario.nombre || analysis.progreso < 5) return null;

    try {
      const response = await fetch("/api/informe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userData: analysis.datosUsuario,
          respuestas: analysis.respuestas,
        }),
      });

      if (!response.ok) throw new Error("Informe failed");

      const data = await response.json();
      return data.informe as string;
    } catch (error) {
      console.error("Informe error:", error);
      return null;
    }
  }, [analysis]);

  return {
    analysis,
    isAnalyzing,
    generateInforme,
  };
}
