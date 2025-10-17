// /pages/landing/partner/accept.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SiteLayout from "@/components/SiteLayout";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/src/AuthContext";

export default function AcceptPartner() {
  const router = useRouter();
  const { token } = router.query;
  const { user, loading } = useAuth();
  const [state, setState] = useState({ status: "idle", msg: "" });

  useEffect(() => {
    if (loading) return;
    if (!token) return;
    if (!user) {
      setState({ status: "need-login", msg: "Debes iniciar sesión para aceptar la invitación." });
      return;
    }

    (async () => {
      try {
        setState({ status: "working", msg: "Aceptando invitación…" });
        const { data, error } = await supabase
          .rpc("accept_partner_invite", { p_token: String(token) });
        if (error) throw error;
        setState({ status: "ok", msg: "✅ Pareja creada correctamente." });
        // Redirige a Mi área tras unos segundos
        setTimeout(() => router.replace("/landing/app"), 1200);
      } catch (err) {
        setState({ status: "error", msg: "❌ Invitación no válida o expirada." });
      }
    })();
  }, [token, user, loading, router]);

  return (
    <SiteLayout>
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-3">Aceptar invitación</h1>
        {state.status === "need-login" && (
          <p className="text-gray-300">
            {state.msg}{" "}
            <a href="/landing/login" className="underline text-emerald-300">Iniciar sesión</a>
          </p>
        )}
        {state.status !== "need-login" && (
          <p className="text-gray-300">{state.msg || "Procesando…"}</p>
        )}
      </div>
    </SiteLayout>
  );
}
