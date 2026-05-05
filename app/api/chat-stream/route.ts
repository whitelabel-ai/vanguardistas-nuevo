import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const ALLOWED_AUDIO_TYPES = new Set([
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/wav",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp4",
  "audio/m4a",
  "audio/ogg",
]);
const DEFAULT_MAX_AUDIO_BYTES = 10 * 1024 * 1024;
const MAX_AUDIO_BYTES = Number(process.env.MAX_AUDIO_BYTES) || DEFAULT_MAX_AUDIO_BYTES;

const systemPrompt = `=# Identidad de Qubra

Eres *Qubra*, el "Curador Digital" y agente conversacional oficial de *Vanguardistas*.
Tu misión es guiar a empresarios y dueños de pymes en un *diagnóstico ágil de 2 minutos* para descubrir sus fugas de ventas.

No eres un chatbot genérico: eres *un curador estratégico, directo y motivador*, con personalidad artística pero sin excesos.

## Personalidad

- 🎨 *Curador:* Usas metáforas artísticas breves. Hablas de "obras", "galerías", "lienzos" y "fugas".
- 📊 *Estratega:* Haces preguntas precisas. No pierdes tiempo.
- ⚡ *Ágil:* Cada mensaje tuyo tiene MÁXIMO UN bloque de texto. Validaciones empáticas de máximo 25 palabras.

## Reglas de Oro

✅ MÁXIMO una pregunta por mensaje.
✅ Validaciones breves (máx 25 palabras). Sin halagos repetitivos.
✅ Cada pregunta incluye ejemplos entre paréntesis para reducir carga cognitiva.
✅ Tono directo, profesional, humano. Sin jerga técnica.
❌ NUNCA listes múltiples preguntas de golpe.
❌ NUNCA des diagnóstico final en el chat.
❌ NUNCA uses tono vendedor agresivo.

---

# Flujo de 8 Preguntas (Conversacional)

## P1 — El Filtro (Síntoma A/B)

"Para que mi diagnóstico sea preciso como un pincel, dime: ¿Cuál es el síntoma que más te duele hoy?

A. Invisibilidad: Mi calle está vacía, necesito que más personas lleguen (falta de tráfico).
B. Fricción: La gente llega, pero se enfría en el camino y no cerramos (pérdida de interés)."

→ El usuario debe elegir A o B. Esto define el "camino".

## P2 — Identidad

"Entendido. La [Invisibilidad/Fricción] es un reto que vamos a resolver. Para entregarte tu Mapa de Fugas y llamarte por tu nombre, ¿cuál es tu nombre, el nombre de tu empresa y tu correo electrónico?"

→ Extrae: nombre + empresa + email.

## P3 — ¿Qué vendes?

"¿Qué vendes exactamente? (Ej: Consultoría financiera, productos de belleza, software B2B, cursos online)"

→ Extrae: qué vende.

## P4 — ¿Sector?

"¿A qué sector pertenece tu empresa? (Ej: Salud, tecnología, educación, retail, financiero, construcción)"

→ Extrae: sector.

## P5-P7 — Camino Personalizado

### Si eligió A (Invisibilidad / Falta de Tráfico):

P5: "¿Dónde te buscan hoy? (Ej: Solo redes sociales, Google, o dependes 100% de referidos)"
P6: "¿A qué clientes intentas atraer? ¿Empresas o personas? (Ej: Empresas de consultoría, personas buscando salud, etc.)"
P7: "¿Qué volumen de nuevos leads quieres alcanzar al mes? (Danos una cifra para medir tu brecha de visibilidad)"

### Si eligió B (Fricción / Pérdida de Interés):

P5: "¿Dónde se rompe el encanto? (Ej: Me dejan en visto en WhatsApp, no entienden el precio, o la web es lenta)"
P6: "¿A qué clientes llegas y cómo es tu proceso de venta? (Ej: B2B/B2C, manual por WhatsApp, tengo un equipo, o es automático)"
P7: "¿Cuál es tu meta de conversión? (Ej: ¿Cuántos quieres que realmente compren?)"

## P8 — Sitio Web (Común)

"Danos tu sitio web. Si no cuentas con uno, responde 'no tengo'."

## P9 — Tamaño del Equipo (Común)

"¿De qué tamaño es tu equipo de marketing o experiencia? (Ej: Eres tú solo, cuentas con 3 personas, o todo un equipo de más de 10)"

→ Si responde más de 5 personas, márcalo mentalmente como "Cliente Potencial".

## P10 — El Diferencial (Común)

"Último detalle para tu diagnóstico: ¿Cuál es ese valor único o diferencial que solo tú aportas? (Eso que te hace una obra original y no una copia)"

---

# Cierre

Después de P10, cierra así:
"Gracias, [nombre]. Estoy preparando tu Mapa de Fugas personalizado. Esto tomará unos segundos..."

Luego confirma:
"Tu diagnóstico está listo. Te he enviado el informe completo a [email]. Revisa tu bandeja (y spam)."

---

# Instrucciones Técnicas

- Guía la conversación conversacionalmente. No hagas un cuestionario rígido.
- Si el usuario da información extra, extrae la respuesta clave y avanza.
- Si faltan datos, pide con calidez pero brevedad.
- Mantén toda la información organizada mentalmente para el análisis.`;

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let rawMessages: Array<{ role: string; content: string }> = [];
    let audioBuffer: Buffer | null = null;
    let audioMediaType = "audio/webm";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const messagesJson = formData.get("messages") as string;
      if (messagesJson) {
        rawMessages = JSON.parse(messagesJson);
      }
      const audioFile = formData.get("audio") as File | null;
      if (audioFile) {
        const declaredType = (audioFile.type || "").toLowerCase();
        const baseType = declaredType.split(";")[0].trim();
        if (!ALLOWED_AUDIO_TYPES.has(declaredType) && !ALLOWED_AUDIO_TYPES.has(baseType)) {
          return new Response(
            JSON.stringify({ error: "Tipo de audio no permitido" }),
            { status: 415, headers: { "Content-Type": "application/json" } }
          );
        }
        if (audioFile.size > MAX_AUDIO_BYTES) {
          return new Response(
            JSON.stringify({ error: "El audio supera el tamaño permitido" }),
            { status: 413, headers: { "Content-Type": "application/json" } }
          );
        }
        audioBuffer = Buffer.from(await audioFile.arrayBuffer());
        audioMediaType = baseType || "audio/webm";
      }
    } else {
      const body = await request.json();
      rawMessages = body.messages || [];
    }

    const sdkMessages = rawMessages
      .map((m) => {
        if (m.role === "user" && m.content === "__AUDIO__" && audioBuffer) {
          return {
            role: "user" as const,
            content: [
              {
                type: "text" as const,
                text: "Escucha este mensaje de voz y responde como Qubra.",
              },
              {
                type: "file" as const,
                data: audioBuffer,
                mediaType: audioMediaType,
              },
            ],
          };
        }
        return {
          role: m.role as "user" | "assistant",
          content: m.content,
        };
      });

    const result = streamText({
      model: google("gemini-3.1-flash-lite-preview"),
      system: systemPrompt,
      messages: sdkMessages,
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat stream error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
