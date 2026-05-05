"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";
import { X, Zap, Target, BarChart3, ArrowRight, Calendar, Quote, Sparkles, Palette, Frame, Landmark, Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Scores } from "../hooks/useLiveAnalysis";

/* ───────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────── */
interface DiagnosisPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  nombre: string;
  informe: string;
  scores: Scores;
  nivel: number | null;
  camino: string | null;
  esClientePotencial: boolean;
  fugaPrincipal: string;
  intervencionUrgente: string;
}

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */

function parseMarkdownSections(raw: string) {
  // Remove leading # title (we render it as the hero)
  const withoutH1 = raw.replace(/^#\s+.*\n?/m, "").trim();
  // Split by ## headings
  const blocks = withoutH1.split(/\n##\s+/);
  return blocks
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      const firstLineBreak = b.indexOf("\n");
      const title = firstLineBreak > -1 ? b.slice(0, firstLineBreak).trim() : b;
      const body = firstLineBreak > -1 ? b.slice(firstLineBreak + 1).trim() : "";
      return { title, body: `## ${title}\n${body}` };
    });
}

function getBarColor(score: number) {
  if (score <= 4) return "#EF5095";
  if (score <= 7) return "#FFC906";
  return "#54D1A2";
}

const sectionIcon: Record<string, React.ReactNode> = {
  "El Estado de tu Obra Digital": <BarChart3 className="w-4 h-4" />,
  "La Fuga Detectada": <Target className="w-4 h-4" />,
  "Plan de Acción Táctico": <Zap className="w-4 h-4" />,
  "El Gancho": <Sparkles className="w-4 h-4" />,
};

/* ───────────────────────────────────────────────
   Sub-components
   ─────────────────────────────────────────────── */

function FloatingShape({ src, className }: { src: string; className: string }) {
  return (
    <motion.img
      src={src}
      alt=""
      className={`absolute pointer-events-none select-none opacity-[0.04] ${className}`}
      animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function Thermometer({ label, score }: { label: string; score: number }) {
  const color = getBarColor(score);
  const glow = `0 0 12px ${color}40`;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#E8E4F5]/50 font-medium">{label}</span>
        <span className="text-lg font-bold tabular-nums" style={{ color, textShadow: `0 0 16px ${color}50` }}>
          {score}<span className="text-sm text-[#E8E4F5]/30">/10</span>
        </span>
      </div>
      <div className="h-3 bg-white/[0.04] rounded-full overflow-hidden ring-1 ring-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
          className="h-full rounded-full relative"
          style={{ backgroundColor: color, boxShadow: glow }}
        >
          <div className="absolute inset-0 rounded-full scanner-line" />
        </motion.div>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ backgroundColor: i < score ? color : "rgba(255,255,255,0.06)" }}
          />
        ))}
      </div>
    </div>
  );
}

function NivelBadgeLarge({ nivel }: { nivel: number | null }) {
  if (!nivel) return null;
  const niveles: Record<number, { nombre: string; icon: React.ReactNode; color: string; desc: string; tagline: string }> = {
    1: { nombre: "El Lienzo en Blanco", icon: <Palette className="w-6 h-6" />, color: "#EF5095", desc: "Fuga Alta", tagline: "Construcción desde cero" },
    2: { nombre: "El Impresionista Difuso", icon: <Frame className="w-6 h-6" />, color: "#FFC906", desc: "Fuga Media", tagline: "Definición y optimización" },
    3: { nombre: "El Visionario Encerrado", icon: <Landmark className="w-6 h-6" />, color: "#54D1A2", desc: "Fuga Baja", tagline: "Escala y automatización" },
  };
  const info = niveles[nivel];
  if (!info) return null;

  return (
    <div className="gradient-border-card p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${info.color}15`, border: `1px solid ${info.color}30`, color: info.color }}
        >
          {info.icon}
        </div>
        <div className="min-w-0">
          <p className="text-base font-bold leading-tight" style={{ color: info.color, textShadow: `0 0 16px ${info.color}40` }}>
            {info.nombre}
          </p>
          <p className="text-[11px] text-[#E8E4F5]/40 mt-1 uppercase tracking-wider">
            {info.desc} — {info.tagline}
          </p>
        </div>
      </div>
    </div>
  );
}

