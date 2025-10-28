// /pages/landing/app.js
import { useEffect, useState } from "react";
import SiteLayout from "@/components/SiteLayout";
import { useAuth } from "@/src/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import FifaCard from "@/components/FifaCard";
import InvitePartner from "@/components/InvitePartner";

function toBadges(profile, agg) {
  const out = [];
  if (profile?.competitiveness) out.push(profile.competitiveness);
  if (profile?.attitude) out.push(profile.attitude);
  if (agg?.fb_count > 0) out.push(`${agg.fb_count} fb`);
  return out;
}

// 4 métricas (ATQ, DEF, COM, COL) derivadas del nivel como placeholder
function makeStats(profile) {
  const lvl = Number(profile?.level ?? 5);
  const base = Math.min(99, Math.max(1, Math.round(lvl * 10)));
  return {
    ATQ: base + 2,
    DEF: base,
    COM: base - 1,
    COL: base + 3,
  };
}

export default function MyArea() {
  const { user, loading } = useAuth();

  const [pairLink, setPairLink] = useState(null); // v_my_active_partner
  const [myProfile, setMyProfile] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [myAgg, setMyAgg] = useState(null);
  const [partnerAgg, setPartnerAgg] = useState(null);
  const [myPair, setMyPair] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);
  const [msg, setMsg] = useState("");

  // 1) pareja activa
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("v_my_active_partner").select("*").maybeSingle();
      setPairLink(data || null);
    })();
  }, [user]);

  // 2) mi perfil + agg
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("id,name,level,position,attitude,competitiveness")
        .eq("id", user.id)
        .maybeSingle();
      setMyProfile(p || null);

      const { data: a } = await supabase
        .from("player_feedback_agg")
        .select("*")
        .eq("player_id", user.id)
        .maybeSingle();
      setMyAgg(a || null);
    })();
  }, [user]);

  // 3) perfil partner
  useEffect(() => {
    if (!user || !pairLink?.partner_id) {
      setPartnerProfile(null);
      setPartnerAgg(null);
      return;
    }
    (async () => {
      const pid = pairLink.partner_id;
      const { data: p } = await supabase
        .from("profiles")
        .select("id,name,level,position,attitude,competitiveness")
        .eq("id", pid)
        .maybeSingle();
      setPartnerProfile(p || null);

      const { data: a } = await supabase
        .from("player_feedback_agg")
        .select("*")
        .eq("player_id", pid)
        .maybeSingle();
      setPartnerAgg(a || null);
    })();
  }, [user, pairLink]);

  // 4) mi par (tabla pairs)
  useEffect(() => {
    if (!user || !pairLink?.partner_id) {
      setMyPair(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("pairs")
        .select("*")
        .or(
          `and(player1_id.eq.${user.id},player2_id.eq.${pairLink.partner_id}),and(player1_id.eq.${pairLink.partner_id},player2_id.eq.${user.id})`
        )
        .limit(1)
        .maybeSingle();
      setMyPair(data || null);
    })();
  }, [user, pairLink]);

  // 5) últimos partidos
  useEffect(() => {
    if (!myPair) {
      setRecentMatches([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("matches")
        .select("*")
        .or(`pair_a_id.eq.${myPair.id},pair_b_id.eq.${myPair.id}`)
        .order("created_at", { ascending: false })
        .limit(3);
      setRecentMatches(data || []);
    })();
  }, [myPair]);

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

  const myBadges = toBadges(myProfile, myAgg);
  const partnerBadges = toBadges(partnerProfile, partnerAgg);

  return (
    <SiteLayout>
      <h1 className="text-3xl font-bold mb-2">Mi área</h1>
      <p className="text-gray-300 mb-8">
        Hola, <b>{myProfile?.name || user.email}</b> 👋
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* IZQUIERDA: 2 cols (tarjetas + acciones de partido) */}
        <div className="md:col-span-2 space-y-6">
          {/* Tarjetas mismas dimensiones */}
          <div className="grid md:grid-cols-2 gap-6">
            <FifaCard
              className="min-h-[260px] md:min-h-[300px]"
              name={myProfile?.name || "Jugador"}
              level={myProfile?.level ?? 6}
              position={myProfile?.position || "flex"}
              initials={(myProfile?.name || user.email || "J").slice(0, 1).toUpperCase()}
              badges={myBadges}
              stats={makeStats(myProfile)}
              footer={
                <a
                  href="/landing/profile/edit"
                  className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
                >
                  Editar perfil
                </a>
              }
            />

            <FifaCard
              className="min-h-[260px] md:min-h-[300px]"
              name={partnerProfile?.name || (pairLink ? "Tu pareja" : "Sin pareja")}
              level={partnerProfile?.level ?? (pairLink ? 6 : 0)}
              position={partnerProfile?.position || "flex"}
              initials={(partnerProfile?.name || "T").slice(0, 1).toUpperCase()}
              badges={partnerBadges}
              stats={makeStats(partnerProfile)}
              footer={
                pairLink ? (
                  <button
                    onClick={async () => {
                      setMsg("");
                      await supabase
                        .from("partner_links")
                        .update({ active: false })
                        .or(`a_user.eq.${user.id},b_user.eq.${user.id}`);
                      setMsg("✅ Pareja marcada como inactiva");
                      setPartnerProfile(null);
                      setMyPair(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
                  >
                    Romper pareja
                  </button>
                ) : (
                  <span className="text-sm text-gray-400">No tienes pareja activa.</span>
                )
              }
            />
          </div>

          {/* Acciones de partidos (debajo de las tarjetas) */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Partidos</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="/landing/matches/find"
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
              >
                Buscar rivales
              </a>
              <a href="/landing/matches/new" className="px-4 py-2 rounded-xl bg-emerald-500 text-black">
                Crear partido
              </a>
              <a
                href="/landing/matches/mis"
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
              >
                Mis partidos
              </a>
            </div>
            {msg && <p className="mt-3 text-sm">{msg}</p>}
          </div>
        </div>

        {/* DERECHA: indicadores + últimos partidos + invitar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Indicadores rápidos</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-gray-400">Partidos (últ. 30d)</div>
                <div className="text-2xl font-bold">{recentMatches.length}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-gray-400">Valoraciones recibidas</div>
                <div className="text-2xl font-bold">{myAgg?.fb_count ?? 0}</div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Mis últimos partidos</h3>
            <div className="space-y-3">
              {recentMatches.map((m) => (
                <div key={m.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="text-sm font-semibold">{m.title || "Partido"}</div>
                  <div className="text-xs text-gray-400">
                    {m.mode || "—"} · {m.location || "—"} ·{" "}
                    {m.date ? new Date(m.date).toLocaleString() : "sin fecha"}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <a
                      href={`/landing/feedback/${m.id}`}
                      className="text-xs px-3 py-1 rounded-lg bg-emerald-500 text-black"
                    >
                      Dar feedback
                    </a>
                    <a
                      className="text-xs px-3 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10"
                      href={
                        m.location
                          ? `https://playtomic.io/search?where=${encodeURIComponent(m.location)}`
                          : "https://playtomic.io"
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      Reservar en Playtomic
                    </a>
                  </div>
                </div>
              ))}
              {recentMatches.length === 0 && (
                <div className="text-sm text-gray-400">Aún no hay partidos.</div>
              )}
            </div>
          </div>

          <InvitePartner user={user} />
        </div>
      </div>
    </SiteLayout>
  );
}
