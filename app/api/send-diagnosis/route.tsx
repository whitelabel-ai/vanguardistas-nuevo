import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { DiagnosticoPDF } from "../generate-pdf/DiagnosticoPDF";

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

    const webhookUrl = process.env.N8N_INFORME_WEBHOOK_URL;
    if (!webhookUrl) {
      return Response.json(
        { error: "Webhook de n8n no configurado" },
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

    const payload: Record<string, any> = {
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
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("n8n webhook error:", response.status, errorText);
      return Response.json(
        { error: "Error enviando diagnóstico a n8n", details: errorText },
        { status: 502 }
      );
    }

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
