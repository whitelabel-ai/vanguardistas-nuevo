import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { DiagnosticoPDF } from "../generate-pdf/DiagnosticoPDF";

export const runtime = "nodejs";
export const maxDuration = 60;

const sendDiagnosisSchema = z.object({
  userData: z.object({
    nombre: z.string(),
    email: z.string().email(),
    empresa: z.string().optional(),
  }),
  respuestas: z.record(z.string(), z.string()),
  informe: z.string(),
  camino: z.string().nullable(),
  scores: z.object({
    marketing: z.number(),
    experiencia: z.number(),
    global: z.number(),
  }),
  nivel: z.number().min(1).max(3).nullable(),
  esClientePotencial: z.boolean(),
  fugaPrincipal: z.string(),
  intervencionUrgente: z.string(),
  sector: z.string().optional(),
  queVenden: z.string().optional(),
});

/* ── Rate limiting en memoria (server-side) ──
   Ventana configurable (default 5 min) por dirección de correo. Es defensa
   secundaria contra clicks repetidos: el rate limit "real" lo aplica el
   cliente con localStorage y persiste entre requests. Cambiar el correo
   bypassa el límite (la clave es el email). */
const RATE_LIMIT_MINUTES = Number(process.env.SEND_DIAGNOSIS_RATE_LIMIT_MINUTES) || 5;
const RATE_LIMIT_MS = RATE_LIMIT_MINUTES * 60 * 1000;
const lastSentMap = new Map<string, number>();

function isRateLimited(email: string): boolean {
  const lastSent = lastSentMap.get(email);
  if (!lastSent) return false;
  return Date.now() - lastSent < RATE_LIMIT_MS;
}

function markAsSent(email: string) {
  lastSentMap.set(email, Date.now());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userData,
      respuestas,
      informe,
      camino,
      scores,
      nivel,
      esClientePotencial,
      fugaPrincipal,
      intervencionUrgente,
      sector,
      queVenden,
    } = sendDiagnosisSchema.parse(body);

    /* ── Rate limit server-side (5 min por correo) ── */
    if (isRateLimited(userData.email)) {
      console.warn("Rate limited:", userData.email);
      return Response.json(
        {
          success: false,
          message: "Acabamos de enviar un diagnóstico a este correo. Intenta de nuevo en unos minutos.",
        },
        { status: 429 }
      );
    }

    const webhookUrl = process.env.N8N_INFORME_WEBHOOK_URL;
    const webhookSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!webhookUrl) {
      return Response.json(
        { error: "Webhook de n8n no configurado" },
        { status: 500 }
      );
    }

    if (!/^https:\/\//i.test(webhookUrl)) {
      console.error("Webhook URL inseguro (debe usar HTTPS):", webhookUrl);
      return Response.json(
        { error: "Configuración de webhook inválida" },
        { status: 500 }
      );
    }

    let pdfBase64 = "";
    try {
      const buffer = await renderToBuffer(
        <DiagnosticoPDF
          data={{
            nombre: userData.nombre,
            empresa: userData.empresa,
            camino,
            scores,
            nivel,
            esClientePotencial,
            fugaPrincipal,
            intervencionUrgente,
            informe,
          }}
        />
      );
      pdfBase64 = Buffer.from(buffer).toString("base64");
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
    }

    const payload: Record<string, unknown> = {
      user_name: userData.nombre,
      user_email: userData.email,
      user_empresa: userData.empresa || "",
      Sector: sector || "",
      Que_venden: queVenden || "",
      camino: camino || "",
      scores_marketing: scores.marketing,
      scores_experiencia: scores.experiencia,
      scores_global: scores.global,
      nivel: nivel || 0,
      es_cliente_potencial: esClientePotencial,
      fuga_principal: fugaPrincipal,
      intervencion_urgente: intervencionUrgente,
      informe_markdown: informe,
      pdf_base64: pdfBase64,
      ...respuestas,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(webhookSecret ? { Authorization: `Bearer ${webhookSecret}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("n8n webhook error:", response.status, errorText);
      return Response.json(
        { error: "Error enviando diagnóstico a n8n", details: errorText },
        { status: 502 }
      );
    }

    /* ── Marcar como enviado solo si n8n respondió OK ── */
    markAsSent(userData.email);

    const data = await response.json();
    return Response.json({
      success: true,
      message: "Diagnóstico enviado exitosamente",
      n8nResponse: data,
    });
  } catch (error) {
    console.error("Send diagnosis error:", error);
    return Response.json(
      { error: "Error procesando solicitud de envío" },
      { status: 500 }
    );
  }
}
