import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";
import { loadPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 25000;
const analyzePrompt = loadPrompt("qubra-analyze");

const analyzeSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string().max(8000),
    })
  ).max(200),
});

// Sanitiza el contenido del usuario antes de incrustarlo en el prompt para
// reducir la superficie de prompt-injection (saltos de línea con palabras como
// "System:", "Assistant:" intentando reescribir instrucciones).
function sanitizeForPrompt(content: string): string {
  return content
    .replace(/\r/g, "")
    .replace(/^\s*(system|assistant|user)\s*:/gim, "[$1-redacted]:");
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = analyzeSchema.parse(body);

    const conversationText = messages
      .map((m) => `${m.role === "user" ? "Usuario" : "Qubra"}: ${sanitizeForPrompt(m.content)}`)
      .join("\n\n");

    const { text } = await generateText({
      model: google("gemini-3.1-flash-lite-preview"),
      system: analyzePrompt,
      prompt: conversationText,
      temperature: 0.3,
      abortSignal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    });

    let analysis;
    try {
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      analysis = JSON.parse(jsonStr);

      // ── Etapa determinística por progreso ──
      // Garantiza que el usuario vea todas las etapas en secuencia
      const progreso = Number(analysis.progreso) || 0;
      let etapaForzada: string;
      if (progreso <= 2) {
        etapaForzada = "retratar";
      } else if (progreso <= 5) {
        etapaForzada = "descomponer";
      } else if (progreso <= 8) {
        etapaForzada = "reinterpretar";
      } else {
        etapaForzada = "completado";
      }
      analysis.etapa = etapaForzada;

      // ── Cierre estricto: solo cuando las 10 preguntas tienen respuesta ──
      // Antes usábamos `progreso >= 8` como salvaguarda contra que Gemini
      // no contara P8/P10, pero eso disparaba el diagnóstico mientras el
      // usuario aún estaba respondiendo. Ahora exigimos las 10 keys con
      // valor no vacío para evitar cierres prematuros.
      const respuestasObj =
        analysis.respuestas && typeof analysis.respuestas === "object"
          ? (analysis.respuestas as Record<string, unknown>)
          : {};
      const requiredKeys = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10"];
      const allAnswered = requiredKeys.every((k) => {
        const v = respuestasObj[k];
        return typeof v === "string" && v.trim().length > 0;
      });
      analysis.completado = progreso >= 10 && allAnswered;
    } catch {
      analysis = {
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
    }

    return Response.json(analysis);
  } catch (error) {
    console.error("Analyze error:", error);
    return Response.json(
      {
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
      },
      { status: 500 }
    );
  }
}
