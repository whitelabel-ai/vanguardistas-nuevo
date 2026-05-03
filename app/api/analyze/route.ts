import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest } from "next/server";
import { z } from "zod";

const analyzeSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
});

const analyzePrompt = `Eres un analizador de diagnóstico empresarial para Vanguardistas.

Analiza esta conversación entre un usuario y el agente Qubra. Tu trabajo es:

1. EXTRAER las respuestas del usuario a estas 10 preguntas clave del diagnóstico:
   - ¿Qué es lo que te inspira a trabajar cada día?
   - ¿Qué vendes y a qué sector te diriges?
   - ¿Qué emociones quieres que tu marca transmita a tus clientes?
   - ¿Cuál es el principal problema que enfrentas con respecto a tus ventas hoy?
   - ¿Hasta qué punto conoces a profundidad a tu cliente ideal y el problema específico que tu marca/empresa resuelve para ellos?
   - ¿Cómo describirías la experiencia que tus clientes viven al interactuar con tu marca?
   - ¿Qué tan visible eres a nivel digital?
   - ¿Qué objetivo refleja mejor lo que quieres lograr con tu marca a nivel digital?
   - ¿Cuáles son los recursos existentes que cuentas actualmente para mejorar tu presencia digital?
   - Cuando mires atrás, ¿qué te hará sentir que este proceso ha sido un éxito para tu negocio?

2. DETECTAR la etapa actual de la conversación:
   - "retratar": cuando Qubra está haciendo las primeras 3 preguntas (inspiración, qué vende, emociones)
   - "descomponer": cuando Qubra está haciendo las 4 preguntas de problemas
   - "reinterpretar": cuando Qubra está haciendo las 3 últimas preguntas de futuro
   - "completado": cuando Qubra ha confirmado el email y está cerrando

3. GENERAR insights visuales (máximo 3 por categoría):
   Para cada insight, indica:
   - categoria: "marketing" | "procesos" | "tecnologia"
   - titulo: máx 5 palabras
   - descripcion: 1-2 oraciones con el hallazgo clave
   - icono: uno de estos emojis según la categoría: 🎯 (marketing), ⚡ (procesos), 💻 (tecnología)

4. DETECTAR datos del usuario:
   - nombre
   - empresa
   - email (si lo ha proporcionado)

5. INDICAR progreso: número del 0 al 10 de preguntas respondidas

6. INDICAR si está completo: true/false

Responde ÚNICAMENTE en formato JSON con esta estructura exacta:

{
  "etapa": "retratar|descomponer|reinterpretar|completado",
  "progreso": 0-10,
  "completado": true|false,
  "datosUsuario": {
    "nombre": string|null,
    "empresa": string|null,
    "email": string|null
  },
  "respuestas": {
    "pregunta": "respuesta del usuario"
  },
  "insights": [
    {
      "categoria": "marketing|procesos|tecnologia",
      "titulo": string,
      "descripcion": string,
      "icono": string
    }
  ]
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages } = analyzeSchema.parse(body);

    const conversationText = messages
      .map((m) => `${m.role === "user" ? "Usuario" : "Qubra"}: ${m.content}`)
      .join("\n\n");

    const { text } = await generateText({
      model: google("gemini-3.1-flash-lite-preview"),
      system: analyzePrompt,
      prompt: conversationText,
      temperature: 0.3,
    });

    // Parsear el JSON de la respuesta
    let analysis;
    try {
      // Intentar extraer JSON si está envuelto en markdown
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      analysis = JSON.parse(jsonStr);
    } catch {
      analysis = {
        etapa: "retratar",
        progreso: 0,
        completado: false,
        datosUsuario: { nombre: null, empresa: null, email: null },
        respuestas: {},
        insights: [],
      };
    }

    return Response.json(analysis);
  } catch (error: any) {
    console.error("Analyze error:", error);
    console.error("Error message:", error?.message);
    console.error("Error cause:", error?.cause);
    return Response.json(
      {
        etapa: "retratar",
        progreso: 0,
        completado: false,
        datosUsuario: { nombre: null, empresa: null, email: null },
        respuestas: {},
        insights: [],
        _error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
