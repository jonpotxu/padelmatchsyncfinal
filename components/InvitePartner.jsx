// /components/InvitePartner.jsx
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function InvitePartner({ user }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const createInvite = async (e) => {
    e.preventDefault();
    setMsg("");
    setInviteLink("");
    if (!email) return;

    try {
      setSending(true);
      // token simple (uuid v4, si no tienes: usa gen_random_uuid en SQL; aquí lo generamos en JS)
      const token = crypto.randomUUID();

      // crea invitación
      const { error } = await supabase.from("partner_invitations").insert([
        {
          from_user: user.id,
          to_email: email.trim().toLowerCase(),
          token,
        },
      ]);
      if (error) throw error;

      // genera link público (ajusta tu dominio si hace falta)
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const link = `${origin}/landing/partner/accept?token=${encodeURIComponent(
        token
      )}`;
      setInviteLink(link);
      setMsg("✅ Invitación creada. Comparte el enlace con tu posible pareja.");
    } catch (err) {
      setMsg("❌ No se pudo crear la invitación");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-semibold mb-2">Invitar pareja</h3>
      <form onSubmit={createInvite} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          placeholder="email@ejemplo.com"
          className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-xl bg-emerald-500 text-black px-4 py-2 font-semibold hover:brightness-110 disabled:opacity-60"
        >
          {sending ? "Creando…" : "Enviar invitación"}
        </button>
      </form>

      {inviteLink && (
        <div className="mt-3 text-sm">
          <div className="text-gray-300 mb-1">Enlace para compartir:</div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3 break-all">
            {inviteLink}
          </div>
        </div>
      )}
      {msg && <p className="mt-3 text-sm">{msg}</p>}
      <p className="text-xs text-gray-500 mt-2">
        Nota: al aceptar, cerraremos cualquier pareja activa previa de ambos.
      </p>
    </div>
  );
}
