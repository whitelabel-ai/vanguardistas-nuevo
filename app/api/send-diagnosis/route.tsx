import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { DiagnosticoPDF } from "../generate-pdf/DiagnosticoPDF";

/* ── Odoo CRM Lead Creation ── */
async function createOdooLead(data: {
  nombre: string;
  email: string;
  empresa?: string;
  scores: { marketing: number; experiencia: number; global: number };
  nivel: number | null;
  esClientePotencial: boolean;
  fugaPrincipal: string;
  intervencionUrgente: string;
  camino: string | null;
  informe: string;
  sector?: string;
  queVenden?: string;
}) {
  const odooUrl = process.env.ODOO_URL;
  const odooDb = process.env.ODOO_DB;
  const odooUser = process.env.ODOO_USER;
  const odooApiKey = process.env.ODOO_API_KEY;

  if (!odooUrl || !odooDb || !odooUser || !odooApiKey) {
    console.warn("Odoo env vars missing, skipping lead creation");
    return;
  }

  const common = `${odooUrl}/xmlrpc/2/common`;
  const object = `${odooUrl}/xmlrpc/2/object`;

  try {
    // 1. Authenticate
    const authRes = await fetch(common, {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body: `<?xml version="1.0"?>
<methodCall>
  <methodName>authenticate</methodName>
  <params>
    <param><value><string>${odooDb}</string></value></param>
    <param><value><string>${odooUser}</string></value></param>
    <param><value><string>${odooApiKey}</string></value></param>
    <param><value><struct></struct></value></param>
  </params>
</methodCall>`,
    });
    const authText = await authRes.text();
    const uidMatch = authText.match(/<int>(\d+)<\/int>/);
    if (!uidMatch) {
      console.warn("Odoo auth failed, skipping lead", authText.slice(0, 200));
      return;
    }
    const uid = parseInt(uidMatch[1]);

    // 2. Build description (compacta, sin el informe completo)
    const descripcion = [
      `━━━ Diagnóstico Qubra ━━━`,
      ``,
      `Score Global: ${data.scores.global} (0-100)`,
      `Marketing: ${data.scores.marketing}/10 | Experiencia: ${data.scores.experiencia}/10`,
      `Nivel: ${data.nivel ?? "N/A"}/3 | Camino: ${data.camino || "N/A"}`,
      ``,
      `Fuga Principal: ${data.fugaPrincipal}`,
      `Intervención Urgente: ${data.intervencionUrgente}`,
      `Cliente Potencial: ${data.esClientePotencial ? "Sí" : "No"}`,
      `Sector: ${data.sector || "N/A"} | Venden: ${data.queVenden || "N/A"}`,
    ].join("\n");

    // 3. Create lead with stage_id=1 (Fase 1: Entrada y Diagnostico (Qubra))
    // NOTA: XML-RPC en Odoo 19 no parsea bien template literals multi-línea.
    // El XML debe ir en UNA SOLA línea o falla con "mismatched tag".
    const descEscaped = escXml(descripcion);
    const leadName = escXml(`${data.nombre} - Diagnóstico Qubra`);
    const contactName = escXml(data.nombre);
    const email = escXml(data.email);
    const empresa = escXml(data.empresa || "");

    // 3a. Create lead (sin x_qubra_score para evitar que Odoo lo ignore)
    const createRes = await fetch(object, {
      method: "POST",
      headers: { "Content-Type": "text/xml" },
      body: `<?xml version="1.0"?><methodCall><methodName>execute_kw</methodName><params><param><value><string>${odooDb}</string></value></param><param><value><int>${uid}</int></value></param><param><value><string>${odooApiKey}</string></value></param><param><value><string>crm.lead</string></value></param><param><value><string>create</string></value></param><param><value><array><data><value><struct><member><name>name</name><value><string>${leadName}</string></value></member><member><name>contact_name</name><value><string>${contactName}</string></value></member><member><name>email_from</name><value><string>${email}</string></value></member><member><name>partner_name</name><value><string>${empresa}</string></value></member><member><name>stage_id</name><value><int>1</int></value></member><member><name>type</name><value><string>opportunity</string></value></member><member><name>description</name><value><string>${descEscaped}</string></value></member></struct></value></data></array></value></param></params></methodCall>`,
    });
    const createText = await createRes.text();
    const leadIdMatch = createText.match(/<int>(\d+)<\/int>/);
    const leadId = leadIdMatch ? parseInt(leadIdMatch[1]) : null;
    console.log("Odoo lead created, id:", leadId);

    // 3b. Write x_qubra_score separately (más fiable que en create)
    if (leadId) {
      const scoreValue = data.scores.global;
      const writeRes = await fetch(object, {
        method: "POST",
        headers: { "Content-Type": "text/xml" },
        body: `<?xml version="1.0"?><methodCall><methodName>execute_kw</methodName><params><param><value><string>${odooDb}</string></value></param><param><value><int>${uid}</int></value></param><param><value><string>${odooApiKey}</string></value></param><param><value><string>crm.lead</string></value></param><param><value><string>write</string></value></param><param><value><array><data><value><array><data><value><int>${leadId}</int></value></data></array></value></data></array></value></param><param><value><struct><member><name>x_qubra_score</name><value><int>${scoreValue}</int></value></member></struct></value></param></params></methodCall>`,
      });
      const writeText = await writeRes.text();
      // Extraer faultString del XML de error
      const faultMatch = writeText.match(/<name>faultString<\/name>\s*<value><string>([\s\S]*?)<\/string><\/value>/);
      const errorMsg = faultMatch ? faultMatch[1].slice(0, 500) : writeText.slice(0, 300);
      console.log("Odoo x_qubra_score write error:", errorMsg);
    }
  } catch (err) {
    console.warn("Odoo lead creation failed (non-blocking):", err);
  }
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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

    /* ── Crear lead en Odoo (no bloqueante: si falla, el diagnóstico ya se envió) ── */
    createOdooLead({
      nombre: userData.nombre,
      email: userData.email,
      empresa: userData.empresa,
      scores,
      nivel,
      esClientePotencial,
      fugaPrincipal,
      intervencionUrgente,
      camino,
      informe,
      sector,
      queVenden,
    });

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
