"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ProgressTracker } from "./ProgressTracker";
import { ScoreMeter } from "./ScoreMeter";
import { InsightCards } from "./InsightCards";
import { BuyerPersonaBadge } from "./BuyerPersonaBadge";
import { LiveAnalysis } from "../hooks/useLiveAnalysis";
import { FileText, Loader2, ScanEye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingScreen } from "./OnboardingScreen";

interface AnalysisPanelProps {
  analysis: LiveAnalysis;
  isAnalyzing: boolean;
  onGenerateInforme: () => Promise<string | null>;
  informe: string | null;
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

export function AnalysisPanel({
  analysis,
  isAnalyzing,
  onGenerateInforme,
  informe,
}: AnalysisPanelProps) {
  const handleGenerate = async () => {
    await onGenerateInforme();
  };

  const getStatusText = () => {
    if (isAnalyzing) return "Detectando fugas...";
    if (analysis.etapa === "completado") return "Diagnóstico completo";
    if (analysis.progreso === 0) return "Esperando primer señal...";
    return "Escaneando estrategia...";
  };

  const hasData = analysis.progreso > 0 || analysis.datosUsuario.nombre;
  const hasInsights = analysis.insights.length > 0;
  const hasUserData = analysis.datosUsuario.nombre || analysis.datosUsuario.empresa || analysis.datosUsuario.email;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 sm:px-7 lg:px-8 xl:px-10 py-6 sm:py-7 lg:py-8 shrink-0">
        <div className="flex items-center gap-3">
          <ScanEye className="w-5 h-5 text-[#7A2CFF]" />
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white tracking-tight">
              Diagnóstico en vivo
            </h1>
            <p className="text-xs sm:text-sm text-[#E8E4F5]/50 mt-1">
              {getStatusText()}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 sm:px-7 lg:px-8 xl:px-10 pb-6 sm:pb-8 lg:pb-10 relative">
        {/* Onboarding — shown when no data yet */}
        {!hasData && (
          <OnboardingScreen onComplete={() => {}} firstMessageReady={true} />
        )}

        {/* Analysis content — revealed section by section */}
        <AnimatePresence mode="popLayout">
          {hasData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-0"
            >
              {/* Progress — always show when has data */}
              <Section title="Fase del diagnóstico">
                <ProgressTracker etapa={analysis.etapa} />
              </Section>

              {/* Score — only when progreso > 0 */}
              {analysis.progreso > 0 && (
                <Section title="Puntuación de madurez">
                  <ScoreMeter score={analysis.progreso * 3} />
                </Section>
              )}

              {/* Insights — only when insights exist */}
              {hasInsights && (
                <Section title="Hallazgos detectados">
                  <InsightCards insights={analysis.insights} />
                </Section>
              )}

              {/* Buyer Persona — only show when a real persona is identified
              {analysis.datosUsuario.nombre && analysis.progreso >= 5 && (
                <Section title="Perfil identificado">
                  <BuyerPersonaBadge persona={null} />
                </Section>
              )}
              */}

              {/* Datos del usuario — only when captured */}
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
                  </div>
                </Section>
              )}

              {/* Informe Button */}
              {analysis.progreso >= 7 && !informe && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  layout
                  className="border-t border-white/[0.04] pt-6 sm:pt-7"
                >
                  <Button
                    onClick={handleGenerate}
                    disabled={isAnalyzing}
                    className="w-full h-12 gradient-btn rounded-2xl font-medium text-sm transition-all"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generando informe...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Generar Informe Completo
                      </>
                    )}
                  </Button>
                </motion.div>
              )}

              {/* Informe Preview */}
              {informe && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  layout
                  className="border-t border-white/[0.04] pt-6 sm:pt-7"
                >
                  <div className="p-5 sm:p-6 rounded-[24px] gradient-border-card">
                    <p className="text-xs text-[#E8E4F5]/40 mb-3">Informe generado</p>
                    <div className="max-h-48 overflow-y-auto text-sm text-white/70 leading-relaxed">
                      {informe.slice(0, 600)}...
                    </div>
                  </div>
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
          <span>{analysis.progreso} de 10 señales</span>
        </div>
      </div>
    </div>
  );
}