function MarkdownSectionCard({
  title,
  body,
  index,
}: {
  title: string;
  body: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: "easeOut", delay: index * 0.08 }}
      className="gradient-border-card p-6 sm:p-8"
    >
      {/* Section header with icon */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8E58A4]/20 to-[#EF5095]/20 flex items-center justify-center text-[#FFC906]">
          {sectionIcon[title] || <Sparkles className="w-4 h-4" />}
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-[#FFC906] gradient-text">{title}</h2>
      </div>

      <div className="prose prose-invert prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          rehypePlugins={[rehypeSanitize]}
          components={{
            h1: ({ children }) => <h1 className="text-2xl font-bold text-[#EF5095] mt-4 mb-3 first:mt-0 glow-text">{children}</h1>,
            h2: ({ children }) => <h2 className="text-lg font-semibold text-[#FFC906] mt-5 mb-2">{children}</h2>,
            h3: ({ children }) => <h3 className="text-base font-semibold text-[#CE8900] mt-4 mb-2">{children}</h3>,
            p: ({ children }) => <p className="text-[15px] text-white/80 leading-relaxed mb-4 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
            em: ({ children }) => <em className="italic text-white/70">{children}</em>,
            ul: ({ children }) => <ul className="space-y-2.5 mb-4 text-white/80">{children}</ul>,
            ol: ({ children }) => <ol className="space-y-2.5 mb-4 text-white/80">{children}</ol>,
            li: ({ children }) => (
              <li className="text-[15px] text-white/80 leading-relaxed flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8E58A4] shrink-0 dot-glow" />
                <span>{children}</span>
              </li>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#54D1A2] hover:text-[#8E58A4] underline underline-offset-4 decoration-[#54D1A2]/30 hover:decoration-[#8E58A4] transition-all"
              >
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <blockquote className="relative my-5 pl-5 pr-4 py-3 bg-white/[0.02] rounded-r-2xl border-l-[3px] border-[#8E58A4]">
                <Quote className="absolute top-2 right-3 w-5 h-5 text-[#8E58A4]/20" />
                <div className="text-white/70 italic text-[15px] leading-relaxed">{children}</div>
              </blockquote>
            ),
            hr: () => <hr className="border-white/[0.06] my-6" />,
            table: ({ children }) => <table className="w-full text-sm text-left text-white/80 border border-white/[0.08] rounded-xl overflow-hidden mb-4">{children}</table>,
            thead: ({ children }) => <thead className="bg-white/[0.04] text-xs uppercase text-[#E8E4F5]/50">{children}</thead>,
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => <tr className="border-b border-white/[0.06] last:border-b-0">{children}</tr>,
            th: ({ children }) => <th className="px-4 py-3 font-medium">{children}</th>,
            td: ({ children }) => <td className="px-4 py-3">{children}</td>,
            code: ({ children }) => <code className="px-1.5 py-0.5 rounded bg-white/[0.08] text-[#EF5095] text-[13px] font-mono">{children}</code>,
          }}
        >
          {body}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────
   Main Component
   ─────────────────────────────────────────────── */

export function DiagnosisPreview({
  isOpen,
  onClose,
  nombre,
  informe,
  scores,
  nivel,
  camino,
  esClientePotencial,
  fugaPrincipal,
  intervencionUrgente,
}: DiagnosisPreviewProps) {
  const sections = useMemo(() => parseMarkdownSections(informe), [informe]);
  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const fugaCategory =
    fugaPrincipal.toLowerCase().includes("invisibilidad") ? "marketing" :
    fugaPrincipal.toLowerCase().includes("fricción") ? "procesos" : "tecnologia";

  const neonBorderClass =
    fugaCategory === "marketing" ? "border-neon-marketing" :
    fugaCategory === "procesos" ? "border-neon-procesos" : "border-neon-tecnologia";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[60] bg-[#090A12] overflow-y-auto"
        >
          {/* ── Ambient background ── */}
          <div className="fixed inset-0 mesh-gradient-bg-v2 pointer-events-none" />

          {/* ── Decorative floating shapes ── */}
          <FloatingShape src="/img/home-10/hero/hero-shape.png" className="top-[10%] right-[5%] w-64 h-64" />
          <FloatingShape src="/img/home-10/hero/hero-round-shape.png" className="bottom-[15%] left-[3%] w-48 h-48" />
          <FloatingShape src="/img/home-10/testimonial/testimonial-shape-1.png" className="top-[40%] left-[8%] w-32 h-32" />
          <FloatingShape src="/img/home-10/testimonial/testimonial-shape-2.png" className="top-[60%] right-[6%] w-40 h-40" />

          {/* ── Sticky Header ── */}
          <motion.header
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="sticky top-0 z-50 bg-[#0B0B16]/80 backdrop-blur-xl border-b border-white/[0.06]"
          >
            {/* Gradient line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-[#8E58A4] via-[#EF5095] to-[#FFC906]" />

            <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <img
                  src="/img/logo-vanguardistas.png"
                  alt="Vanguardistas"
                  className="h-8 w-auto object-contain opacity-90"
                />
                <div className="h-6 w-px bg-white/[0.08]" />
                <div>
                  <h2 className="text-sm font-semibold text-white">Mapa de Fugas</h2>
                  <p className="text-[11px] text-[#E8E4F5]/40">
                    {nombre} · {new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                type="button"
                aria-label="Cerrar diagnóstico"
                className="group p-2.5 rounded-xl text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </motion.header>

          {/* ── Main content ── */}
          <main className="relative max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-10 sm:py-16">
            {/* ── Compact hero ── */}
            <motion.div
              ref={heroRef}
              initial={{ opacity: 0, y: 12 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
              className="mb-6 sm:mb-8"
            >
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                <span className="gradient-text">Mapa de Fugas</span>
                <span className="text-white/80"> · {nombre}</span>
              </h1>
            </motion.div>

            {/* ── Two-column layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-10">
              {/* ═══════ LEFT COLUMN: Diagnosis ═══════ */}
              <div className="space-y-6">
                {sections.map((sec, i) => (
                  <MarkdownSectionCard key={i} title={sec.title} body={sec.body} index={i} />
                ))}

                {/* ── CTA Card ── */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.55, delay: sections.length * 0.08 }}
                  className="gradient-border-card p-8 sm:p-10 text-center space-y-5"
                >
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#EF5095]/20 to-[#8E58A4]/20 flex items-center justify-center">
                    <Calendar className="w-7 h-7 text-[#FFC906]" />
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold gradient-text-cyan mb-2">
                      Sesión de Curaduría Estratégica
                    </p>
                    <p className="text-sm sm:text-base text-white/50 max-w-md mx-auto leading-relaxed">
                      Una sesión gratuita de 30 minutos para profundizar en tu Mapa de Fugas
                      y diseñar un plan de acción a medida.
                    </p>
                  </div>
                  <a
                    href="https://calendar.app.google/Y2tWzCWbTpm7Kage6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <Button className="h-14 px-10 gradient-btn rounded-2xl font-semibold text-base">
                      Reclamar mi sesión gratuita
                      <ArrowRight className="w-5 h-5 ml-1" />
                    </Button>
                  </a>
                </motion.div>

                <div className="h-12" />
              </div>

              {/* ═══════ RIGHT COLUMN: Heat Map (sticky) ═══════ */}
              <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
                {/* Score Global */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="gradient-border-card p-6 sm:p-8 text-center"
                >
                  <p className="text-[11px] text-[#E8E4F5]/40 uppercase tracking-widest mb-3">Salud Comercial</p>
                  <motion.p
                    className="text-5xl sm:text-6xl font-bold glow-text tabular-nums"
                    style={{ color: getBarColor(scores.global) }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                  >
                    {scores.global}
                    <span className="text-xl text-[#E8E4F5]/20 ml-1">/100</span>
                  </motion.p>
                  <div className="mt-4 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scores.global}%` }}
                      transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: getBarColor(scores.global) }}
                    />
                  </div>
                </motion.div>

                {/* Nivel */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  <NivelBadgeLarge nivel={nivel} />
                </motion.div>

                {/* Termómetros */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.45 }}
                  className="gradient-border-card p-6 space-y-5"
                >
                  <p className="text-[11px] text-[#E8E4F5]/40 uppercase tracking-widest">Indicadores</p>
                  <Thermometer label="Atracción (Marketing)" score={scores.marketing} />
                  <Thermometer label="Conversión (Experiencia)" score={scores.experiencia} />
                </motion.div>

                {/* Síntoma */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.55 }}
                  className="gradient-border-card p-5"
                >
                  <p className="text-[11px] text-[#E8E4F5]/40 uppercase tracking-widest mb-2">Síntoma Detectado</p>
                  <p className="text-base font-semibold text-white flex items-center gap-2">
                    {camino === "A" ? (
                      <Eye className="w-5 h-5 text-[#8E58A4]" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-[#FFC906]" />
                    )}
                    {camino === "A" ? "Invisibilidad" : "Fricción"}
                  </p>
                </motion.div>

                {/* Cliente Potencial */}
                {esClientePotencial && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="gradient-border-card p-5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFC906]/10 border border-[#FFC906]/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-[#FFC906]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#FFC906]">⭐ Cliente Potencial</p>
                        <p className="text-[11px] text-[#E8E4F5]/40">Prioridad de contacto</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Fuga Principal */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.65 }}
                  className={`p-5 rounded-2xl bg-white/[0.02] ${neonBorderClass}`}
                >
                  <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: getBarColor(scores.global) }}>
                    Fuga Principal
                  </p>
                  <p className="text-base font-bold text-white mb-2">{fugaPrincipal}</p>
                  <p className="text-sm text-[#E8E4F5]/50 leading-relaxed">{intervencionUrgente}</p>
                </motion.div>
              </aside>
            </div>

            {/* ── Footer spacer ── */}
            <div className="h-20" />
          </main>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
