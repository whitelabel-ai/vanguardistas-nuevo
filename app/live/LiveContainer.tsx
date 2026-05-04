"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStream } from "./hooks/useChatStream";
import { useLiveAnalysis } from "./hooks/useLiveAnalysis";
import { AnalysisPanel } from "./components/AnalysisPanel";
import { ChatPanel } from "./components/ChatPanel";
import { AnalysisSheet } from "./components/AnalysisSheet";
import { SendingModal } from "./components/SendingModal";
import { DiagnosisPreview } from "./components/DiagnosisPreview";
import { GripVertical } from "lucide-react";

export function LiveContainer() {
  const { messages, input, setInput, isLoading, sendMessage, sendAudio, addMessage } = useChatStream();
  const { analysis, isAnalyzing, generateInforme, sendDiagnosis, isSending, sendResult, isEmailSent, markEmailAsSent } = useLiveAnalysis(messages);
  const [informe, setInforme] = useState<string | null>(null);

  // Modal states
  const [showSendingModal, setShowSendingModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-trigger guard
  const autoTriggeredRef = useRef(false);

  // Sheet state (mobile)
  const [sheetState, setSheetState] = useState<"hidden" | "collapsed" | "half" | "full">("hidden");
  const [hasNotification, setHasNotification] = useState(false);

  const openSheet = () => {
    setSheetState("half");
    setHasNotification(false);
  };

  // Detect progress milestone and insert a persistent message
  const lastEtapaRef = useRef<string | null>(null);
  useEffect(() => {
    if (!analysis || analysis.etapa === lastEtapaRef.current) return;

    const prev = lastEtapaRef.current;
    lastEtapaRef.current = analysis.etapa;

    if (prev && prev !== analysis.etapa) {
      addMessage({
        role: "assistant",
        content: `__PROGRESS__:${analysis.etapa}:${analysis.progreso}`,
        type: "progress",
        metadata: {
          etapa: analysis.etapa,
          progreso: analysis.progreso,
        },
      });
      setHasNotification(true);
    }
  }, [analysis, addMessage]);

  // Auto-trigger diagnosis when completed
  useEffect(() => {
    if (
      analysis.completado &&
      analysis.datosUsuario.nombre &&
      analysis.datosUsuario.email &&
      !informe &&
      !autoTriggeredRef.current &&
      !isSending &&
      !sendResult
    ) {
      const nombre = analysis.datosUsuario.nombre;
      const email = analysis.datosUsuario.email;

      // Prevent duplicate auto-sends for the same email
      if (isEmailSent(email)) {
        autoTriggeredRef.current = true;
        // Still generate the informe and show preview, but don't re-send
        handleGenerateAndShow();
        return;
      }

      autoTriggeredRef.current = true;

      // Insert Qubra message in chat
      addMessage({
        role: "assistant",
        content: `Gracias, ${nombre}. Estoy preparando tu Mapa de Fugas personalizado. Esto tomará unos segundos...`,
        type: "text",
      });

      // Show sending modal
      setShowSendingModal(true);

      // Generate + send
      handleGenerateAndSend();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysis.completado, analysis.datosUsuario.nombre, analysis.datosUsuario.email, informe, isSending, sendResult]);

  // Handle send result changes
  useEffect(() => {
    if (!sendResult) return;

    setShowSendingModal(false);

    if (sendResult.success) {
      setShowPreview(true);
      addMessage({
        role: "assistant",
        content: `Tu diagnóstico está listo. Te he enviado el informe completo a tu correo. Revisa tu bandeja (y spam).`,
        type: "text",
      });
    } else {
      addMessage({
        role: "assistant",
        content: `Hubo un problema enviando tu Mapa de Fugas: ${sendResult.message}. Puedes intentar de nuevo desde el panel de diagnóstico.`,
        type: "text",
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sendResult]);

  const handleGenerateAndSend = async () => {
    const result = await generateInforme();
    if (result) {
      setInforme(result);
      await sendDiagnosis(result);
    } else {
      setShowSendingModal(false);
      addMessage({
        role: "assistant",
        content: "No pude generar tu Mapa de Fugas. Por favor, intenta de nuevo.",
        type: "text",
      });
    }
  };

  const handleGenerateAndShow = async () => {
    const result = await generateInforme();
    if (result) {
      setInforme(result);
      setShowPreview(true);
    }
  };

  const handleResend = async () => {
    if (!informe) return;
    setShowSendingModal(true);
    const email = analysis.datosUsuario.email;
    if (email) markEmailAsSent(email); // ensure it's marked
    await sendDiagnosis(informe);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
  };

  const [split, setSplit] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback(() => {
    setIsDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSplit(Math.max(30, Math.min(70, percentage)));
    },
    [isDragging]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="h-[calc(100dvh-5rem)] mt-20 flex mesh-gradient-bg-v2 relative p-3 sm:p-4 lg:p-5">
      {/* Sending Modal */}
      <SendingModal
        isOpen={showSendingModal}
        nombre={analysis.datosUsuario.nombre}
      />

      {/* Diagnosis Preview Full Screen */}
      {informe && (
        <DiagnosisPreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          nombre={analysis.datosUsuario.nombre || "Estimado"}
          informe={informe}
          scores={analysis.scores}
          nivel={analysis.nivel}
          camino={analysis.camino}
          esClientePotencial={analysis.esClientePotencial}
          fugaPrincipal={analysis.fugaPrincipal}
          intervencionUrgente={analysis.intervencionUrgente}
        />
      )}

      {/* Desktop: resizable side-by-side with floating panels */}
      <div
        ref={containerRef}
        className="hidden lg:flex w-full h-full relative gap-4"
      >
        {/* Left Panel - Analysis */}
        <div
          className="h-full rounded-[32px] bg-[#0B0B16]/80 backdrop-blur-sm overflow-hidden"
          style={{ width: `${split}%` }}
        >
          <AnalysisPanel
            analysis={analysis}
            isAnalyzing={isAnalyzing}
            informe={informe}
            isSending={isSending}
            sendResult={sendResult}
            onRetrySend={sendDiagnosis}
            onResend={handleResend}
            onOpenPreview={() => setShowPreview(true)}
          />
        </div>

        {/* Resizer */}
        <div
          onMouseDown={handleMouseDown}
          className={`absolute top-0 bottom-0 z-20 flex items-center justify-center transition-colors rounded-full ${
            isDragging ? "w-6 -ml-3 bg-white/[0.08]" : "w-4 -ml-2 hover:w-6 hover:-ml-3 hover:bg-white/[0.06]"
          }`}
          style={{ left: `${split}%` }}
        >
          <div
            className={`flex items-center justify-center rounded-full transition-opacity ${
              isDragging ? "opacity-100" : "opacity-0 hover:opacity-100"
            }`}
          >
            <GripVertical className="w-4 h-4 text-white/40" />
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div
          className="h-full rounded-[32px] bg-[#0B0B16]/80 backdrop-blur-sm overflow-hidden"
          style={{ width: `${100 - split}%` }}
        >
          <ChatPanel
            messages={messages}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSend={handleSend}
            onSendAudio={sendAudio}
            onOpenAnalysis={openSheet}
          />
        </div>
      </div>

      {/* Mobile: Chat full screen + bottom sheet */}
      <div className="lg:hidden relative w-full h-full rounded-[32px] bg-[#0B0B16]/80 backdrop-blur-sm overflow-hidden">
        <ChatPanel
          messages={messages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSend={handleSend}
          onSendAudio={sendAudio}
          onOpenAnalysis={openSheet}
        />

        {/* Bottom Sheet */}
        <AnalysisSheet
          sheetState={sheetState}
          setSheetState={setSheetState}
          analysis={analysis}
          isAnalyzing={isAnalyzing}
          informe={informe}
          hasNotification={hasNotification}
          onOpen={openSheet}
          isSending={isSending}
          sendResult={sendResult}
          onRetrySend={sendDiagnosis}
          onResend={handleResend}
          onOpenPreview={() => setShowPreview(true)}
        />
      </div>
    </div>
  );
}
