import { NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { DiagnosticoPDF } from "./DiagnosticoPDF";

const pdfSchema = z.object({
  nombre: z.string(),
  empresa: z.string().optional(),
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
  informe: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = pdfSchema.parse(body);

    const buffer = await renderToBuffer(
      <DiagnosticoPDF data={data} />
    );

    const uint8Array = new Uint8Array(buffer);

    return new Response(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="mapa-de-fugas-${data.nombre}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return Response.json({ error: "Error generando PDF" }, { status: 500 });
  }
}
