<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Vanguardistas — Diagnóstico Qubra

App Next.js que ejecuta un diagnóstico conversacional ("Mapa de Fugas") a empresarios via un agente Gemini llamado **Qubra**. Al cerrar las 10 preguntas se genera un informe en Markdown, se renderiza a PDF y se envía por correo a través de un webhook de n8n.

## Stack

- **Next.js 16.2.4** (App Router) con **React 19.2.4**
- **Node 22.x** (pinned en `package.json` y `.nvmrc`)
- **TypeScript** estricto
- **Tailwind v4** (config en `app/globals.css` y `postcss`)
- **AI SDK** + `@ai-sdk/google` (modelo `gemini-3.1-flash-lite-preview`)
- **`@react-pdf/renderer`** para generar el PDF del informe
- **Zod** para validación de payloads en todas las rutas API
- **Framer Motion** para animaciones del panel de análisis
- **Radix UI** (`@radix-ui/react-dialog`, `react-slot`) sólo para primitivos

## Comandos

```bash
npm run dev        # Next dev server
npm run build      # Build de producción
npm run start      # Servir build
npm run lint       # ESLint
npx tsc --noEmit   # Type check sin emitir
```

## Estructura

```
app/
  api/
    analyze/         POST → extrae datos + scores de la conversación (Gemini)
    chat-stream/     POST → streaming del agente Qubra (texto y audio)
    chat/            POST → variante non-streaming (legacy)
    informe/         POST → genera el informe Markdown final (Gemini)
    generate-pdf/    Renderiza DiagnosticoPDF a buffer
    send-diagnosis/  POST → genera PDF y dispara el webhook de n8n
  live/              Flujo principal del diagnóstico (chat + panel de análisis)
    LiveContainer.tsx   Orquestador (manejo de estado + auto-trigger de envío)
    components/         AnalysisPanel, ChatPanel, AnalysisSheet (mobile),
                        SendingModal, DiagnosisPreview, OnboardingScreen, etc.
    hooks/
      useChatStream.ts  Manejo de streaming + audio + mensajes
      useLiveAnalysis.ts Cálculo de análisis + envío + 3 capas anti-spam
    data/bancoPreguntas.ts  Banco de las 10 preguntas
  legacy/            Versión anterior del diagnóstico
  resumen/           Página de resumen del informe
  about/, privacypolicy/, termsandconditions/
components/
  chat/              Componentes de chat reutilizados en /legacy
  layout/            Header, Footer, Analytics
  ui/                Primitivos shadcn-style (Button, Dialog, Textarea)
```

## Variables de entorno

Ver `.env.example`. Las críticas:

| Variable | Uso |
|---|---|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini (requerido) |
| `N8N_INFORME_WEBHOOK_URL` | Webhook que recibe el diagnóstico + PDF (HTTPS obligatorio) |
| `N8N_WEBHOOK_SECRET` | Bearer token compartido con n8n |
| `SEND_DIAGNOSIS_RATE_LIMIT_MINUTES` | Cooldown server-side por correo (default 5) |
| `NEXT_PUBLIC_SEND_DIAGNOSIS_RATE_LIMIT_MINUTES` | Debe coincidir con el server |
| `GEMINI_TIMEOUT_MS` | Timeout de cada llamada a Gemini (default 25000) |
| `MAX_AUDIO_BYTES` | Tope de audio en chat-stream (default 10 MB) |

## Flujo de diagnóstico — qué hay que saber

1. **10 preguntas** (P1–P10): el filtro A/B en P1 define el "camino" (Invisibilidad o Fricción). Marca el set de P5–P7 que aplica.
2. **`analyze/route.ts`** se llama con todos los mensajes y devuelve `{ progreso, completado, datosUsuario, respuestas, scores, nivel, esClientePotencial, fugaPrincipal, intervencionUrgente, insights }`. La etapa se fuerza determinísticamente por progreso. **`completado` requiere `progreso == 10` Y que las 10 keys `P1..P10` tengan valor no vacío en `respuestas`.**
3. **`completado` + `email` + `nombre` presentes → auto-trigger** en `LiveContainer` genera el informe y lo envía. Solo se dispara una vez por correo distinto en la instancia (Set en `autoSentEmailsRef`).
4. **Si el usuario corrige el correo** después del cierre, el analyze prompt instruye a Gemini a devolver SIEMPRE el último correo mencionado. El nuevo correo no estará en el Set ni en el rate limit (que es por dirección), por lo que el sistema reenvía automáticamente.
5. **`informe`** se persiste en `localStorage` bajo `qubra-informe-<email>` y se reusa entre cargas del mismo correo.

## Política anti-spam (rate limit)

`useLiveAnalysis` aplica 3 capas:

- **`qubra-sent-emails`** (`localStorage`): registro permanente de correos a los que se envió.
- **`qubra-sent-this-session-<email>`** (`sessionStorage`): bloquea reenvíos en la misma pestaña aunque se monte/desmonte el componente.
- **`qubra-last-sent-<email>`** (`localStorage`): timestamp del último envío exitoso. La ventana es `SEND_DIAGNOSIS_RATE_LIMIT_MINUTES` (default 5 min).

`send-diagnosis/route.tsx` aplica el mismo cooldown server-side en memoria como defensa secundaria. **Cambiar el correo bypassa el límite — el rate limit es por dirección, no global.** Un envío fallido (n8n no-OK) NO marca el timestamp, por lo que el "Reintentar" funciona inmediatamente.

## Convenciones del repo

- **Normalización de email**: siempre `trim().toLowerCase()` antes de usar como clave.
- **Validación**: todas las rutas API usan `zod`. No aceptes payloads sin parsear.
- **Sanitización**: `analyze/route.ts` redacta intentos de prompt-injection (`System:`, `Assistant:` al inicio de líneas). Replica el patrón si añades rutas que reciben texto del usuario.
- **HTTPS obligatorio** para el webhook de n8n (validado en `send-diagnosis`).
- **Streams en chat**: `chat-stream/route.ts` acepta `multipart/form-data` con audio o JSON con mensajes; el tipo de audio se valida contra `ALLOWED_AUDIO_TYPES`.
- **Tono de Qubra** (sistema en `chat-stream`): metáforas artísticas breves, máximo 1 pregunta por mensaje, validaciones ≤25 palabras. No tocar sin razón.
- **Comentarios en código**: en español, sólo cuando el "por qué" no es obvio.
- **PR target**: `dev` (no `main`). Autor: `Propiter`. Sin atribuciones automáticas.

## Gotchas

- `useLiveAnalysis` re-corre `/api/analyze` con un debounce de 2s cada vez que cambian los mensajes. No agregues llamadas extra; usa el `analysis` que devuelve el hook.
- Las funciones expuestas por `useLiveAnalysis` (`isSessionSent`, `isRateLimited`, etc.) son **referencias estables** a funciones módulo. No las envuelvas en arrows nuevas: rompe la estabilidad de los efectos consumidores.
- El `informe` se genera con `nivel` y `scores` calculados en `analyze`. Si cambias la fórmula, sincroniza los templates en `informe/route.ts`.
- El PDF (`DiagnosticoPDF.tsx`) se renderiza server-side con `runtime = "nodejs"`. No metas APIs de browser ahí.
- `completado` requiere `progreso == 10` **Y** las 10 keys `P1..P10` con valor no vacío en `respuestas`. La doble verificación evita cierres prematuros si Gemini sobrestima `progreso`. P8 ("no tengo") y P10 ("no sé") cuentan como respondidas.
