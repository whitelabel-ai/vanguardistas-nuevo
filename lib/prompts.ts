import { readFileSync } from "node:fs";
import path from "node:path";

const cache = new Map<string, string>();

/**
 * Lee un prompt desde `prompts/<name>.md` (relativo al root del proyecto).
 * El archivo se cachea en memoria tras la primera lectura — los .md son
 * inmutables en runtime, así que el cold-start paga el I/O una vez por
 * proceso y las llamadas siguientes son lookups O(1).
 *
 * Para que Vercel / contenedores incluyan los .md en el bundle, ver
 * `outputFileTracingIncludes` en `next.config.ts`.
 */
export function loadPrompt(name: string): string {
  const cached = cache.get(name);
  if (cached !== undefined) return cached;

  const filepath = path.join(process.cwd(), "prompts", `${name}.md`);
  const content = readFileSync(filepath, "utf-8");
  cache.set(name, content);
  return content;
}
