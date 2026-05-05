"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AnalysisPanel } from "./AnalysisPanel";
import { LiveAnalysis, SendDiagnosisResult } from "../hooks/useLiveAnalysis";
import { ChevronUp, ChevronDown, X } from "lucide-react";

type SheetState = "hidden" | "collapsed" | "half" | "full";

interface AnalysisSheetProps {
  sheetState: SheetState;
  setSheetState: (s: SheetState) => void;
  analysis: LiveAnalysis;
  isAnalyzing: boolean;
  informe: string | null;
  hasNotification?: boolean;
  onOpen?: () => void;
  isSending?: boolean;
  sendResult?: SendDiagnosisResult | null;
  onRetrySend?: (informe: string) => Promise<SendDiagnosisResult | null>;
  onResend?: () => Promise<void>;
  onOpenPreview?: () => void;
}

const heightMap: Record<SheetState, string> = {
  hidden: "0px",
  collapsed: "100px",
  half: "65dvh",
  full: "92dvh",
};

const etapaLabels: Record<string, string> = {
  retratar: "Retratar",
  descomponer: "Descomponer",
  reinterpretar: "Reinterpretar",
  completado: "Completado",
};

export function AnalysisSheet({
  sheetState,
  setSheetState,
  analysis,
  isAnalyzing,
  informe,
  hasNotification,
  onOpen,
  isSending,
  sendResult,
  onRetrySend,
  onResend,
  onOpenPreview,
}: AnalysisSheetProps) {
  const cycleState = () => {
    if (sheetState === "hidden") setSheetState("half");
    else if (sheetState === "collapsed") setSheetState("half");
    else if (sheetState === "half") setSheetState("full");
    else setSheetState("collapsed");
  };

  const closeSheet = () => setSheetState("hidden");

  const showBubble = sheetState === "hidden";
  const Icon = sheetState === "full" ? ChevronDown : ChevronUp;

  return (
    <>
      {/* Burbuja Qubra — minimalista, solo avatar + badge */}
      <AnimatePresence>
        {showBubble && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: "spring", damping: 18, stiffness: 300 }}
            onClick={onOpen}
            drag
            dragMomentum={false}
            dragElastic={0.1}
            dragConstraints={{ left: -500, right: 0, top: -800, bottom: 0 }}
            whileDrag={{ scale: 1.1, cursor: "grabbing" }}
            className="fixed bottom-32 right-4 z-40 cursor-grab active:cursor-grabbing"
          >
            <div className="relative w-12 h-12">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/[0.08] bg-[#0B0B16]/80 backdrop-blur-sm shadow-lg shadow-black/50">
                <img
                  src="/img/qubra.png"
                  alt="Qubra"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Notification dot */}
              <AnimatePresence>
                {hasNotification && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-0.5 -right-0.5 z-10"
                  >
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF5095] opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-gradient-to-br from-[#EF5095] to-[#8E58A4]" />
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop — close on tap */}
      <AnimatePresence>
        {(sheetState === "half" || sheetState === "full") && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeSheet}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Panel de diagnóstico"
        animate={{
          height: heightMap[sheetState],
          y: sheetState === "hidden" ? "100%" : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B0B16]/95 backdrop-blur-md rounded-t-[32px] border-t border-white/[0.06] flex flex-col overflow-hidden"
      >
        {/* Handle bar */}
        <div className="flex items-center justify-center shrink-0 relative">
          <button
            onClick={cycleState}
            type="button"
            aria-label="Expandir o contraer panel de diagnóstico"
            className="flex-1 flex items-center justify-center py-2.5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </button>
          {/* Close button */}
          <button
            onClick={closeSheet}
            type="button"
            aria-label="Cerrar panel de diagnóstico"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Compact info (visible in collapsed only) */}
        <AnimatePresence>
          {sheetState === "collapsed" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="px-5 pb-3 shrink-0"
            >
              <button
                onClick={() => setSheetState("half")}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src="/img/qubra.png"
                      alt="Q"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-medium text-white/90">
                      {analysis.progreso}
                      <span className="text-white/40 font-normal"> / 10</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#E8E4F5]/40">
                      {etapaLabels[analysis.etapa] || "Diagnóstico"}
                    </span>
                  </div>
                </div>
                <Icon className="w-3.5 h-3.5 text-white/30" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Full analysis content */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <AnalysisPanel
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            informe={informe}
            isSending={isSending}
            sendResult={sendResult}
            onRetrySend={onRetrySend}
            onResend={onResend}
            onOpenPreview={onOpenPreview}
          />
        </div>
      </motion.div>
    </>
  );
}
