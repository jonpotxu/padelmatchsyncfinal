import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function InvitePartner({ user }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const sendInvite = async (e) => {
    e.preventDefault();
    setMsg("");
    if (!email) {
      setMsg("Indica un email válido.");
      return;
    }
    try {
      setBusy(true);
      // Enviamos magic link con redirect que incluye invited_by=<tu_id>
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${origin}/landing/login?invited_by=${user.id}`,
        },
      });
      setMsg("✅ Invitación enviada. Pídeles que revisen su correo (spam incluido).");
      setEmail("");
    } catch (err) {
      setMsg("❌ No se pudo enviar la invitación.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-semibold mb-3">Invitar pareja</h3>
      <p className="text-sm text-gray-300 mb-3">
        Enviaremos un enlace mágico. Cuando acepte e inicie sesión, crearemos la pareja automáticamente.
      </p>
      <form onSubmit={sendInvite} className="flex items-center gap-3">
        <input
          type="email"
          className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
          placeholder="email@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          disabled={busy}
          className={`px-4 py-2 rounded-xl font-semibold ${
            busy ? "bg-white/10 text-gray-500 cursor-not-allowed" : "bg-emerald-500 text-black hover:brightness-110"
          }`}
        >
          {busy ? "Enviando…" : "Invitar"}
        </button>
      </form>
      {msg && <p className="mt-2 text-sm">{msg}</p>}
    </div>
  );
}
