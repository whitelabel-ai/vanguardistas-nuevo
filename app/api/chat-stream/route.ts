import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { NextRequest } from "next/server";
import { loadPrompt } from "@/lib/prompts";

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

const systemPrompt = loadPrompt("qubra-chat");


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
