import type { Metadata } from "next";
import { Space_Grotesk, Anek_Odia } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter";
import { Analytics, GtmNoScript } from "@/components/layout/Analytics";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
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
    <html lang="es" className={`${spaceGrotesk.variable} ${anekOdia.variable} dark h-full antialiased`}>
      <head>
        <Analytics />
      </head>
      <body className="min-h-full flex flex-col" style={{ background: "#0A0809", color: "#F2EFF1" }}>
        <GtmNoScript />
        <Header />
        <main className="flex-1">{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
