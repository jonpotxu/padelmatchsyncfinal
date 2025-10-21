// /pages/landing/app.js
import { useEffect, useMemo, useState } from "react";
import SiteLayout from "@/components/SiteLayout";
import { useAuth } from "@/src/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import ProfileCard from "@/components/ProfileCard";
import InvitePartner from "@/components/InvitePartner";
import { daysBetween, humanDays } from "@/utils/date";

export default function MyArea() {
  const { user, loading } = useAuth();
  const [pair, setPair] = useState(null);
  const [stats, setStats] = useState({ matches: 0, feedbacks: 0 });
  const [msg, setMsg] = useState("");

  // Carga pareja activa (vista v_my_active_partner)
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("v_my_active_partner")
        .select("*")
        .maybeSingle();
      if (!error) setPair(data || null);
    })();
  }, [user]);

  // Placeholders de estadísticas
  useEffect(() => {
    if (!user) return;
    (async () => {
      setStats({ matches: 0, feedbacks: 0 });
    })();
  }, [user]);

  const sinceDays = useMemo(() => {
    if (!pair?.since_date) return null;
    return daysBetween(pair.since_date);
  }, [pair]);

  if (loading) {
    return (
      <SiteLayout>
        <p className="text-gray-400">Cargando…</p>
      </SiteLayout>
    );
  }

  if (!user) {
    return (
      <SiteLayout>
        <p className="text-gray-400">No has iniciado sesión.</p>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <h1 className="text-3xl font-bold mb-2">Mi área</h1>
      <p className="text-gray-300 mb-8">
        Hola, <b>{user.email}</b> 👋
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* IZQUIERDA: Perfil + Partidos */}
        <div className="md:col-span-2">
          {/* Tu perfil (editable) */}
          <ProfileCard user={user} />

          {/* PARTIDOS debajo del perfil */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Partidos</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="/landing/matches/find"
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
              >
                Buscar rivales
              </a>
              <a
                href="/landing/matches/new"
                className="px-4 py-2 rounded-xl bg-emerald-500 text-black"
              >
                Crear partido
              </a>
              <a
                href="/landing/matches/mis"
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
              >
                Mis partidos
              </a>
            </div>
          </div>
        </div>

        {/* DERECHA: Estado de pareja + Invitar + Indicadores rápidos */}
        <div className="space-y-4">
          {/* Estado de pareja */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Estado de pareja</h3>

            {!pair ? (
              <p className="text-gray-300">
                No tienes pareja activa. Indica en tu perfil si estás <b>buscando pareja</b> o si prefieres{" "}
                <b>partidos sueltos</b>.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-300">
                  Tienes pareja activa desde <b>{pair.since_date}</b>
                  {sinceDays !== null && <> — {humanDays(sinceDays)}</>}
                </p>

                {/* Datos básicos de tu pareja */}
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="h-9 w-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 font-semibold">
                    {String(pair.partner_name || "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      Pareja: <span className="text-white">{pair.partner_name || "—"}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Nivel: <b>{pair.partner_level != null ? Number(pair.partner_level).toFixed(1) : "—"}</b>
                      {" · "}Posición: <b>{pair.partner_position || "—"}</b>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={async () => {
                  setMsg("");
                  const { error } = await supabase
                    .from("profiles")
                    .update({ pair_status: "looking", seeking_pair: true })
                    .eq("id", user.id);
                  setMsg(error ? "❌ No se pudo actualizar" : "✅ Marcado como buscando pareja");
                }}
                className="rounded-xl bg-emerald-500 text-black px-4 py-2 font-semibold hover:brightness-110"
              >
                Buscar pareja
              </button>

              <button
                onClick={async () => {
                  setMsg("");
                  if (pair?.partner_id) {
                    await supabase
                      .from("partner_links")
                      .update({ active: false })
                      .or(`a_user.eq.${user.id},b_user.eq.${user.id}`);
                    await supabase.from("partner_history").insert({
                      user_id: user.id,
                      event: "end_pair",
                      note: "Cierre manual desde dashboard",
                    });
                    setPair(null);
                    setMsg("✅ Pareja marcada como inactiva");
                  } else {
                    setMsg("No hay pareja activa que cerrar.");
                  }
                }}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 font-semibold hover:bg-white/10"
              >
                Cerrar pareja
              </button>
            </div>

            {msg && <p className="mt-3 text-sm">{msg}</p>}
          </div>

          {/* Invitar pareja */}
          <InvitePartner user={user} />

          {/* Indicadores rápidos (SOLO derecha) */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Indicadores rápidos</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-gray-400">Partidos (últ. 30d)</div>
                <div className="text-2xl font-bold">{stats.matches}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-gray-400">Valoraciones recibidas</div>
                <div className="text-2xl font-bold">{stats.feedbacks}</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Conectaremos estos datos cuando activemos tablas de partidos y feedback en esta versión.
            </p>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
