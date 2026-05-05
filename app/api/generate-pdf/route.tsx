import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { DiagnosticoPDF } from "./DiagnosticoPDF";

export const runtime = "nodejs";
export const maxDuration = 30;

const pdfSchema = z.object({
  nombre: z.string().max(200),
  empresa: z.string().max(200).optional(),
  camino: z.string().max(50).nullable(),
  scores: z.object({
    marketing: z.number(),
    experiencia: z.number(),
    global: z.number(),
  }),
  nivel: z.number().min(1).max(3).nullable(),
  esClientePotencial: z.boolean(),
  fugaPrincipal: z.string().max(500),
  intervencionUrgente: z.string().max(500),
  informe: z.string().max(50000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = pdfSchema.parse(body);

    const buffer = await renderToBuffer(
      <DiagnosticoPDF data={data} />
    );

    const uint8Array = new Uint8Array(buffer);
    const safeFilename = data.nombre
      .normalize("NFKD")
      .replace(/[^\w\d-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "diagnostico";

    return new Response(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="mapa-de-fugas-${safeFilename}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return Response.json({ error: "Error generando PDF" }, { status: 500 });
  }
}
