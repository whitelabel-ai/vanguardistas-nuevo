"use client";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { AudioWaveform } from "./AudioWaveform";
import { Send, Mic, Square, X, Play, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendAudio: (blob: Blob) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, onSendAudio, isLoading }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [playingRecorded, setPlayingRecorded] = useState(false);
  const recordedAudio = useRef<HTMLAudioElement | null>(null);
  const [recordStream, setRecordStream] = useState<MediaStream | null>(null);

  const {
    isRecording,
    recordingDuration,
    recordedBlob,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecorder,
  } = useMediaRecorder();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 500);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    onSendMessage(trimmed);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(Math.max(textareaRef.current.scrollHeight, 48), 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  const handleAudioToggle = async () => {
    if (isRecording) {
      stopRecording();
      if (recordStream) {
        recordStream.getTracks().forEach((t) => t.stop());
        setRecordStream(null);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setRecordStream(stream);
        await startRecording();
      } catch (err) {
        console.error("Mic access denied:", err);
      }
    }
  };

  const handleCancelRecording = () => {
    if (playingRecorded && recordedAudio.current) {
      recordedAudio.current.pause();
      recordedAudio.current = null;
      setPlayingRecorded(false);
    }
    cancelRecording();
    if (recordStream) {
      recordStream.getTracks().forEach((t) => t.stop());
      setRecordStream(null);
    }
  };

  const handleSendRecorded = () => {
    if (recordedBlob) {
      if (recordedAudio.current) {
        recordedAudio.current.pause();
        recordedAudio.current = null;
        setPlayingRecorded(false);
      }
      onSendAudio(recordedBlob);
      resetRecorder();
      if (recordStream) {
        recordStream.getTracks().forEach((t) => t.stop());
        setRecordStream(null);
      }
    }
  };

  const handlePlayPauseRecorded = () => {
    if (!recordedBlob) return;
    if (playingRecorded && recordedAudio.current) {
      recordedAudio.current.pause();
      recordedAudio.current = null;
      setPlayingRecorded(false);
    } else {
      const url = URL.createObjectURL(recordedBlob);
      const audio = new Audio(url);
      recordedAudio.current = audio;
      audio.onended = () => {
        setPlayingRecorded(false);
        recordedAudio.current = null;
      };
      audio.play();
      setPlayingRecorded(true);
    }
  };

  const minutes = Math.floor(recordingDuration / 60);
  const seconds = recordingDuration % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const showAudioRecorder = isRecording || recordedBlob;

  return (
    <div className="border-t border-white/5 p-4">
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {showAudioRecorder ? (
            <motion.div
              key="recorder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3"
            >
              {isRecording ? (
                <div className="flex items-center gap-3 bg-secondary/50 rounded-full px-4 py-2.5 flex-1">
                  {/* Live waveform */}
                  <div className="flex-1">
                    <AudioWaveform isRecording={isRecording} stream={recordStream} />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse recording-ring" />
                    <span className="text-sm font-mono text-foreground tabular-nums">{timeString}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-full hover:bg-destructive/20"
                      onClick={handleCancelRecording}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="w-8 h-8 rounded-full"
                      onClick={() => {
                        stopRecording();
                        if (recordStream) {
                          recordStream.getTracks().forEach((t) => t.stop());
                          setRecordStream(null);
                        }
                      }}
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-secondary/50 rounded-full px-4 py-2.5 flex-1">
                  <button
                    onClick={handlePlayPauseRecorded}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors flex-shrink-0"
                  >
                    {playingRecorded ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>
                  <span className="text-sm text-muted-foreground flex-1">Audio grabado</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-full hover:bg-destructive/20"
                      onClick={handleCancelRecording}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="gradient"
                      size="icon"
                      className="w-8 h-8 rounded-full"
                      onClick={handleSendRecorded}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onInput={handleInput}
                  placeholder="Empieza saludando para comenzar tu diagnóstico gratuito..."
                  className="min-h-[48px] max-h-[120px] pr-12 bg-secondary/50 border-white/10 text-foreground placeholder:text-muted-foreground rounded-2xl py-3 px-4 resize-none"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={handleAudioToggle}
                  className={`absolute right-3 bottom-2.5 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors ${
                    isMobile && inputValue.trim() ? "hidden" : "flex"
                  }`}
                  type="button"
                >
                  <Mic className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <Button
                variant="gradient"
                size="icon"
                className="w-10 h-10 rounded-full flex-shrink-0"
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
