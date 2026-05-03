"use client";

import { motion } from "framer-motion";
import { ProgressTracker } from "./ProgressTracker";
import { ScoreMeter } from "./ScoreMeter";
import { InsightCards } from "./InsightCards";
import { BuyerPersonaBadge } from "./BuyerPersonaBadge";
import { LiveAnalysis } from "../hooks/useLiveAnalysis";
import { FileText, Loader2, ScanEye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisPanelProps {
  analysis: LiveAnalysis;
  isAnalyzing: boolean;
  onGenerateInforme: () => Promise<string | null>;
  informe: string | null;
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

      <div className="flex-1 overflow-y-auto px-6 sm:px-7 lg:px-8 xl:px-10 pb-6 sm:pb-8 lg:pb-10">
        <div className="space-y-7 sm:space-y-9 lg:space-y-10">
          {/* Progress */}
          <section>
            <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#E8E4F5]/40 mb-4">
              Fase del diagnóstico
            </h2>
            <ProgressTracker etapa={analysis.etapa} />
          </section>

          <div className="h-px bg-white/[0.04] rounded-full" />

          {/* Score */}
          <section>
            <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#E8E4F5]/40 mb-4">
              Puntuación de madurez
            </h2>
            <ScoreMeter score={analysis.progreso * 3} />
          </section>

          <div className="h-px bg-white/[0.04] rounded-full" />

          {/* Insights */}
          <section>
            <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#E8E4F5]/40 mb-4">
              Hallazgos detectados
            </h2>
            <InsightCards insights={analysis.insights} />
          </section>

          <div className="h-px bg-white/[0.04] rounded-full" />

          {/* Buyer Persona */}
          <section>
            <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#E8E4F5]/40 mb-4">
              Perfil identificado
            </h2>
            <BuyerPersonaBadge persona={null} />
          </section>

          <div className="h-px bg-white/[0.04] rounded-full" />

          {/* Datos del usuario */}
          {(analysis.datosUsuario.nombre || analysis.datosUsuario.empresa || analysis.datosUsuario.email) && (
            <section>
              <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#E8E4F5]/40 mb-4">
                Datos capturados
              </h2>
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
            </section>
          )}

          {/* Informe Button */}
          {analysis.progreso >= 7 && !informe && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 sm:p-6 rounded-[24px] gradient-border-card"
            >
              <p className="text-xs text-[#E8E4F5]/40 mb-3">Informe generado</p>
              <div className="max-h-48 overflow-y-auto text-sm text-white/70 leading-relaxed">
                {informe.slice(0, 600)}...
              </div>
            </motion.div>
          )}
        </div>
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
