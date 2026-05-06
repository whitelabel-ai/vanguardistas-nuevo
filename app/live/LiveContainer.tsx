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
  const {
    analysis,
    isAnalyzing,
    generateInforme,
    sendDiagnosis,
    isSending,
    sendResult,
    loadInforme,
    isSessionSent,
    isRateLimited,
  } = useLiveAnalysis(messages);

  const [informe, setInforme] = useState<string | null>(null);

  // Modal states
  const [showSendingModal, setShowSendingModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Set de correos a los que ya disparamos el envío automático en esta
  // instancia. Si el usuario corrige el correo, el nuevo no estará en el set
  // y volveremos a enviar el diagnóstico al correo actualizado.
  const autoSentEmailsRef = useRef<Set<string>>(new Set());

  // Sheet state (mobile)
  const [sheetState, setSheetState] = useState<"hidden" | "collapsed" | "half" | "full">("hidden");
  const [hasNotification, setHasNotification] = useState(false);

  const openSheet = () => {
    setSheetState("half");
    setHasNotification(false);
  };

  /* ── Al montar: restaurar informe persistido si existe ── */
  useEffect(() => {
    const email = analysis.datosUsuario.email?.trim().toLowerCase();
    if (!email) return;
    const saved = loadInforme(email);
    if (saved) {
      setInforme(saved);
      // Ya enviado anteriormente: no reenviar al mismo correo en esta sesión.
      autoSentEmailsRef.current.add(email);
    }
  }, [analysis.datosUsuario.email, loadInforme]);

  /* ── Detect progress milestone ── */
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

  const handleGenerateAndSend = useCallback(async () => {
    const result = await generateInforme();
    if (result) {
      setInforme(result);
      await sendDiagnosis(result);
    } else {
      setShowSendingModal(false);
    }
  }, [generateInforme, sendDiagnosis]);

  const handleGenerateAndShow = useCallback(async () => {
    const result = await generateInforme();
    if (result) {
      setInforme(result);
      setShowPreview(true);
    }
  }, [generateInforme]);

  /* ── Push dataLayer events for GTM ── */
  const pushedCompletedRef = useRef(false);
  const pushedSentRef = useRef(false);

  /* ── Auto-trigger diagnosis when completed ──
     Se dispara una vez por cada correo distinto. Si el usuario corrige el
     correo (typo), el nuevo no estará en `autoSentEmailsRef` y volveremos a
     enviar el diagnóstico al correo actualizado, sin tocar el rate-limit
     (rate-limit se aplica por dirección, no global). */
  useEffect(() => {
    const rawEmail = analysis.datosUsuario.email;
    const email = rawEmail?.trim().toLowerCase();
    const nombre = analysis.datosUsuario.nombre;

    if (!analysis.completado || !nombre || !email || isSending) return;
    if (autoSentEmailsRef.current.has(email)) return;

    // Marcamos antes de la llamada async para evitar re-disparos por
    // re-renders mientras la solicitud está en vuelo.
    autoSentEmailsRef.current.add(email);
    // GTM: diagnóstico completado (solo una vez por sesión)
    if (!pushedCompletedRef.current && typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "diagnostico_completado",
        email,
        nombre,
        camino: analysis.camino,
        fuga_principal: analysis.fugaPrincipal,
      });
      pushedCompletedRef.current = true;
    }

    // Si ya se envió a este correo en esta sesión o estamos dentro del rate
    // limit (5 min), no reenviamos: solo mostramos el diagnóstico.
    if (isSessionSent(email) || isRateLimited(email)) {
      if (!informe) handleGenerateAndShow();
      else setShowPreview(true);
      return;
    }

    // Si el correo cambió y ya teníamos un informe generado, lo reusamos.
    if (informe) {
      setShowSendingModal(true);
      sendDiagnosis(informe);
      return;
    }

    // Primer envío: insertar mensaje de preparación y generar + enviar.
    addMessage({
      role: "assistant",
      content: `Gracias, ${nombre}. Estoy preparando tu Mapa de Fugas personalizado. Esto tomará unos segundos...`,
      type: "text",
    });

    setShowSendingModal(true);
    handleGenerateAndSend();
  }, [
    analysis.completado,
    analysis.datosUsuario.nombre,
    analysis.datosUsuario.email,
    informe,
    isSending,
    isSessionSent,
    isRateLimited,
    addMessage,
    handleGenerateAndShow,
    handleGenerateAndSend,
    sendDiagnosis,
  ]);

  /* ── Handle send result: mostrar preview y limpiar ── */
  useEffect(() => {
    if (!sendResult) return;

    setShowSendingModal(false);

    if (sendResult.success) {
      setShowPreview(true);
      // GTM: informe enviado (solo una vez por sesión)
      if (!pushedSentRef.current && typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({
          event: "informe_enviado",
          email: analysis.datosUsuario.email?.trim().toLowerCase(),
          nombre: analysis.datosUsuario.nombre,
        });
        pushedSentRef.current = true;
      }
    }

    // Importante: limpiar sendResult para evitar re-disparo
    const timer = setTimeout(() => {
      // No limpiamos sendResult aquí para mantener el estado visible,
      // pero sí marcamos que ya fue procesado
    }, 100);

    return () => clearTimeout(timer);
  }, [sendResult]);

  const handleResend = async () => {
    if (!informe) return;
    setShowSendingModal(true);
    // No marcamos como enviado aquí: sendDiagnosis lo hace solo si la
    // respuesta del webhook es OK. Marcar antes hacía que un envío fallido
    // quedara registrado como exitoso.
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
        onTimeout={() => {
          // El modal mostrará el estado de error; el envío real puede seguir en
          // segundo plano y, si llega `sendResult`, el efecto de abajo lo cerrará.
        }}
        onRetry={() => {
          if (informe) {
            handleResend();
          } else {
            setShowSendingModal(false);
            // Permitir que el auto-trigger vuelva a intentarlo para el correo
            // actual.
            const email = analysis.datosUsuario.email?.trim().toLowerCase();
            if (email) autoSentEmailsRef.current.delete(email);
          }
        }}
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
