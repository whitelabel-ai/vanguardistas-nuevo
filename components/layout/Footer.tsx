import Link from "next/link";
import Image from "next/image";

const socialLinks = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/vanguardistas.co?igsh=MWN6ajVrbXBtaHhncw==",
    icon: "/img/logo-instagram.png",
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@vanguardistas_co",
    icon: "/img/logo-youtube.svg",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/vanguardistasmarketing/",
    icon: "/img/logo-linkedIn.svg",
  },
];

export function Footer() {
  return (
    <footer className="bg-black border-t border-white/5">
      {/* Main Footer */}
      <div className="max-w-[1230px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src="/img/logo-texto-vanguardistas.png"
              alt="Vanguardistas Logo"
              width={200}
              height={60}
              className="h-14 w-auto"
            />
          </div>

          {/* Social Links */}
          <div className="flex flex-col items-center lg:items-end gap-5">
            <h4 className="text-sm font-medium text-white/80 uppercase tracking-wider">
              Contáctanos en nuestras redes
            </h4>
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Image
                    src={link.icon}
                    alt={link.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/5">
        <div className="max-w-[1430px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-white/50 space-y-2">
            <p>© 2025 All Rights Reserved.</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/privacypolicy" className="hover:text-white/80 transition-colors">
                Política de privacidad
              </Link>
              <Link href="/termsandconditions" className="hover:text-white/80 transition-colors">
                Términos y condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
