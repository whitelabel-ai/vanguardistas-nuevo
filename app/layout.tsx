import type { Metadata } from "next";
import { Lato, Anek_Odia } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Analytics, GtmNoScript } from "@/components/layout/Analytics";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

const anekOdia = Anek_Odia({
  variable: "--font-anek-odia",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vanguardistas Qubra",
  description: "Desafía tu estrategia digital. Logra tu plan para vender más adaptado a tu marca.",
  icons: {
    icon: "/img/favicon/qubra.ico",
    shortcut: "/img/favicon/qubra.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${lato.variable} ${anekOdia.variable} dark h-full antialiased`}>
      <head>
        <Analytics />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
 <GtmNoScript />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
