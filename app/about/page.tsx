"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/about-bg-1.png"
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              Vanguardistas:
              <br />
              <span className="chat-gradient-text">Desafía tu estrategia digital</span>
            </h1>
            <div className="space-y-4 text-lg text-white/80">
              <p>
                No estás entrando a una agencia, estás entrando a un estudio de
                transformación de marcas.
              </p>
              <p>
                Todo lo que ves aquí, quién está detrás es Vanguardistas. Somos la marca que
                desafía lo convencional para que la tuya trascienda.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Qubra Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10">Yo soy Qubra</h2>
            <div className="relative w-48 h-48 mx-auto mb-10">
              <Image
                src="/img/qubra.png"
                alt="Qubra"
                fill
                className="object-contain"
              />
            </div>
            <div className="space-y-4 text-lg text-white/80">
              <p>
                ¿Mi propósito? Hackear lo{" "}
                <span className="text-pink-accent font-medium">convencional</span> y rearmar tu{" "}
                <span className="text-green-accent font-medium">camino digital</span>.
              </p>
              <p>
                Te entrego un plan completo, adaptado a tu marca y listo para ejecutarse. Y si
                quieres… El equipo Vanguardistas lo lleva a cabo con obsesión por el detalle,
                acompañándote para que cada estrategia, interacción y mensaje cumpla la meta que
                ya tienes.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/about-bg-2.png"
            alt=""
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/60" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-10 leading-tight">
              Dahiana Giraldo y
              <br />
              José David Rodríguez
            </h2>
            <div className="space-y-4 text-lg text-white/80 mb-12">
              <p>
                Creamos Vanguardistas para romper la regla más aburrida del marketing:
                que todas las marcas vendan igual.
              </p>
              <p>
                Nos ponemos en tus zapatos, entendemos a fondo tu modelo de negocio y
                traducimos lo complejo en un camino digital preciso: marketing,
                experiencia del cliente y tecnología funcionando como una orquesta
                sincronizada.
              </p>
              <p>
                Nuestra metodología captura las fugas de tu negocio; esos puntos donde se
                escapan tus ventas.
              </p>
              <p>
                ¿Cómo lo hacemos? Retratamos tu esencia. Descomponemos tus desafíos.
                Reinterpretamos tu futuro.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <p className="text-white font-medium mb-4">Y te ofrecemos los siguientes servicios:</p>
              <p className="text-white/80 leading-relaxed">
                Embudos que convierten.
                <br />
                Estrategias que conectan.
                <br />
                Contenidos que se comparten.
                <br />
                Publicidad que impacta.
                <br />
                Comunicación digital clara y eficaz.
                <br />
                Ecommerce que vende. IA que aprende contigo.
              </p>
              <p className="text-pink-accent font-medium mt-4">Y eso, es apenas el inicio…</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/about-bg-3.png"
            alt=""
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 text-center">
              Lo que dicen de nosotros
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Testimonial 1 */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-white mb-2">Quixa Group - Mauricio Ruiz</h3>
                <div className="w-12 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 mb-4" />
                <p className="text-pink-accent font-medium mb-3">
                  "Nos escuchan antes de presentar."
                </p>
                <p className="text-white/70 text-sm leading-relaxed">
                  En 16 años, pasamos por cinco agencias.
                  <br />
                  Solo Vanguardistas entró, escuchó y co-creó desde adentro.
                  <br />
                  Sin recetas. Sin humo. Solo estrategia hecha juntos.
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-white mb-2">Lihtsus Agile - Julián Jiménez</h3>
                <div className="w-12 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 mb-4" />
                <p className="text-pink-accent font-medium mb-3">
                  "Traducen lo que pensamos en algo que el mercado entiende."
                </p>
                <p className="text-white/70 text-sm leading-relaxed">
                  Tomaron nuestro propósito, lo escucharon a fondo
                  <br />
                  y lo convirtieron en estrategia visual y clara.
                  <br />
                  Lo que proponen siempre lleva el matiz exacto que deseamos como organización.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
