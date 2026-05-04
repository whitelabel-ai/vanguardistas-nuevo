"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { LiveMessage } from "./useChatStream";

/* ───────────────────────────────────────────────
   Anti-spam: 3-capas de protección
   ─────────────────────────────────────────────── */

const SENT_EMAILS_KEY = "qubra-sent-emails";
const LAST_SENT_PREFIX = "qubra-last-sent-";
const SESSION_SENT_PREFIX = "qubra-sent-this-session-";
const INFORME_PREFIX = "qubra-informe-";
const RATE_LIMIT_HOURS = 24;

// ── Capa 1: localStorage persistente ──
function getSentEmails(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SENT_EMAILS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function markEmailAsSent(email: string) {
  if (typeof window === "undefined") return;
  try {
    const existing = getSentEmails();
    if (!existing.includes(email)) {
      localStorage.setItem(SENT_EMAILS_KEY, JSON.stringify([...existing, email]));
    }
  } catch {}
}

function isEmailSent(email: string): boolean {
  return getSentEmails().includes(email);
}

export function clearSentEmails() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SENT_EMAILS_KEY);
}

// ── Capa 2: sessionStorage (sobrevive remontajes de pestaña) ──
function markSessionSent(email: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_SENT_PREFIX + email, "true");
  } catch {}
}

function isSessionSent(email: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(SESSION_SENT_PREFIX + email) === "true";
  } catch {
    return false;
  }
}

// ── Capa 3: rate limiting por timestamp (24h) ──
function markLastSent(email: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_SENT_PREFIX + email, Date.now().toString());
  } catch {}
}

function getHoursSinceLastSent(email: string): number {
  if (typeof window === "undefined") return Infinity;
  try {
    const raw = localStorage.getItem(LAST_SENT_PREFIX + email);
    if (!raw) return Infinity;
    const lastSent = parseInt(raw, 10);
    if (isNaN(lastSent)) return Infinity;
    return (Date.now() - lastSent) / 3600000; // ms → horas
  } catch {
    return Infinity;
  }
}

function isRateLimited(email: string): boolean {
  return getHoursSinceLastSent(email) < RATE_LIMIT_HOURS;
}

// ── Persistencia de informe ──
function saveInforme(email: string, informe: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INFORME_PREFIX + email, informe);
  } catch {}
}

function loadInforme(email: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(INFORME_PREFIX + email);
  } catch {
    return null;
  }
}

/* ───────────────────────────────────────────────
   Tipos
   ─────────────────────────────────────────────── */

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

/* ───────────────────────────────────────────────
   Hook
   ─────────────────────────────────────────────── */

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

    // Si ya hay un informe persistido para este email, devolverlo directamente
    const email = analysis.datosUsuario.email;
    if (email) {
      const saved = loadInforme(email);
      if (saved) return saved;
    }

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
      const informe = data.informe as string;

      // Persistir el informe generado
      if (email && informe) {
        saveInforme(email, informe);
      }

      return informe;
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

    const email = analysis.datosUsuario.email;

    // Rate limiting: máximo 1 envío cada 24h por email
    if (isRateLimited(email)) {
      const hours = Math.ceil(RATE_LIMIT_HOURS - getHoursSinceLastSent(email));
      setSendResult({
        success: false,
        message: `Ya enviamos un diagnóstico a este correo recientemente. Puedes reenviarlo manualmente desde el panel.`,
      });
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

      // Marcar en TODAS las capas de protección
      markEmailAsSent(email);
      markSessionSent(email);
      markLastSent(email);

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
    loadInforme,
    isEmailSent: (email: string) => isEmailSent(email),
    isSessionSent: (email: string) => isSessionSent(email),
    isRateLimited: (email: string) => isRateLimited(email),
    markEmailAsSent: (email: string) => markEmailAsSent(email),
  };
}
