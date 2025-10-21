import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function InvitePartner({ user }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const origin = useMemo(
    () => (typeof window !== "undefined" ? window.location.origin : ""),
    []
  );

  const sendInvite = async () => {
    setMsg("");
    if (!email) {
      setMsg("Indica un email válido.");
      return;
    }
    try {
      setBusy(true);
      // Enlace mágico con invited_by
      const redirect = `${origin}/landing/login?invited_by=${encodeURIComponent(
        user.id
      )}`;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirect },
      });
      if (error) throw error;

      setMsg("✅ Invitación enviada. Pídele que revise su correo (y spam).");
      setEmail("");
    } catch (e) {
      setMsg("❌ No se pudo enviar la invitación.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-semibold mb-3">Invitar pareja</h3>

      <div className="flex items-center gap-2">
        <input
          type="email"
          placeholder="email@ejemplo.com"
          className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          onClick={sendInvite}
          disabled={busy}
          className={`shrink-0 px-4 py-2 rounded-xl ${
            busy
              ? "bg-white/10 text-gray-500 cursor-not-allowed"
              : "bg-emerald-500 text-black hover:brightness-110"
          }`}
        >
          Enviar invitación
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2">
        Nota: al aceptar, cerraremos cualquier pareja activa previa de ambos.
      </p>
      {msg && <p className="mt-2 text-sm">{msg}</p>}
    </div>
  );
}
