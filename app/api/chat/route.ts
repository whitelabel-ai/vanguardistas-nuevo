import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300; // 5 minutos para Vercel Pro

const WEBHOOK_URL = "https://automation.whitelabel.lat/webhook/Qubra";

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    let body: FormData | string;
    let headers: Record<string, string> = {};

    if (contentType.includes("multipart/form-data")) {
      // Audio upload (FormData)
      body = await request.formData();
      // FormData se pasa directamente a fetch, no necesita Content-Type manual
    } else {
      // JSON text message
      const json = await request.json();
      body = JSON.stringify(json);
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Webhook error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
