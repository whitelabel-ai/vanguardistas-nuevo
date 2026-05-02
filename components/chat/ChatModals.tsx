"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ChatModalsProps {
  howItWorksOpen: boolean;
  setHowItWorksOpen: (open: boolean) => void;
  whatYouGetOpen: boolean;
  setWhatYouGetOpen: (open: boolean) => void;
}

export function ChatModals({
  howItWorksOpen,
  setHowItWorksOpen,
  whatYouGetOpen,
  setWhatYouGetOpen,
}: ChatModalsProps) {
  return (
    <>
      {/* How It Works Modal */}
      <Dialog open={howItWorksOpen} onOpenChange={setHowItWorksOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader className="items-center">
            <Image
              src="/img/logo-texto-vanguardistas.png"
              alt="Vanguardistas"
              width={180}
              height={50}
              className="h-10 w-auto mb-4"
            />
            <DialogTitle className="text-xl text-foreground">
              ¿Cómo usaremos tus respuestas?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Tus respuestas son nuestra precisión. Con nuestra metodología, construimos un plan
              digital singular y adaptado a tu marca para que vendas más y mejor.
            </p>
            <p>Retratamos tu esencia y propósito. Descubrimos tus valores.</p>
            <p>Descomponemos tus desafíos. Identificamos problemas y oportunidades.</p>
            <p>Reinterpretamos tu futuro. Diseñamos tu plan preciso para vender más.</p>
          </div>
          <Button
            variant="gradient"
            className="w-full mt-4 rounded-full"
            onClick={() => setHowItWorksOpen(false)}
          >
            ¡Entendido!
          </Button>
        </DialogContent>
      </Dialog>

      {/* What You Get Modal */}
      <Dialog open={whatYouGetOpen} onOpenChange={setWhatYouGetOpen}>
        <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="items-center">
            <Image
              src="/img/logo-texto-vanguardistas.png"
              alt="Vanguardistas"
              width={180}
              height={50}
              className="h-10 w-auto mb-4"
            />
            <DialogTitle className="text-xl text-foreground">
              ¿Qué vas a conseguir?
            </DialogTitle>
            <DialogDescription className="text-center">
              El pincel para tu plan digital. Esto es lo que conseguirás.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>
              <span className="text-pink-accent font-medium">Claridad y propósito:</span>{" "}
              Detectar dónde se están perdiendo tus ventas.
            </p>
            <p>
              <span className="text-pink-accent font-medium">Tu plan a medida:</span>{" "}
              Pasos claros para vender más, no plantillas.
            </p>
            <p>
              <span className="text-pink-accent font-medium">Ventas reales:</span>{" "}
              Conecta tu mensaje, simplifica y logra conversiones.
            </p>
            <p>
              <span className="text-pink-accent font-medium">Análisis Completo:</span>{" "}
              Diagnóstico 360° para atraer y fidelizar tus clientes.
            </p>
            <p>
              <span className="text-pink-accent font-medium">Foco en el Crecimiento:</span>{" "}
              Cuál es la métrica clave para ver tu avance real.
            </p>
            <p>
              <span className="text-pink-accent font-medium">Libera tu tiempo:</span>{" "}
              Negocio estable, sin frustración.
            </p>
          </div>
          <Button
            variant="gradient"
            className="w-full mt-4 rounded-full"
            onClick={() => setWhatYouGetOpen(false)}
          >
            ¡Entendido!
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
