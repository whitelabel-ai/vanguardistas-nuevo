"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cleanMarkdown } from "@/lib/markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSanitize from "rehype-sanitize";
import { ArrowLeft, CalendarPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function ResumenPage() {
  const router = useRouter();
  const [content, setContent] = useState<{
    markdown: string;
    date: string | null;
  } | null>(null);
  const [noStudy, setNoStudy] = useState(false);

  useEffect(() => {
    const studyReport = localStorage.getItem("studyReport");
    const studyTimestamp = localStorage.getItem("studyTimestamp");

    if (studyReport) {
      const cleaned = cleanMarkdown(studyReport);
      let date: string | null = null;
      if (studyTimestamp) {
        date = new Date(parseInt(studyTimestamp)).toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      setContent({ markdown: cleaned, date });
    } else {
      setNoStudy(true);
    }
  }, []);

  if (noStudy) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <h2 className="text-2xl font-bold text-white mb-4">No hay estudio disponible</h2>
          <p className="text-white/60 mb-8">
            No se encontró ningún estudio para mostrar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Chat
            </Button>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10"
              onClick={() => window.open("https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1VOvRLtpRq_-fEPeAwv3NtDlzbm8Lkl7jZRbpQffc9FcId7Puw1Hwy6_O_ijtFWCaXmKjguf2t", "_blank")}
            >
              <CalendarPlus className="w-4 h-4 mr-2" />
              Agendar cita
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Estudio de Mercado Completo
          </h1>
          {content?.date && (
            <p className="text-muted-foreground mb-8">Generado el: {content.date}</p>
          )}

          <div className="prose prose-invert prose-lg max-w-none bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-10">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeSanitize]}
            >
              {content?.markdown || ""}
            </ReactMarkdown>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button variant="gradient" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Chat
            </Button>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10"
              onClick={() => window.open("https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1VOvRLtpRq_-fEPeAwv3NtDlzbm8Lkl7jZRbpQffc9FcId7Puw1Hwy6_O_ijtFWCaXmKjguf2t", "_blank")}
            >
              <CalendarPlus className="w-4 h-4 mr-2" />
              Agendar cita
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
