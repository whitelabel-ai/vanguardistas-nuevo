export interface Pregunta {
  id: string;
  seccion: "Retratar" | "Descomponer" | "Reinterpretar";
  pregunta: string;
  opciones: {
    A: { texto: string; puntos: number };
    B: { texto: string; puntos: number };
    C: { texto: string; puntos: number };
  };
}

export const bancoPreguntas: Pregunta[] = [
  {
    id: "P1",
    seccion: "Retratar",
    pregunta: "¿Qué es lo que te inspira a trabajar cada día?",
    opciones: {
      A: { texto: "Ver a mis clientes contentos y saber que mi servicio es de confianza para ellos.", puntos: 1 },
      B: { texto: "Construir un negocio estable para mi familia.", puntos: 1 },
      C: { texto: "Saber que estoy dejando una huella y generando un movimiento de cambio en mi sector.", puntos: 3 },
    },
  },
  {
    id: "P2",
    seccion: "Retratar",
    pregunta: "¿Qué vendes y a qué sector te diriges?",
    opciones: {
      A: { texto: "Abierta (respuesta libre)", puntos: 0 },
      B: { texto: "Abierta (respuesta libre)", puntos: 0 },
      C: { texto: "Abierta (respuesta libre)", puntos: 0 },
    },
  },
  {
    id: "P3",
    seccion: "Retratar",
    pregunta: "¿Qué emociones quieres que tu marca transmita a tus clientes?",
    opciones: {
      A: { texto: "Confianza, responsabilidad y un servicio de calidad. Que la gente sepa que pueden contar conmigo.", puntos: 1 },
      B: { texto: "Autenticidad, coherencia y profesionalismo. Que la gente se sienta inspirada.", puntos: 3 },
      C: { texto: "Seguridad, simplicidad y cercanía. Que mis clientes se sientan acompañados y sin frustración.", puntos: 1 },
    },
  },
  {
    id: "P4",
    seccion: "Descomponer",
    pregunta: "¿Cuál es el principal problema que enfrentas con respecto a tus ventas hoy?",
    opciones: {
      A: { texto: "No sé cómo vender por internet. Todo es por referidos y el 'boca a boca'.", puntos: 1 },
      B: { texto: "Mi sitio web o embudo de ventas no está convirtiendo. Recibo visitas, pero no se traducen en clientes.", puntos: 3 },
      C: { texto: "Mis ventas dependen totalmente de mi tiempo, y siento que no puedo crecer más sin sacrificar mi vida personal.", puntos: 1 },
    },
  },
  {
    id: "P5",
    seccion: "Descomponer",
    pregunta: "¿Hasta qué punto conoces a profundidad a tu cliente ideal y el problema específico que tu marca/empresa resuelve para ellos?",
    opciones: {
      A: { texto: "Conozco a mis clientes por el trato personal, pero no tengo una estrategia definida para identificar a nuevos clientes.", puntos: 1 },
      B: { texto: "Siento que me he desconectado de mi cliente ideal. Mi comunicación ya no resuena con sus necesidades.", puntos: 3 },
      C: { texto: "Sé que tengo un valor único, pero me cuesta comunicarlo y diferenciarme de la competencia.", puntos: 3 },
    },
  },
  {
    id: "P6",
    seccion: "Descomponer",
    pregunta: "¿Cómo describirías la experiencia que tus clientes viven al interactuar con tu marca?",
    opciones: {
      A: { texto: "La atención es muy cercana y humana, pero los procesos para vender son lentos y manuales.", puntos: 1 },
      B: { texto: "Mi servicio es excelente, pero mi presencia digital no está a la altura de mi marca y me hace ver menos profesional.", puntos: 3 },
      C: { texto: "Mis clientes son leales, pero el proceso de compra tiene muchos pasos. Necesito simplificar más.", puntos: 3 },
    },
  },
  {
    id: "P7",
    seccion: "Descomponer",
    pregunta: "¿Qué tan visible eres a nivel digital?",
    opciones: {
      A: { texto: "Cero. No tengo página web y mis redes sociales son una tarjeta de presentación.", puntos: 1 },
      B: { texto: "La gente me encuentra, pero no convierte. Siento que mi presencia digital es básica y no genera resultados.", puntos: 3 },
      C: { texto: "Mi sitio web y redes sociales no reflejan la esencia de mi marca.", puntos: 3 },
    },
  },
  {
    id: "P8",
    seccion: "Reinterpretar",
    pregunta: "¿Qué objetivo refleja mejor lo que quieres lograr con tu marca a nivel digital?",
    opciones: {
      A: { texto: "Quiero vender mis productos/servicios por internet sin complicaciones, para tener un ingreso extra y crecer de forma segura.", puntos: 1 },
      B: { texto: "Necesito una renovación profunda que conecte la esencia de mi marca con resultados tangibles.", puntos: 3 },
      C: { texto: "Quiero que mi marca recupere su diferenciación, inspire a mi audiencia y genere resultados medibles.", puntos: 3 },
    },
  },
  {
    id: "P9",
    seccion: "Reinterpretar",
    pregunta: "¿Cuáles son los recursos existentes que cuentas actualmente para mejorar tu presencia digital?",
    opciones: {
      A: { texto: "No tengo presupuesto fijo para marketing digital, pero si veo valor y resultados, haré el esfuerzo.", puntos: 1 },
      B: { texto: "He invertido en marketing y branding antes, pero no logré los resultados esperados.", puntos: 3 },
      C: { texto: "Tengo un equipo que opera, pero sentimos que la marca perdió su frescura y dirección.", puntos: 3 },
    },
  },
  {
    id: "P10",
    seccion: "Reinterpretar",
    pregunta: "Cuando mires atrás, ¿qué te hará sentir que este proceso ha sido un éxito para tu negocio?",
    opciones: {
      A: { texto: "Lograr un flujo constante de clientes nuevos al mes, sin depender del 'boca a boca' y de forma estable para mi negocio.", puntos: 1 },
      B: { texto: "Poder tomarme unas vacaciones sin miedo a que el negocio se detenga, porque ya funciona digitalmente.", puntos: 1 },
      C: { texto: "Sentirme en control de mi negocio, sabiendo que puedo competir y atraer clientes sin la frustración que me causa la tecnología.", puntos: 3 },
    },
  },
];

