"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

/* ─── easing ─────────────────────────────────────────────── */
type EaseFn = (t: number) => number;
const smooth: EaseFn = (t) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;

/* ─── animation variants ─────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: smooth } },
};
const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: smooth } },
});
const slideLeft = {
  hidden: { opacity: 0, x: -24 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.5, ease: smooth } },
};

/* ─── reusable viewport config ───────────────────────────── */
const vp = { once: true, margin: "0px 0px -60px 0px" };

/* ─── section label ──────────────────────────────────────── */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-fucsia text-[11px] font-medium tracking-[0.2em] uppercase mb-4">
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════ */
export default function HomePage() {
  return (
    <div className="bg-black text-white overflow-x-hidden">

      {/* ── 1. HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute top-[10%] -left-[10%] w-96 h-96 rounded-full bg-verde/[0.07] blur-[100px]" />
        <div className="pointer-events-none absolute bottom-[-60px] -right-[40px] w-[500px] h-[500px] rounded-full bg-fucsia/[0.12] blur-[120px]" />

        <div className="max-w-[1200px] mx-auto px-5 w-full">
          <div className="grid grid-cols-1 md:grid-cols-[52fr_48fr] gap-10 md:gap-12 items-center">

            {/* Copy */}
            <div>
              <motion.div
                variants={stagger(0.1)}
                initial="hidden" animate="show"
                className="inline-flex items-center gap-2 px-4 py-2 mb-7 border border-fucsia/30 bg-fucsia/[0.06] rounded-full text-[13px] text-white/80"
              >
                <span className="w-2 h-2 rounded-full bg-verde animate-pulse-dot" />
                Diagnóstico gratis con Qubra — 5 minutos
              </motion.div>

              <motion.h1
                variants={stagger(0.2)}
                initial="hidden" animate="show"
                className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[clamp(28px,5.5vw,64px)] leading-[1.12] tracking-tight mb-5"
                style={{ letterSpacing: "-0.025em" }}
              >
                Tu negocio no tiene un problema de ventas.
                Tiene{" "}
                <span className="text-fucsia relative inline-block">
                  fugas
                  <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-sm bg-gradient-to-r from-[#EF5095] to-[#E2B100]" />
                </span>
                {" "}que nadie te ha mostrado.
              </motion.h1>

              <motion.p
                variants={stagger(0.3)}
                initial="hidden" animate="show"
                className="text-[clamp(15px,2vw,18px)] text-white/55 leading-relaxed max-w-[520px] mb-9"
              >
                Detectamos exactamente dónde se está escapando tu dinero y lo sellamos con estrategia, narrativa e inteligencia artificial.
              </motion.p>

              <motion.div
                variants={stagger(0.4)}
                initial="hidden" animate="show"
                className="flex flex-col sm:flex-row gap-3 mb-5"
              >
                <Link href="#qubra">
                  <button className="btn-cta-landing inline-flex items-center gap-2 px-7 py-4 rounded-2xl text-[15px] font-bold">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    Encontrar mis fugas — gratis
                  </button>
                </Link>
                <Link href="#como-funciona">
                  <button className="inline-flex items-center gap-2 px-6 py-4 border border-white/12 rounded-2xl text-[14px] text-white/75 hover:border-white/25 hover:text-white transition-colors">
                    Ver cómo funciona
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                  </button>
                </Link>
              </motion.div>

              <motion.p variants={stagger(0.5)} initial="hidden" animate="show" className="text-[12px] text-white/30 tracking-wide">
                Sin tarjeta. Sin compromisos. Solo claridad.
              </motion.p>
            </div>

            {/* Image */}
            <motion.div
              variants={stagger(0.2)}
              initial="hidden" animate="show"
              className="relative flex justify-center overflow-hidden md:overflow-visible"
            >
              <div className="relative max-h-[320px] md:max-h-none overflow-hidden md:overflow-visible rounded-2xl md:rounded-none">
                <Image
                  src="/img/hero-img.png"
                  alt="Vanguardistas — Transformación digital"
                  width={520}
                  height={520}
                  className="w-full max-w-[300px] md:max-w-full animate-float"
                  style={{ filter: "drop-shadow(0 32px 64px rgba(239,80,149,0.25))" }}
                  priority
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 2. PAIN ─────────────────────────────────────────── */}
      <section className="py-20 border-t border-white/[0.04] bg-white/[0.015]">
        <div className="max-w-[1200px] mx-auto px-5">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={vp}>
            <Label>El problema real</Label>
            <h2 className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[clamp(28px,5.5vw,64px)] leading-tight tracking-tight mb-1">
              ¿Te suena esto?
            </h2>
            <div className="w-12 h-0.5 bg-gradient-to-r from-[#EF5095] to-[#E2B100] rounded mt-5 mb-10" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { n: "01", text: <>Invertiste en marketing pero <strong className="text-white font-medium">los leads que llegan no compran.</strong></> },
              { n: "02", text: <>Tu marca se ve <strong className="text-white font-medium">"bien"</strong> pero no convierte. Nunca entiendes por qué.</> },
              { n: "03", text: <>Cambiaste de agencia y <strong className="text-white font-medium">el resultado fue exactamente el mismo.</strong></> },
              { n: "04", text: <>Tu equipo trabaja, atiende, responde — y el negocio <strong className="text-white font-medium">no crece como debería.</strong></> },
            ].map((item, i) => (
              <motion.div
                key={item.n}
                variants={stagger(i * 0.08)}
                initial="hidden" whileInView="show" viewport={vp}
                className="group bg-[rgba(40,40,40,0.8)] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden hover:border-fucsia/25 transition-colors"
              >
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#EF5095] to-[#E2B100] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300" />
                <p className="text-[11px] font-bold tracking-[0.15em] text-fucsia/70 mb-3">{item.n}</p>
                <p className="text-[15px] text-white/75 leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={vp}
            className="mt-10 p-7 border border-fucsia/20 rounded-2xl bg-fucsia/[0.04] text-[16px] text-white/75 leading-relaxed"
          >
            Eso no es falta de esfuerzo. Es una fuga. La diferencia entre un negocio que crece y uno que se estanca es que alguien le mostró{" "}
            <strong className="text-white">exactamente dónde estaba escapando el dinero.</strong>
          </motion.div>
        </div>
      </section>

      {/* ── 3. QUBRA ────────────────────────────────────────── */}
      <section className="py-20" id="qubra">
        <div className="max-w-[1200px] mx-auto px-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">

            {/* Left — steps */}
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="flex flex-col">
              <Label>Qubra — IA de diagnóstico</Label>
              <h2 className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[clamp(28px,5.5vw,64px)] leading-tight tracking-tight mb-4">
                Antes de invertir un peso, descubre exactamente{" "}
                <span className="text-fucsia">qué está fallando.</span>
              </h2>
              <p className="text-[16px] text-white/50 leading-relaxed mb-8">
                Qubra analiza tu negocio, detecta tus tres fugas más críticas y te entrega un plan de acción personalizado. Sin costo. Sin compromiso. Sin tecnicismos.
              </p>

              {/* Steps with connector line */}
              <div className="flex flex-col mt-auto">
                {[
                  { n: "1", title: "Responde 8 preguntas", desc: "Sobre tu negocio, tus clientes y tus canales actuales." },
                  { n: "2", title: "Qubra analiza tu situación", desc: "La IA detecta patrones de fuga en marketing, experiencia y tecnología." },
                  { n: "3", title: "Recibes tu diagnóstico", desc: "Un plan claro y personalizado con el primer paso concreto para tu negocio." },
                ].map((step, i, arr) => (
                  <motion.div
                    key={step.n}
                    variants={slideLeft}
                    initial="hidden" whileInView="show"
                    viewport={vp}
                    className="flex gap-5 relative pb-8 last:pb-0"
                  >
                    {/* connector */}
                    {i < arr.length - 1 && (
                      <div className="absolute left-[19px] top-10 bottom-0 w-px bg-gradient-to-b from-verde/40 to-verde/[0.05]" />
                    )}
                    <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-verde/[0.12] border border-verde/30 flex items-center justify-center font-[family-name:var(--font-anek-odia)] font-extrabold text-[14px] text-verde">
                      {step.n}
                    </div>
                    <div className="pt-2">
                      <h4 className="font-[family-name:var(--font-anek-odia)] font-bold text-[16px] text-white mb-1">{step.title}</h4>
                      <p className="text-[14px] text-white/45 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — card */}
            <motion.div
              variants={stagger(0.15)}
              initial="hidden" whileInView="show" viewport={vp}
              className="relative bg-[rgba(40,40,40,0.8)] border border-white/[0.08] rounded-3xl p-8 flex flex-col overflow-hidden h-full"
            >
              {/* top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#EF5095] to-[#E2B100]" />

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-verde/[0.12] border border-verde/30 text-[12px] font-medium text-verde w-fit mb-5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                IA gratuita
              </div>

              <h3 className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[22px] leading-snug tracking-tight mb-3">
                Qubra te ve donde otros no llegan.
              </h3>

              <p className="text-[14px] text-white/50 leading-relaxed mb-6">
                No es un formulario genérico. Es un diagnóstico inteligente que entiende el contexto real de tu empresa y te dice exactamente qué mover primero.
              </p>

              {/* Stats */}
              <div className="flex gap-0 border-t border-b border-white/[0.06] py-5 mb-6">
                {[
                  { val: "5", label: "minutos" },
                  { val: "3", label: "fugas detectadas" },
                  { val: "$0", label: "costo" },
                ].map((s, i) => (
                  <div key={s.label} className={`flex-1 text-center ${i > 0 ? "border-l border-white/[0.06]" : ""}`}>
                    <span className="block font-[family-name:var(--font-anek-odia)] font-extrabold text-[28px] text-fucsia tracking-tight">{s.val}</span>
                    <span className="text-[11px] uppercase tracking-[0.1em] text-white/40">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Checklist */}
              <div className="mb-6 border-t border-b border-white/[0.06] py-5">
                <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-white/40 mb-4">
                  Qubra analiza estas 3 dimensiones:
                </p>
                <ul className="flex flex-col gap-3">
                  {[
                    { label: "Comunicación y marca", desc: "qué tan claro y persuasivo es tu mensaje" },
                    { label: "Experiencia del cliente", desc: "dónde se cae el proceso de venta" },
                    { label: "Tecnología y automatización", desc: "qué tan eficiente opera tu negocio" },
                  ].map((item) => (
                    <li key={item.label} className="flex items-start gap-3 text-[13px] text-white/70">
                      <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF5095" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      <span><strong className="text-white font-medium">{item.label}</strong> — {item.desc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href="/live" className="mt-auto">
                <button className="btn-cta-landing w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[15px] font-bold">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  Hacer mi diagnóstico ahora
                </button>
              </Link>

              <p className="text-center text-[12px] text-white/25 mt-3">Sin tarjeta · Sin compromisos</p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 4. SERVICES ─────────────────────────────────────── */}
      <section className="py-20 border-t border-white/[0.04] bg-white/[0.015]" id="servicios">
        <div className="max-w-[1200px] mx-auto px-5">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="text-center max-w-[640px] mx-auto mb-12">
            <Label>Rutas de transformación</Label>
            <h2 className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[clamp(28px,5.5vw,64px)] leading-tight tracking-tight">
              No somos una agencia.<br />
              Somos el equipo que<br />
              <span className="text-fucsia">las agencias no te dieron.</span>
            </h2>
            <p className="mt-4 text-[16px] text-white/50 leading-relaxed">
              Las agencias te venden paquetes. Nosotros sellamos fugas. Tras el diagnóstico de Qubra, tu ruta se define con precisión.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                color: "#EF5095", num: "01", badge: "Comunicación e identidad", title: "Retratar",
                tagline: '"Muestra tu marca sin filtros, pero con intención."',
                desc: "Definimos quién eres, a quién le hablas y cómo decírselo para que conecte y convierta.",
                items: ["Propósito y arquetipos de marca", "Sistema de comunicación completo", "Contenido en video estratégico", "Distribución con IA entrenada en tu marca"],
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="5"/><path d="M3 21c0-4.418 4.03-8 9-8s9 3.582 9 8"/></svg>,
              },
              {
                color: "#8E58A4", num: "02", badge: "Agentes de IA", title: "Sinapsis",
                tagline: '"Tu empresa deja de reaccionar y empieza a pensar."',
                desc: "Creamos agentes de IA que trabajan como extensiones reales de tu equipo — con tu voz, tu lógica y tu estilo.",
                items: ["Mapeo y documentación de procesos internos", "Agentes de marketing y ventas", "Qubra Custom para tu empresa", "Integración con tus sistemas actuales"],
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
              },
              {
                color: "#FFC906", num: "03", badge: "Experiencia al cliente", title: "Metamorfosis",
                tagline: '"La experiencia que viven tus clientes es tu verdadero producto."',
                desc: "Transformamos cada punto de contacto — cómo hablas, cómo atiendes, cómo vendes — desde adentro hacia afuera.",
                items: ["Mapeo profundo del Customer Journey", "Rediseño de experiencia digital y presencial", "Protocolos humanos de atención", "Automatizaciones de atención al cliente con IA"],
                icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4l3 3"/></svg>,
              },
            ].map((svc, i) => (
              <motion.div
                key={svc.title}
                variants={stagger(i * 0.1)}
                initial="hidden" whileInView="show" viewport={vp}
                className="group relative bg-[rgba(40,40,40,0.8)] border border-white/[0.06] rounded-2xl p-7 overflow-hidden hover:-translate-y-1 transition-transform duration-250"
                style={{ "--card-color": svc.color } as React.CSSProperties}
              >
                <span className="absolute top-5 right-5 font-[family-name:var(--font-anek-odia)] font-extrabold text-[80px] leading-none text-white/[0.03] select-none">
                  {svc.num}
                </span>
                <div
                  className="w-[52px] h-[52px] rounded-[12px] flex items-center justify-center mb-5"
                  style={{ background: "rgba(255,255,255,0.06)", color: svc.color }}
                >
                  {svc.icon}
                </div>
                <p className="text-[10px] font-medium tracking-[0.15em] uppercase mb-2" style={{ color: svc.color }}>{svc.badge}</p>
                <h3 className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[22px] tracking-tight mb-2">{svc.title}</h3>
                <p className="text-[13px] italic text-white/45 mb-4 border-l-2 pl-3" style={{ borderColor: svc.color }}>{svc.tagline}</p>
                <p className="text-[14px] text-white/60 leading-relaxed mb-5">{svc.desc}</p>
                <ul className="flex flex-col gap-2">
                  {svc.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-[13px] text-white/45">
                      <span className="mt-[6px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: svc.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
                {/* hover border */}
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-transparent group-hover:ring-white/10 transition-all duration-250 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. METHOD ───────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-[1200px] mx-auto px-5">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={vp}>
            <Label>Metodología artística</Label>
            <h2 className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[clamp(28px,5.5vw,64px)] leading-tight tracking-tight mb-4">
              Arte + Psicología<br />+ Estrategia.
            </h2>
            <p className="text-[16px] text-white/50 leading-relaxed max-w-[600px] mb-10">
              No ejecutamos estrategias genéricas. Nuestra metodología parte del propósito de tu marca — lo descomponemos, lo reinterpretamos y lo convertimos en un sistema que funciona.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                color: "#EF5095", bg: "rgba(239,80,149,0.15)",
                title: "Retratar", subtitle: "Expresionismo",
                desc: "Entendimiento profundo del negocio con Design Thinking.",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l2 2"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>,
              },
              {
                color: "#FFC906", bg: "rgba(255,201,6,0.15)",
                title: "Descomponer", subtitle: "Cubismo",
                desc: "Auditoría multidimensional de marketing, experiencia y tecnología.",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/></svg>,
              },
              {
                color: "#8E58A4", bg: "rgba(142,88,164,0.15)",
                title: "Reinterpretar", subtitle: "Constructivismo",
                desc: "Soluciones adaptadas, innovadoras y con alto diferencial competitivo.",
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
              },
            ].map((m, i) => (
              <motion.div
                key={m.title}
                variants={stagger(i * 0.1)}
                initial="hidden" whileInView="show" viewport={vp}
                className="flex items-start gap-5 p-6 border border-white/[0.06] rounded-2xl hover:bg-white/[0.025] transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: m.bg, color: m.color }}>
                  {m.icon}
                </div>
                <div>
                  <h4 className="font-[family-name:var(--font-anek-odia)] font-bold text-[17px] mb-1">
                    {m.title} — <span style={{ color: m.color }}>{m.subtitle}</span>
                  </h4>
                  <p className="text-[14px] text-white/45">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. PERSONAS ─────────────────────────────────────── */}
      <section className="py-20 border-t border-white/[0.04] bg-white/[0.015]" id="para-quien">
        <div className="max-w-[1200px] mx-auto px-5">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="mb-10">
            <Label>¿Para quién es esto?</Label>
            <h2 className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[clamp(28px,5.5vw,64px)] leading-tight tracking-tight">
              Dependiendo de dónde estés,<br />tu ruta es diferente.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
		tag: "",
                title: "El empresario que quiere digitalizarse sin perderse",
                desc: "Llevas años construyendo tu negocio y sientes que el mundo digital te dejó atrás. No quieres tecnicismos. Quieres vender más, sin perder el control de lo que ya construiste.",
                frenos: ["Malas experiencias previas con agencias que desaparecieron", "Miedo a invertir dinero y no ver resultados", "Lenguaje técnico que no entiende ni quiere aprender"],
                closing: <><strong className="text-white">Esto fue diseñado para ti.</strong><br />Empezamos con diagnóstico gratis. Sin tecnicismos. Con acompañamiento real en cada paso.</>,
              },
              {
		tag: "",
		title: "Vendes mucho. Ahora elevemos tu experiencia a un nivel premium.",
		desc: "Tu empresa funciona y tienes un flujo constante de clientes. El reto ya no es vender más, es vender mejor. Quieres lograr que tus clientes no solo compren, sino que se enamoren y se conviertan en embajadores de tu marca.",
		frenos: ["Procesos que cumplen su función, pero no generan el \"efecto wow\" que exige un cliente premium", "Ventas transaccionales, pero baja fidelización a largo plazo", "Falta de una estructura curada que entregue una experiencia de alto valor desde el primer clic hasta el cierre"],
                closing: <><strong className="text-white">Esto también fue diseñado para ti.</strong><br />Una alianza profesional con visión compartida, estructura clara y compromiso de largo plazo.</>,
              },
            ].map((p, i) => (
              <motion.div
                key={i}
                variants={stagger(i * 0.12)}
                initial="hidden" whileInView="show" viewport={vp}
                className="bg-[rgba(40,40,40,0.8)] border border-white/[0.06] rounded-2xl p-7"
              >
                {p.tag && <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-fucsia mb-3">{p.tag}</p>}
                <h3 className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[20px] leading-snug tracking-tight mb-4">{p.title}</h3>
                <p className="text-[14px] text-white/50 leading-relaxed mb-5">{p.desc}</p>
                <ul className="flex flex-col gap-2 mb-6">
                  {p.frenos.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[13px] text-white/40">
                      <span className="text-fucsia flex-shrink-0">—</span>{f}
                    </li>
                  ))}
                </ul>
                <div className="p-4 rounded-xl bg-fucsia/[0.06] border border-fucsia/15 text-[13px] text-white font-medium leading-relaxed">
                  {p.closing}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. PROCESS ──────────────────────────────────────── */}
      <section className="py-20 border-t border-white/[0.04] bg-white/[0.015]" id="como-funciona">
        <div className="max-w-[1200px] mx-auto px-5">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="text-center max-w-[560px] mx-auto mb-14">
            <Label>Cómo funciona</Label>
            <h2 className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[clamp(28px,5.5vw,64px)] leading-tight tracking-tight">
              Tres pasos.<br />Sin paquetes genéricos.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "01", color: "#EF5095", bg: "rgba(239,80,149,0.08)", border: "rgba(239,80,149,0.4)", title: "Diagnóstico con Qubra", desc: "Gratuito. 5 minutos. Detectamos tus tres fugas más críticas con inteligencia artificial. Sin jerga técnica, sin compromisos.", tag: "5 minutos · $0" },
              { n: "02", color: "#8E58A4", bg: "rgba(142,88,164,0.08)", border: "rgba(142,88,164,0.4)", title: "Definimos tu ruta", desc: "Según tu diagnóstico, diseñamos el camino exacto para tu negocio. Una sesión estratégica donde todo queda claro.", tag: "1 sesión · co-creada contigo" },
              { n: "03", color: "#54D1A2", bg: "rgba(54,193,143,0.08)", border: "rgba(54,193,143,0.4)", title: "Transformamos juntos", desc: "Ejecutamos con acompañamiento real. Resultados visibles desde las primeras dos semanas. Sin desaparecer después del cierre.", tag: "2 a 10 semanas según tu ruta" },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                variants={stagger(i * 0.15)}
                initial="hidden" whileInView="show" viewport={vp}
                className="flex flex-col gap-4"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center font-[family-name:var(--font-anek-odia)] font-extrabold text-[18px]"
                  style={{ background: step.bg, border: `1px solid ${step.border}`, color: step.color }}
                >
                  {step.n}
                </div>
                <h4 className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[20px] tracking-tight">{step.title}</h4>
                <p className="text-[14px] text-white/45 leading-relaxed">{step.desc}</p>
                <span className="inline-block text-[11px] font-medium tracking-[0.1em] uppercase text-white/30 border border-white/[0.08] rounded-full px-3 py-1 w-fit">
                  {step.tag}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. TESTIMONIOS ──────────────────────────────────── */}
      <section className="py-20 border-t border-white/[0.04] bg-white/[0.015] relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="pointer-events-none absolute top-[6%] -right-[50px]">
          <Image src="/img/home-10/testimonial/testimonial-shape-1.png" alt="" width={90} height={90} className="opacity-25" />
        </div>
        <div className="pointer-events-none absolute bottom-[8%] -left-[30px]">
          <Image src="/img/home-10/testimonial/testimonial-shape-2.png" alt="" width={110} height={110} className="opacity-20" />
        </div>

        <div className="max-w-[1200px] mx-auto px-5 relative z-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={vp} className="text-center max-w-[640px] mx-auto mb-14">
            <Label>Testimonios</Label>
            <h2 className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[clamp(28px,5.5vw,64px)] leading-tight tracking-tight">
              Resultados reales.<br />En sus palabras.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                name: "Jorge Martínez",
                cargo: "Dueño de Pyme",
                img: 4,
                transformacion: "De cero → vitrina digital",
                color: "#54D1A2",
                pullQuote: "Pasamos de la nada absoluta a tener una vitrina digital que nos representa con orgullo.",
                testimonio: "No existíamos en internet y el miedo a vernos genéricos nos frenaba. Vanguardistas le dio vida digital a nuestra empresa desde cero. No solo nos entregaron una página web; nos dieron una herramienta con diseño dinámico y textos persuasivos que realmente capturan nuestra voz. Ya está atrayendo leads.",
              },
              {
                name: "Camila Echeverry",
                cargo: "Directora de Marca",
                img: 1,
                transformacion: "De genérico → experiencia premium",
                color: "#EF5095",
                pullQuote: "El precio ha dejado de ser una objeción porque el trato es impecable.",
                testimonio: "Sentíamos que nuestro servicio en persona era de lujo, pero en lo digital éramos uno más del montón. Vanguardistas no solo reconstruyó nuestra narrativa, sino que rediseñó cada punto de contacto con el cliente. Pasamos de tener un proceso de ventas frío a entregar una experiencia premium donde cada mensaje respira nuestra esencia.",
              },
              {
                name: "Felipe Ruiz",
                cargo: "Director Comercial",
                img: 2,
                transformacion: "De invisible → referente B2B",
                color: "#8E58A4",
                pullQuote: "Nuestra imagen finalmente está a la altura de la calidad de nuestras consultorías.",
                testimonio: "Proyectar autoridad en el mundo B2B sin perder nuestra alma parecía imposible hasta que aplicamos su metodología. Lograron aterrizar nuestro propósito y conectarlo con lo que nuestros clientes corporativos realmente necesitaban ver. El resultado fue una identidad visual que impacta y genera confianza inmediata.",
              },
              {
                name: "María Holguín",
                cargo: "Gerente de Marca",
                img: 3,
                transformacion: "De curso → activo de marca",
                color: "#FFC906",
                pullQuote: "No es solo un curso grabado; es una pieza de comunicación que posiciona nuestra marca.",
                testimonio: "Grabar un curso completo es un reto, pero lograr que cada palabra, el escenario y el contenido se sientan como una sola marca es otro nivel. Gracias a la dirección estratégica, logramos una narrativa coherente donde el fondo y la forma se alinean perfectamente en cada lección.",
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                variants={stagger(i * 0.1)}
                initial="hidden" whileInView="show" viewport={vp}
                className="group relative bg-[rgba(40,40,40,0.8)] border border-white/[0.06] rounded-2xl p-7 hover:border-white/15 transition-colors flex flex-col"
              >
                {/* Before/after badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] font-medium tracking-[0.06em] uppercase text-white/45 w-fit mb-4">
                  <span style={{ color: t.color }}>◆</span>
                  {t.transformacion}
                </div>

                {/* Pull quote */}
                <p className="font-[family-name:var(--font-anek-odia)] text-[22px] leading-snug tracking-tight italic mb-3" style={{ color: t.color }}>
                  &ldquo;{t.pullQuote}&rdquo;
                </p>

                {/* Testimonial body */}
                <p className="text-[13px] text-white/50 leading-relaxed mb-5 flex-1">
                  {t.testimonio}
                </p>

                {/* Avatar + Name */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white/[0.06] border border-white/[0.08] flex-shrink-0">
                    <Image
                      src={`/img/home-10/testimonial/testimonial-item-${t.img}.png`}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-white leading-none mb-0.5">{t.name}</p>
                    <p className="text-[11px] text-white/35 leading-none">{t.cargo}</p>
                  </div>
                </div>

                {/* Hover top line */}
                <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to right, ${t.color}, transparent)` }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CTA FINAL ────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-fucsia/[0.10] blur-[120px]" />
        <div className="max-w-[680px] mx-auto px-5 text-center relative z-10">
          <motion.h2
            variants={fadeUp} initial="hidden" whileInView="show" viewport={vp}
            className="font-[family-name:var(--font-anek-odia)] font-extrabold text-[clamp(28px,5.5vw,64px)] leading-tight tracking-tight mb-5"
          >
            El primer paso<br />no cuesta nada.<br />El siguiente,<br />
            <span className="text-fucsia">no podrás evitarlo.</span>
          </motion.h2>

          <motion.p
            variants={stagger(0.1)} initial="hidden" whileInView="show" viewport={vp}
            className="text-[16px] text-white/50 leading-relaxed mb-10"
          >
            Haz el diagnóstico con Qubra. Descubre qué está frenando tu negocio. Y si lo que ves tiene sentido, hablamos.
          </motion.p>

          <motion.div
            variants={stagger(0.2)} initial="hidden" whileInView="show" viewport={vp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-5"
          >
            <Link href="/live">
              <button className="btn-cta-landing inline-flex items-center gap-2 px-8 py-5 rounded-2xl text-[16px] font-bold">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                Encontrar mis fugas — es gratis
              </button>
            </Link>
            <a
              href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1VOvRLtpRq_-fEPeAwv3NtDlzbm8Lkl7jZRbpQffc9FcId7Puw1Hwy6_O_ijtFWCaXmKjguf2t"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-5 border border-white/12 rounded-2xl text-[14px] text-white/60 hover:border-white/25 hover:text-white transition-colors"
            >
              Agendar una reunión
            </a>
          </motion.div>

          <motion.p variants={stagger(0.3)} initial="hidden" whileInView="show" viewport={vp} className="text-[12px] text-white/25 tracking-wider">
            Sin tarjeta. Sin compromisos. Solo claridad.
          </motion.p>
        </div>
      </section>

    </div>
  );
}
