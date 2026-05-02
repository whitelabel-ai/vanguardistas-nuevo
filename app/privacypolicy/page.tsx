import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vanguardistas - Política de Privacidad",
  description: "Política de privacidad de Vanguardistas.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">
          Política de Privacidad
        </h1>

        <div className="space-y-8 text-white/80">
          <p>
            En Vanguardistas, valoramos tu confianza por encima de todo. Creemos firmemente que tus datos son un reflejo de tu marca y deben ser tratados con el mismo respeto con el que construimos nuestras soluciones. Esta política es nuestro acuerdo contigo, diseñado para que entiendas de forma simple cómo manejamos tu información.
          </p>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              ¿Qué datos recolectamos y para qué?
            </h2>
            <p>
              Cuando interactúas con nuestra plataforma de diagnóstico, recolectamos tus datos de contacto (nombre, correo electrónico, teléfono) e información sobre tu negocio. Lo hacemos con un solo propósito: analizar tus desafíos para entregarte un{" "}
              <span className="text-pink-accent font-medium">plan de acción único y a la medida de tu marca</span>. Usamos tu información para contactarte con los resultados de tu diagnóstico y, si lo deseas, guiarte hacia una sesión estratégica.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Tus datos son tuyos, no nuestros.
            </h2>
            <p>
              Tú siempre tienes el control. Puedes solicitarnos que te mostremos qué datos tenemos sobre ti, corregirlos si son incorrectos o pedirnos que los eliminemos cuando lo desees. Si tienes alguna duda, estamos aquí para ayudarte.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Nuestra promesa de seguridad.
            </h2>
            <p>
              Hemos implementado medidas de seguridad para proteger tu información. Para nosotros,{" "}
              <span className="text-green-accent font-medium">la confidencialidad es un valor fundamental</span>{" "}
              y una obligación para todos en Vanguardistas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
