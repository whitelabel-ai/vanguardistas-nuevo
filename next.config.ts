import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Incluye los .md de prompts/ en el bundle de las rutas serverless.
  // Sin esto, Vercel/contenedores podrían no copiar el directorio porque
  // no es un import directo de JS/TS — lo lee `lib/prompts.ts` con fs.
  outputFileTracingIncludes: {
    "/api/**/*": ["./prompts/**/*.md"],
  },
};

export default nextConfig;
