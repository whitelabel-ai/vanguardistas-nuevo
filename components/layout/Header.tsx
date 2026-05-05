"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

  const isLive = pathname === "/live";
  const isLegacy = pathname === "/legacy";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1430px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/img/logo-vanguardistas.png"
              alt="Vanguardistas"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3">
            {isLive ? (
              <>
                <Link href="/#servicios">
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 hidden md:inline-flex">
                    Servicios
                  </Button>
                </Link>
                <Link href="/#como-funciona">
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 hidden md:inline-flex">
                    Cómo funciona
                  </Button>
                </Link>
                <Link href="/#para-quien">
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 hidden md:inline-flex">
                    ¿Para quién?
                  </Button>
                </Link>
              </>
            ) : isLegacy ? (
              <>
                <Link href="/live">
                  <Button
                    variant="gradient"
                    size="sm"
                    className="rounded-full px-6 font-medium"
                  >
                    Nuevo: Diagnóstico en Vivo
                  </Button>
                </Link>
                <Link href="/about">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Nosotros
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/#servicios">
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 hidden md:inline-flex">
                    Servicios
                  </Button>
                </Link>
                <Link href="/#como-funciona">
                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/10 hidden md:inline-flex">
                    Cómo funciona
                  </Button>
                </Link>
                <Link href="/live">
                  <button className="px-5 py-2 rounded-full border border-white/15 text-sm font-medium text-white/80 hover:text-white hover:border-white/30 transition-colors whitespace-nowrap">
                    Iniciar Diagnóstico
                  </button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
