import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import SiteLayout from "@/components/SiteLayout";
import { useAuth } from "@/src/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithOtp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const redirectTo = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const base = window.location.origin;
    // Tras login volvemos aquí (login) y redirigimos a /landing/app si hay user
    return `${base}/landing/login`;
  }, []);

  // Si ya hay usuario logueado, manda a /landing/app (tu zona privada)
  useEffect(() => {
    if (!loading && user) {
      const next = router.query.next ? String(router.query.next) : "/landing/app";
      router.replace(next);
    }
  }, [loading, user, router]);

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!email) {
      setMsg("Introduce tu email.");
      return;
    }
    const { error } = await signInWithOtp(email, redirectTo);
    setMsg(error ? "No se pudo enviar el enlace. Revisa el email." : "¡Enlace enviado! Revisa tu correo.");
  };

  const handleGoogle = async () => {
    setMsg("");
    const { error } = await signInWithGoogle(redirectTo);
    if (error) setMsg("No se pudo iniciar sesión con Google.");
  };

  return (
    <SiteLayout>
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        {/* Columna izquierda: copy */}
        <div className="self-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-300">
            🔐 Acceso
            <span className="text-white/70">Seguro y rápido</span>
          </div>
          <h1 className="mt-4 bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-4xl font-extrabold leading-tight text-transparent">
            Entra para encontrar tu pareja ideal
          </h1>
          <p className="mt-4 text-gray-300">
            Usa un enlace mágico al email o inicia con Google. Sin contraseñas.
          </p>
        </div>

        {/* Columna derecha: tarjeta de login */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <form onSubmit={handleMagicLink} className="space-y-4">
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black hover:brightness-110"
            >
              Enviarme enlace de acceso
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-gray-400">
            <div className="h-px flex-1 bg-white/10" />
            o
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold hover:bg-white/10"
          >
            Continuar con Google
          </button>

          {msg && <p className="mt-3 text-sm text-gray-300">{msg}</p>}

          <p className="mt-6 text-xs text-gray-400">
            Al continuar, aceptas nuestros Términos y Política de Privacidad.
          </p>
        </div>
      </div>
    </SiteLayout>
  );
}
