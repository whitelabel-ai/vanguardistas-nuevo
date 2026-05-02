"use client";

import { Button } from "@/components/ui/button";
import { Square, Play, Pause, Send, X } from "lucide-react";

interface AudioRecorderProps {
  isRecording: boolean;
  recordingDuration: number;
  recordedBlob: Blob | null;
  onStop: () => void;
  onCancel: () => void;
  onSend: () => void;
  onPlayPause: () => void;
  isPlaying: boolean;
}

export function AudioRecorder({
  isRecording,
  recordingDuration,
  recordedBlob,
  onStop,
  onCancel,
  onSend,
  onPlayPause,
  isPlaying,
}: AudioRecorderProps) {
  const minutes = Math.floor(recordingDuration / 60);
  const seconds = recordingDuration % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  if (recordedBlob) {
    // Playback state
    return (
      <div className="flex items-center gap-3 bg-secondary/50 rounded-full px-4 py-2 flex-1">
        <button
          onClick={onPlayPause}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>
        <span className="text-sm text-muted-foreground flex-1">Audio grabado</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 rounded-full hover:bg-destructive/20"
            onClick={onCancel}
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            variant="gradient"
            size="icon"
            className="w-8 h-8 rounded-full"
            onClick={onSend}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-secondary/50 rounded-full px-4 py-2 flex-1">
      <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
      <span className="text-sm font-mono text-foreground">{timeString}</span>
      <span className="text-xs text-muted-foreground flex-1">Grabando...</span>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="w-8 h-8 rounded-full hover:bg-destructive/20"
          onClick={onCancel}
        >
          <X className="w-4 h-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          className="w-8 h-8 rounded-full"
          onClick={onStop}
        >
          <Square className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
