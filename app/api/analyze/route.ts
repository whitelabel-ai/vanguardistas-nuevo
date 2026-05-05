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

const analyzePrompt = `Eres Qubra, el analizador de diagnóstico empresarial de Vanguardistas.

Analiza esta conversación entre un usuario y Qubra. Extrae toda la información relevante y evalúa cada respuesta.

## Tu trabajo:

1. EXTRAER las respuestas del usuario a las 10 preguntas del diagnóstico:
   - P1 (Filtro): ¿Cuál es el síntoma que más te duele? (A=Invisibilidad, B=Fricción)
   - P2 (Identidad): Nombre, empresa y correo del usuario
   - P3 (Qué vende): Descripción del producto/servicio
   - P4 (Sector): Sector al que pertenece la empresa
   - P5 (Origen o Problema): Según camino A o B
   - P6 (Nicho o Proceso): Según camino A o B
   - P7 (Meta): Según camino A o B
   - P8 (Sitio Web): URL o "no tengo"
   - P9 (Equipo): Tamaño del equipo
   - P10 (Diferencial): Valor único

2. EVALUAR cada respuesta en escala 1-10:
   - 1-4: Respuestas como "No sé", "No tengo", "Manual", "Referidos solamente", "A todo el mundo"
   - 5-7: Algo implementado pero inconsistente o empírico
   - 8-10: Claridad absoluta, procesos claros, herramientas de medición

3. CALCULAR ÍNDICES:
   - Si camino A (Invisibilidad):
     - marketing_score = promedio(P5, P6, P7, P8, P9)
     - experiencia_score = estimado basado en P8, P9, P10 (o 5 por defecto si no hay datos)
   - Si camino B (Fricción):
     - experiencia_score = promedio(P5, P6, P7, P8, P9)
     - marketing_score = estimado basado en P8, P9, P10 (o 5 por defecto)
   - global_score = ((marketing_score + experiencia_score) / 2) * 10

4. DETERMINAR NIVEL:
   - Nivel 1 (0-40): "El Lienzo en Blanco" — Fuga Alta
   - Nivel 2 (41-70): "El Impresionista Difuso" — Fuga Media
   - Nivel 3 (71-100): "El Visionario Encerrado" — Fuga Baja

5. DETECTAR CLIENTE POTENCIAL:
   - true si P9 indica más de 5 personas en el equipo

6. DETERMINAR FUGA PRINCIPAL e INTERVENCIÓN URGENTE:
   - Si marketing_score < 5: fuga_principal = "Invisibilidad Selectiva", intervencion = "Boceto de Atracción"
   - Si experiencia_score < 5: fuga_principal = "Fricción en el Proceso", intervencion = "Restauración de Proceso"
   - Si ambos >= 5: fuga_principal = "Techo de Cristal", intervencion = "Expansión de Galería"

7. GENERAR insights (máx 3):
   - categoria: "marketing" | "procesos" | "tecnologia"
   - titulo: máx 5 palabras
   - descripcion: 1-2 oraciones
   - icono: 🎨 (marketing), ⚡ (procesos), 🖼️ (tecnologia)

8. DETECTAR datos del usuario:
    - nombre, empresa, email

9. INDICAR progreso: 0-10 (número de preguntas respondidas)

10. INDICAR si está completo: true/false (true solo si progreso >= 10)

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
    "P1": "A o B",
    "P2": "nombre, empresa y email",
    "P3": "qué vende",
    "P4": "sector",
    ...
  },
  "camino": "A|B|null",
  "scores": {
    "marketing": 0-10,
    "experiencia": 0-10,
    "global": 0-100
  },
  "nivel": 1|2|3|null,
  "esClientePotencial": true|false,
  "fugaPrincipal": string,
  "intervencionUrgente": string,
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
      } else if (progreso <= 7) {
        etapaForzada = "reinterpretar";
      } else {
        etapaForzada = "completado";
      }
      analysis.etapa = etapaForzada;
      analysis.completado = progreso >= 8;
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
  } catch (error: any) {
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
        _error: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
