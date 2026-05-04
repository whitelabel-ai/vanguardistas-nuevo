"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ProgressTracker } from "./ProgressTracker";
import { InsightCards } from "./InsightCards";
import { LiveAnalysis, SendDiagnosisResult } from "../hooks/useLiveAnalysis";
import { FileText, Mail, CheckCircle, AlertCircle, BarChart3, Target, Zap, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingScreen } from "./OnboardingScreen";

interface AnalysisPanelProps {
  analysis: LiveAnalysis;
  isAnalyzing: boolean;
  informe: string | null;
  isSending?: boolean;
  sendResult?: SendDiagnosisResult | null;
  onRetrySend?: (informe: string) => Promise<SendDiagnosisResult | null>;
  onResend?: () => Promise<void>;
  onOpenPreview?: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      layout
      className="border-t border-white/[0.04] pt-6 sm:pt-7 first:border-t-0 first:pt-0"
    >
      <motion.h2
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#E8E4F5]/40 mb-4"
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        {children}
      </motion.div>
    </motion.section>
  );
}

function Thermometer({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-[#E8E4F5]/60">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{score}/10</span>
      </div>
      <div className="h-2.5 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function NivelBadge({ nivel }: { nivel: number | null }) {
  if (!nivel) return null;

  const niveles = {
    1: { nombre: "El Lienzo en Blanco", emoji: "🎨", color: "#FF3CAC", desc: "Fuga Alta" },
    2: { nombre: "El Impresionista Difuso", emoji: "🖼️", color: "#FFC906", desc: "Fuga Media" },
    3: { nombre: "El Visionario Encerrado", emoji: "🏛️", color: "#00D9A5", desc: "Fuga Baja" },
  };

  const info = niveles[nivel as keyof typeof niveles];

  return (
    <div
      className="flex items-center gap-3 p-4 rounded-2xl"
      style={{ backgroundColor: `${info.color}15`, border: `1px solid ${info.color}30` }}
    >
      <span className="text-2xl">{info.emoji}</span>
      <div>
        <p className="text-sm font-bold" style={{ color: info.color }}>{info.nombre}</p>
        <p className="text-xs text-[#E8E4F5]/50">{info.desc}</p>
      </div>
    </div>
  );
}

export function AnalysisPanel({
  analysis,
  isAnalyzing,
  informe,
  isSending,
  sendResult,
  onRetrySend,
  onResend,
  onOpenPreview,
}: AnalysisPanelProps) {
  const handleRetry = async () => {
    if (informe && onRetrySend) {
      await onRetrySend(informe);
    }
  };

  const getStatusText = () => {
    if (isAnalyzing) return "Analizando fugas...";
    if (analysis.etapa === "completado") return "Diagnóstico completo";
    if (analysis.progreso === 0) return "Esperando primer señal...";
    return "Escaneando estrategia...";
  };

  const hasData = analysis.progreso > 0 || analysis.datosUsuario.nombre;
  const hasInsights = analysis.insights.length > 0;
  const hasUserData = analysis.datosUsuario.nombre || analysis.datosUsuario.empresa || analysis.datosUsuario.email;
  const hasScores = analysis.scores.global > 0;
  const diagnosisReady = !!informe;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 sm:px-7 lg:px-8 xl:px-10 py-6 sm:py-7 lg:py-8 shrink-0">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#7A2CFF]" />
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white tracking-tight">
              Mapa de Fugas
            </h1>
            <p className="text-xs sm:text-sm text-[#E8E4F5]/50 mt-1">
              {getStatusText()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 sm:px-7 lg:px-8 xl:px-10 pb-6 sm:pb-8 lg:pb-10 relative">
        {!hasData && (
          <OnboardingScreen onComplete={() => {}} firstMessageReady={true} />
        )}

        <AnimatePresence mode="popLayout">
          {hasData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-0"
            >
              {/* Progress */}
              <Section title="Fase del diagnóstico">
                <ProgressTracker etapa={analysis.etapa} />
              </Section>

              {/* Mapa de Calor */}
              {hasScores && (
                <Section title="Mapa de Calor">
                  <div className="p-5 sm:p-6 rounded-[24px] bg-white/[0.02] border border-white/[0.06] space-y-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#E8E4F5]/40 uppercase tracking-wider">Salud Comercial</span>
                      <span className="text-2xl font-bold text-[#FFC906]">{analysis.scores.global}/100</span>
                    </div>

                    <Thermometer
                      label="Atracción (Marketing)"
                      score={analysis.scores.marketing}
                      color={analysis.scores.marketing <= 4 ? "#FF3CAC" : analysis.scores.marketing <= 7 ? "#FFC906" : "#00D9A5"}
                    />
                    <Thermometer
                      label="Conversión (Experiencia)"
                      score={analysis.scores.experiencia}
                      color={analysis.scores.experiencia <= 4 ? "#FF3CAC" : analysis.scores.experiencia <= 7 ? "#FFC906" : "#00D9A5"}
                    />

                    <NivelBadge nivel={analysis.nivel} />

                    {analysis.esClientePotencial && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FFC906]/10 border border-[#FFC906]/20">
                        <Target className="w-4 h-4 text-[#FFC906]" />
                        <span className="text-sm text-[#FFC906] font-medium">⭐ Cliente Potencial</span>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Fuga Detectada */}
              {analysis.fugaPrincipal && (
                <Section title="Fuga Detectada">
                  <div className="p-5 sm:p-6 rounded-[24px] bg-white/[0.02] border-l-4 border-[#DD256C] border-y border-r border-white/[0.06]">
                    <p className="text-sm font-bold text-[#DD256C] mb-2">{analysis.fugaPrincipal}</p>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {analysis.intervencionUrgente}
                    </p>
                  </div>
                </Section>
              )}

              {/* Insights */}
              {hasInsights && (
                <Section title="Hallazgos detectados">
                  <InsightCards insights={analysis.insights} />
                </Section>
              )}

              {/* Datos del usuario */}
              {hasUserData && (
                <Section title="Datos capturados">
                  <div className="space-y-3">
                    {analysis.datosUsuario.nombre && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#E8E4F5]/50">Nombre</span>
                        <span className="text-sm text-white">{analysis.datosUsuario.nombre}</span>
                      </div>
                    )}
                    {analysis.datosUsuario.empresa && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#E8E4F5]/50">Empresa</span>
                        <span className="text-sm text-white">{analysis.datosUsuario.empresa}</span>
                      </div>
                    )}
                    {analysis.datosUsuario.email && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#E8E4F5]/50">Email</span>
                        <span className="text-sm text-white">{analysis.datosUsuario.email}</span>
                      </div>
                    )}
                    {analysis.camino && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-[#E8E4F5]/50">Síntoma</span>
                        <span className="text-sm text-white">{analysis.camino === "A" ? "Invisibilidad" : "Fricción"}</span>
                      </div>
                    )}
                  </div>
                </Section>
              )}

              {/* Estado de envío + Botón Ver Diagnóstico */}
              {diagnosisReady && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  layout
                  className="border-t border-white/[0.04] pt-6 sm:pt-7 space-y-4"
                >
                  {isSending && (
                    <div className="flex items-center gap-2 text-sm text-[#E8E4F5]/60">
                      <Loader2 className="w-4 h-4 animate-spin text-[#7A2CFF]" />
                      Enviando Mapa de Fugas a tu correo...
                    </div>
                  )}

                  {sendResult?.success && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm text-emerald-300 font-medium">¡Mapa de Fugas enviado!</p>
                        <p className="text-xs text-emerald-300/70 mt-0.5">Revisa tu bandeja de entrada (y spam). Te enviamos el diagnóstico completo con PDF.</p>
                      </div>
                    </div>
                  )}

                  {sendResult && !sendResult.success && (
                    <div className="flex flex-col gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-red-300 font-medium">No se pudo enviar el email</p>
                          <p className="text-xs text-red-300/70 mt-0.5">{sendResult.message}</p>
                        </div>
                      </div>
                      {onRetrySend && informe && (
                        <Button
                          onClick={handleRetry}
                          disabled={isSending}
                          variant="outline"
                          size="sm"
                          className="w-full h-9 border-red-400/30 text-red-300 hover:bg-red-500/10 hover:text-red-200 rounded-xl text-xs"
                        >
                          {isSending ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                              Reintentando...
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5 mr-2" />
                              Reintentar envío
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Botón Ver Diagnóstico Completo */}
                  {onOpenPreview && (
                    <Button
                      onClick={onOpenPreview}
                      className="w-full h-12 gradient-btn rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Ver diagnóstico completo
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Botón Reenviar */}
                  {onResend && (
                    <Button
                      onClick={onResend}
                      disabled={isSending}
                      variant="outline"
                      className="w-full h-11 border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.04] hover:border-white/[0.15] rounded-2xl font-medium text-sm transition-all flex items-center justify-center gap-2"
                    >
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      {isSending ? "Reenviando..." : "Reenviar al correo"}
                    </Button>
                  )}

                  {/* CTA Sesión de Curaduría */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 rounded-2xl bg-gradient-to-br from-[#DD256C]/20 to-[#7A2CFF]/20 border border-[#DD256C]/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-[#FFC906]" />
                      <p className="text-sm font-bold text-white">Sesión de Curaduría Estratégica</p>
                    </div>
                    <p className="text-xs text-white/60 mb-4">
                      Una sesión gratuita de 30 minutos para profundizar en tu Mapa de Fugas y diseñar un plan de acción a medida.
                    </p>
                    <a
                      href="https://calendar.app.google/Y2tWzCWbTpm7Kage6"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full"
                    >
                      <Button className="w-full h-11 bg-[#DD256C] hover:bg-[#DD256C]/90 text-white rounded-xl font-medium text-sm">
                        Reclamar mi sesión gratuita
                      </Button>
                    </a>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer status */}
      <div className="px-6 sm:px-7 lg:px-8 xl:px-10 py-3 sm:py-4 shrink-0">
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-white/30">
          <span>{isAnalyzing ? "Escaneando..." : "Sistema activo"}</span>
          <span>{analysis.progreso} de 8 señales</span>
        </div>
      </div>
    </div>
  );
}
