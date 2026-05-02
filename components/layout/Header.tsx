"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const pathname = usePathname();

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
          <nav className="flex items-center gap-4">
            {pathname === "/" ? (
              <Link href="/about">
                <Button
                  variant="gradient"
                  size="sm"
                  className="rounded-full px-6 font-medium"
                >
                  Nosotros
                </Button>
              </Link>
            ) : (
              <Link href="/">
                <Button
                  variant="gradient"
                  size="sm"
                  className="rounded-full px-6 font-medium"
                >
                  Mi diagnóstico
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
