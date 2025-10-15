import Link from "next/link";
import { useAuth } from "@/src/AuthContext";

export default function SiteLayout({ children }) {
  const { user, signOut, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-3">
            <img src="/logo.svg" alt="PadelMatch Sync" className="w-7 h-7" />
            <span className="font-semibold tracking-wide">PadelMatch Sync</span>
          </Link>

          <nav className="flex items-center gap-5 text-sm">
            <Link href="/landing" className="hover:text-emerald-400">Inicio</Link>
            {loading ? (
              <span className="text-gray-400">Cargando…</span>
            ) : user ? (
              <>
                <Link href="/landing/app" className="hover:text-emerald-400">Mi área</Link>
                <button
                  onClick={signOut}
                  className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                href="/landing/login"
                className="px-3 py-1 rounded bg-emerald-500 text-black hover:brightness-110"
              >
                Entrar / Registrarse
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>

      <footer className="border-t border-white/10 text-xs text-gray-500 px-6 py-6">
        © {new Date().getFullYear()} PadelMatch Sync
      </footer>
    </div>
  );
}
