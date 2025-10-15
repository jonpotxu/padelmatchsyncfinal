import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SiteLayout from "@/components/SiteLayout";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/src/AuthContext";
import { useRouter } from "next/router";

// Crea (si no existe) el enlace de pareja entre inviterId y currentUserId
async function ensurePairLink(inviterId, currentUserId) {
  if (!inviterId || !currentUserId || inviterId === currentUserId) return { ok: false, reason: "ids_invalidos" };

  // ¿Ya hay una pareja activa en cualquier orden?
  const { data: existing, error: selErr } = await supabase
    .from("partner_links")
    .select("*")
    .or(`and(a_user.eq.${inviterId},b_user.eq.${currentUserId}),and(a_user.eq.${currentUserId},b_user.eq.${inviterId})`)
    .eq("active", true)
    .maybeSingle();

  if (selErr) return { ok: false, reason: "select_error" };
  if (existing) return { ok: true, reason: "ya_existia" };

  // Crea la pareja activa
  const { error: insErr, data: insData } = await supabase
    .from("partner_links")
    .insert([{ a_user: inviterId, b_user: currentUserId, active: true }])
    .select()
    .maybeSingle();

  if (insErr) return { ok: false, reason: "insert_error" };

  // Historial para ambos (opcional)
  await supabase.from("partner_history").insert([
    { user_id: inviterId, event: "start_pair", note: `Pareja con ${currentUserId}` },
    { user_id: currentUserId, event: "start_pair", note: `Pareja con ${inviterId}` },
  ]);

  // Marca perfiles como “reliable” (opcional) o al menos no-looking
  await supabase.from("profiles").update({ pair_status: "reliable", seeking_pair: false }).eq("id", inviterId);
  await supabase.from("profiles").update({ pair_status: "reliable", seeking_pair: false }).eq("id", currentUserId);

  return { ok: true, reason: "creada", data: insData };
}

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const origin = useMemo(() => (typeof window !== "undefined" ? window.location.origin : ""), []);

  // Si viene invited_by en la URL y el usuario ya está logueado, creamos pareja
  useEffect(() => {
    (async () => {
      if (loading) return;
      const inviterId = router.query?.invited_by;
      if (user && inviterId) {
        const res = await ensurePairLink(inviterId, user.id);
        if (res.ok) setMsg(res.reason === "ya_existia" ? "✅ Pareja ya estaba activa." : "✅ Pareja creada.");
        else setMsg("⚠️ No se pudo crear la pareja automáticamente.");
        // Limpiamos la query para evitar repetir
        const clean = { pathname: router.pathname, query: {} };
        router.replace(clean, undefined, { shallow: true });
        // Redirige a Mi área
        setTimeout(() => router.push("/landing/app"), 600);
      }
    })();
  }, [user, loading, router]);

  const loginWithEmail = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!email) {
      setMsg("Indica un email válido.");
      return;
    }
    try {
      setBusy(true);
      // Enlace mágico normal (sin invitación)
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/landing/login`,
        },
      });
      setMsg("✅ Te hemos enviado un enlace. Revisa tu correo (y spam).");
      setEmail("");
    } catch {
      setMsg("❌ No se pudo enviar el enlace.");
    } finally {
      setBusy(false);
    }
  };

  const loginWithGoogle = async () => {
    setMsg("");
    try {
      setBusy(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/landing/login`,
        },
      });
      if (error) throw error;
    } catch {
      setMsg("❌ No se pudo iniciar sesión con Google.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <SiteLayout>
        <p className="text-gray-400">Cargando…</p>
      </SiteLayout>
    );
  }

  if (user) {
    // Si ya hay sesión, vete a Mi área
    if (typeof window !== "undefined") router.replace("/landing/app");
    return null;
  }

  return (
    <SiteLayout>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2">Entrar / Registrarse</h1>
        <p className="text-gray-400 mb-6">Usa enlace mágico o Google. Si no tienes cuenta, la creamos al momento.</p>

        <form onSubmit={loginWithEmail} className="space-y-3">
          <input
            type="email"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            placeholder="tú@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            disabled={busy}
            className={`w-full px-4 py-3 rounded-2xl font-semibold ${
              busy ? "bg-white/10 text-gray-500 cursor-not-allowed" : "bg-emerald-500 text-black hover:brightness-110"
            }`}
          >
            {busy ? "Enviando…" : "Entrar con enlace mágico"}
          </button>
        </form>

        <div className="my-4 text-center text-sm text-gray-500">— o —</div>

        <button
          onClick={loginWithGoogle}
          disabled={busy}
          className={`w-full px-4 py-3 rounded-2xl font-semibold border border-white/15 bg-white/5 hover:bg-white/10 ${
            busy ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          Continuar con Google
        </button>

        {msg && <p className="mt-4 text-sm">{msg}</p>}

        <div className="mt-6 text-sm text-gray-400">
          <Link href="/landing" className="underline">Volver al inicio</Link>
        </div>
      </div>
    </SiteLayout>
  );
}