export function calcularScore(respuestas: Record<string, string>): {
  score: number;
  buyerPersona: string;
  breakdown: { pregunta: string; opcion: string; puntos: number }[];
} {
  let score = 0;
  const breakdown: { pregunta: string; opcion: string; puntos: number }[] = [];

  for (const pregunta of bancoPreguntas) {
    if (pregunta.id === "P2") continue; // Pregunta abierta, no puntúa

    const respuesta = respuestas[pregunta.pregunta];
    if (!respuesta) continue;

    // Buscar qué opción coincide semánticamente
    let mejorOpcion: "A" | "B" | "C" | null = null;
    let maxSimilitud = 0;

    for (const [opcion, data] of Object.entries(pregunta.opciones) as ["A" | "B" | "C", { texto: string; puntos: number }][]) {
      const similitud = calcularSimilitud(respuesta, data.texto);
      if (similitud > maxSimilitud) {
        maxSimilitud = similitud;
        mejorOpcion = opcion;
      }
    }

    if (mejorOpcion) {
      const puntos = pregunta.opciones[mejorOpcion].puntos;
      score += puntos;
      breakdown.push({
        pregunta: pregunta.pregunta,
        opcion: mejorOpcion,
        puntos,
      });
    }
  }

  const buyerPersona =
    score >= 10 && score <= 20
      ? "Dueño de Pyme Tradicional"
      : score >= 21 && score <= 30
      ? "Empresa que busca Renovación digital"
      : "Perfil en evaluación";

  return { score, buyerPersona, breakdown };
}

function calcularSimilitud(a: string, b: string): number {
  // Simple similitud de palabras clave
  const wordsA = a.toLowerCase().split(/\s+/);
  const wordsB = b.toLowerCase().split(/\s+/);
  const intersection = wordsA.filter((word) => wordsB.includes(word));
  return intersection.length / Math.max(wordsA.length, wordsB.length);
}

export function getPreguntaByText(texto: string): Pregunta | undefined {
  return bancoPreguntas.find((p) => p.pregunta === texto);
}
