"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { LiveMessage } from "./useChatStream";

export interface Insight {
  categoria: "marketing" | "procesos" | "tecnologia";
  titulo: string;
  descripcion: string;
  icono: string;
}

export interface Scores {
  marketing: number;
  experiencia: number;
  global: number;
}

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
  camino: "A" | "B" | null;
  scores: Scores;
  nivel: 1 | 2 | 3 | null;
  esClientePotencial: boolean;
  fugaPrincipal: string;
  intervencionUrgente: string;
  insights: Insight[];
}

export interface SendDiagnosisResult {
  success: boolean;
  message: string;
  resumen?: string;
}

const initialAnalysis: LiveAnalysis = {
  etapa: "retratar",
  progreso: 0,
  completado: false,
  datosUsuario: { nombre: null, empresa: null, email: null },
  respuestas: {},
  camino: null,
  scores: { marketing: 0, experiencia: 0, global: 0 },
  nivel: null,
  esClientePotencial: false,
  fugaPrincipal: "",
  intervencionUrgente: "",
  insights: [],
};

export function useLiveAnalysis(messages: LiveMessage[]) {
  const [analysis, setAnalysis] = useState<LiveAnalysis>(initialAnalysis);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendDiagnosisResult | null>(null);
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
          camino: analysis.camino,
          scores: analysis.scores,
          nivel: analysis.nivel,
          esClientePotencial: analysis.esClientePotencial,
          fugaPrincipal: analysis.fugaPrincipal,
          intervencionUrgente: analysis.intervencionUrgente,
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

  const sendDiagnosis = useCallback(async (informe: string) => {
    if (!analysis.datosUsuario.email) {
      setSendResult({ success: false, message: "No hay email del usuario para enviar el diagnóstico" });
      return null;
    }

    setIsSending(true);
    setSendResult(null);

    try {
      const response = await fetch("/api/send-diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userData: analysis.datosUsuario,
          respuestas: analysis.respuestas,
          informe,
          camino: analysis.camino,
          scores: analysis.scores,
          nivel: analysis.nivel,
          esClientePotencial: analysis.esClientePotencial,
          fugaPrincipal: analysis.fugaPrincipal,
          intervencionUrgente: analysis.intervencionUrgente,
          sector: analysis.respuestas["P4"] || "",
          queVenden: analysis.respuestas["P3"] || "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(errorData.error || "Error enviando diagnóstico");
      }

      const data = await response.json();
      const result: SendDiagnosisResult = {
        success: true,
        message: data.message || "Diagnóstico enviado exitosamente",
        resumen: data.n8nResponse?.resumen,
      };
      setSendResult(result);
      return result;
    } catch (error) {
      console.error("Send diagnosis error:", error);
      const result: SendDiagnosisResult = {
        success: false,
        message: error instanceof Error ? error.message : "Error enviando diagnóstico",
      };
      setSendResult(result);
      return result;
    } finally {
      setIsSending(false);
    }
  }, [analysis]);

  return {
    analysis,
    isAnalyzing,
    isSending,
    sendResult,
    generateInforme,
    sendDiagnosis,
  };
}
