import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#0B0B16",
    fontFamily: "Helvetica",
    color: "#E8E4F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: "#DD256C",
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: "contain",
  },
  title: {
    fontSize: 24,
    color: "#DD256C",
    fontWeight: "bold",
    marginLeft: 20,
  },
  subtitle: {
    fontSize: 12,
    color: "#E8E4F5",
    opacity: 0.7,
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#FFC906",
    fontWeight: "bold",
    marginBottom: 12,
  },
  scoreContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
  },
  scoreLabel: {
    fontSize: 11,
    color: "#E8E4F5",
    opacity: 0.7,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#DD256C",
  },
  barContainer: {
    width: "100%",
    height: 12,
    backgroundColor: "#2a2a3e",
    borderRadius: 6,
    marginTop: 8,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 6,
  },
  globalScore: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFC906",
    textAlign: "center",
    marginVertical: 20,
  },
  nivelBadge: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 25,
    alignSelf: "center",
    marginBottom: 20,
  },
  nivelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  fugaBox: {
    backgroundColor: "#1a1a2e",
    borderLeftWidth: 4,
    borderLeftColor: "#DD256C",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  fugaTitle: {
    fontSize: 14,
    color: "#DD256C",
    fontWeight: "bold",
    marginBottom: 5,
  },
  fugaText: {
    fontSize: 12,
    color: "#E8E4F5",
    lineHeight: 1.6,
  },
  ctaBox: {
    backgroundColor: "#DD256C",
    borderRadius: 12,
    padding: 20,
    marginTop: 30,
    alignItems: "center",
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  ctaSub: {
    color: "#fff",
    fontSize: 11,
    opacity: 0.9,
    textAlign: "center",
  },
  footer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: "#2a2a3e",
    paddingTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 10,
    color: "#E8E4F5",
    opacity: 0.5,
  },
  badgePotencial: {
    backgroundColor: "#FFC906",
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 15,
    alignSelf: "center",
    marginBottom: 15,
  },
  badgePotencialText: {
    color: "#0B0B16",
    fontSize: 12,
    fontWeight: "bold",
  },
});

function getNivelInfo(nivel: number | null) {
  switch (nivel) {
    case 1:
      return { nombre: "El Lienzo en Blanco", emoji: "🎨", color: "#FF3CAC" };
    case 2:
      return { nombre: "El Impresionista Difuso", emoji: "🖼️", color: "#FFC906" };
    case 3:
      return { nombre: "El Visionario Encerrado", emoji: "🏛️", color: "#00D9A5" };
    default:
      return { nombre: "Sin clasificar", emoji: "❓", color: "#888" };
  }
}

function getBarColor(score: number) {
  if (score <= 4) return "#FF3CAC";
  if (score <= 7) return "#FFC906";
  return "#00D9A5";
}

export interface DiagnosticoPDFData {
  nombre: string;
  empresa?: string;
  camino: string | null;
  scores: {
    marketing: number;
    experiencia: number;
    global: number;
  };
  nivel: number | null;
  esClientePotencial: boolean;
  fugaPrincipal: string;
  intervencionUrgente: string;
  informe: string;
}

export function DiagnosticoPDF({ data }: { data: DiagnosticoPDFData }) {
  const nivelInfo = getNivelInfo(data.nivel);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Image
            src="https://vanguardistas.netlify.app/assets/img/logo-vanguardistas.png"
            style={styles.logo}
          />
          <View>
            <Text style={styles.title}>Mapa de Fugas</Text>
            <Text style={styles.subtitle}>Diagnóstico de Presencia Digital</Text>
          </View>
        </View>

        {data.esClientePotencial && (
          <View style={styles.badgePotencial}>
            <Text style={styles.badgePotencialText}>⭐ Cliente Potencial</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>El Estado de tu Obra Digital</Text>
          <View style={styles.scoreContainer}>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Atracción (Marketing)</Text>
              <Text style={styles.scoreValue}>{data.scores.marketing}/10</Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${data.scores.marketing * 10}%`,
                      backgroundColor: getBarColor(data.scores.marketing),
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>Conversión (Experiencia)</Text>
              <Text style={styles.scoreValue}>{data.scores.experiencia}/10</Text>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${data.scores.experiencia * 10}%`,
                      backgroundColor: getBarColor(data.scores.experiencia),
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <Text style={styles.globalScore}>{data.scores.global}/100</Text>

          <View style={[styles.nivelBadge, { backgroundColor: nivelInfo.color }]}>
            <Text style={styles.nivelText}>
              {nivelInfo.emoji} {nivelInfo.nombre}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>La Fuga Detectada</Text>
          <View style={styles.fugaBox}>
            <Text style={styles.fugaTitle}>{data.fugaPrincipal}</Text>
            <Text style={styles.fugaText}>
              Estás en un estado de {data.fugaPrincipal}. Esto significa que estás perdiendo
              oportunidades de venta antes de que siquiera te conozcan, o durante el proceso de cierre.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Intervención Urgente</Text>
          <Text style={{ fontSize: 14, color: "#FFC906", marginBottom: 10 }}>
            {data.intervencionUrgente}
          </Text>
          <Text style={styles.fugaText}>
            Esta es tu acción prioritaria. Si la ejecutas esta semana, verás un cambio tangible en tu
            pipeline de ventas.
          </Text>
        </View>

        <View style={styles.ctaBox}>
          <Text style={styles.ctaText}>Reclama tu Sesión de Curaduría Estratégica</Text>
          <Text style={styles.ctaSub}>
            Una sesión gratuita de 30 minutos para profundizar en tu Mapa de Fugas y diseñar un plan
            de acción a medida.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 Vanguardistas. Todos los derechos reservados.</Text>
          <Text style={styles.footerText}>Bogotá, Colombia</Text>
        </View>
      </Page>
    </Document>
  );
}
