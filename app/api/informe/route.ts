import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";
import { loadPrompt } from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const GEMINI_TIMEOUT_MS = Number(process.env.GEMINI_TIMEOUT_MS) || 25000;
const informePrompt = loadPrompt("qubra-informe");

const informeSchema = z.object({
  userData: z.object({
    nombre: z.string().max(200),
    empresa: z.string().max(200).optional(),
    email: z.string().max(200).optional(),
  }),
  respuestas: z.record(z.string(), z.string().max(2000)),
  camino: z.enum(["A", "B"]).nullable(),
  scores: z.object({
    marketing: z.number(),
    experiencia: z.number(),
    global: z.number(),
  }),
  nivel: z.number().min(1).max(3).nullable(),
  esClientePotencial: z.boolean(),
  fugaPrincipal: z.string().max(500),
  intervencionUrgente: z.string().max(500),
});


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userData, respuestas, camino, scores, nivel, esClientePotencial, fugaPrincipal, intervencionUrgente } = informeSchema.parse(body);

    const promptData = `
Datos del usuario:
- Nombre: ${userData.nombre}
- Empresa: ${userData.empresa || "No especificada"}
- Email: ${userData.email || "No proporcionado"}
- Camino: ${camino || "No definido"}
- Nivel detectado: ${nivel || "No definido"}
- Scores: Marketing ${scores.marketing}/10, Experiencia ${scores.experiencia}/10, Global ${scores.global}/100
- Fuga Principal: ${fugaPrincipal}
- Intervención Urgente: ${intervencionUrgente}
- Cliente Potencial: ${esClientePotencial ? "Sí" : "No"}

Respuestas al diagnóstico:
${Object.entries(respuestas)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

Genera un informe de diagnóstico completo y personalizado en formato Markdown.
Selecciona el template artístico apropiado basado en el nivel y scores.
El informe debe sentirse escrito a mano, con profunda personalización.`;

    const { text } = await generateText({
      model: google("gemini-3.1-flash-lite-preview"),
      system: informePrompt,
      prompt: promptData,
      temperature: 0.7,
      abortSignal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
    });

    return Response.json({ informe: text });
  } catch (error) {
    console.error("Informe error:", error);
    return Response.json(
      { error: "Error generando informe" },
      { status: 500 }
    );
  }
}
