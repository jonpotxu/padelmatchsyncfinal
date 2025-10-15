// components/SiteLayout.jsx
import Link from "next/link";
import Image from "next/image";

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* NAV */}
      <header className="sticky top-0 z-30 backdrop-blur bg-black/30 border-b border-white/10">
        <nav className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="PadelMatch Sync" width={140} height={28} priority />
          </Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/landing/caracteristicas" className="hover:text-emerald-400">Características</Link>
            <Link href="/landing/sobre" className="hover:text-emerald-400">Sobre nosotros</Link>
            <Link href="/landing/contacto" className="hover:text-emerald-400">Contacto</Link>
            <Link href="/landing/formulario" className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-semibold hover:opacity-95">
              Regístrate gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-5 py-10">{children}</main>

      {/* FOOTER */}
      <footer className="mt-16 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-5 py-8 text-sm text-gray-400 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} PadelMatch Sync · Todos los derechos reservados</div>
          <div className="flex items-center gap-4">
            <Link href="/landing/sobre" className="hover:text-emerald-400">Sobre</Link>
            <Link href="/landing/caracteristicas" className="hover:text-emerald-400">Características</Link>
            <Link href="/landing/contacto" className="hover:text-emerald-400">Contacto</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
