// /pages/landing/app.js
import { useEffect, useState, useMemo } from "react";
import SiteLayout from "@/components/SiteLayout";
import { useAuth } from "@/src/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import FifaCard from "@/components/FifaCard";
import AvatarMaker from "@/components/AvatarMaker";
import InvitePartner from "@/components/InvitePartner";

function toBadges(profile, agg) {
  const out = [];
  if (profile?.attitude) out.push(profile.attitude);
  if (profile?.competitiveness) out.push(profile.competitiveness);
  if (agg?.fb_count > 0) out.push(`${agg.fb_count} fb`);
  return out;
}

export default function MyArea() {
  const { user, loading } = useAuth();

  const [pairLink, setPairLink] = useState(null);        // v_my_active_partner
  const [myProfile, setMyProfile] = useState(null);
  const [partnerProfile, setPartnerProfile] = useState(null);
  const [myAgg, setMyAgg] = useState(null);
  const [partnerAgg, setPartnerAgg] = useState(null);
  const [myPair, setMyPair] = useState(null);            // pareja en public.pairs
  const [recentMatches, setRecentMatches] = useState([]);
  const [msg, setMsg] = useState("");

  // 1) Carga partner link (vista)
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("v_my_active_partner")
        .select("*")
        .maybeSingle();
      setPairLink(data || null);
    })();
  }, [user]);

  // 2) Carga mi perfil + agg
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("id,name,level,position,shots,attitude,competitiveness,city,avatar_url,avatar_style")
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

  // 3) Carga perfil + agg del partner (si RLS lo permite)
  useEffect(() => {
    if (!user || !pairLink?.partner_id) { setPartnerProfile(null); setPartnerAgg(null); return; }
    (async () => {
      const pid = pairLink.partner_id;
      const { data: p } = await supabase
        .from("profiles")
        .select("id,name,level,position,shots,attitude,competitiveness,city,avatar_url,avatar_style")
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

  // 4) Encuentra mi pareja en public.pairs (para crear partidos)
  useEffect(() => {
    if (!user || !pairLink?.partner_id) { setMyPair(null); return; }
    (async () => {
      const { data, error } = await supabase
        .from("pairs")
        .select("*")
        .or(
          `and(player1_id.eq.${user.id},player2_id.eq.${pairLink.partner_id}),` +
          `and(player1_id.eq.${pairLink.partner_id},player2_id.eq.${user.id})`
        )
        .limit(1)
        .maybeSingle();
      if (!error) setMyPair(data || null);
    })();
  }, [user, pairLink]);

  // 5) Mis 3 partidos recientes
  useEffect(() => {
    if (!myPair) { setRecentMatches([]); return; }
    (async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .or(`pair_a_id.eq.${myPair.id},pair_b_id.eq.${myPair.id}`)
        .order("created_at", { ascending: false })
        .limit(3);
      if (!error) setRecentMatches(data || []);
    })();
  }, [myPair]);

  const myBadges = useMemo(() => toBadges(myProfile, myAgg), [myProfile, myAgg]);
  const partnerBadges = useMemo(() => toBadges(partnerProfile, partnerAgg), [partnerProfile, partnerAgg]);

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
      <p className="text-gray-300 mb-8">Hola, <b>{user.email}</b> 👋</p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ===== IZQUIERDA (2 cols): tarjetas + acciones ===== */}
        <div className="md:col-span-2 space-y-6">
          {/* Tarjetas estilo FIFA: tú + pareja */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <FifaCard
                name={myProfile?.name || (user.email || "").split("@")[0]}
                rating={Math.round(Number(myProfile?.level ?? 5.8) * 10)}
                level={Number(myProfile?.level ?? 5.8).toFixed(1)}
                position={myProfile?.position || "indiferente"}
                city={myProfile?.city}
                shots={myProfile?.shots || []}
                avatarUrl={myProfile?.avatar_url}
                badges={myBadges}
                stats={{ pac: 75, sho: 76, pas: 78, dri: 77, def: 74, phy: 79 }}
                accent="emerald"
              />
              <div className="flex gap-2">
                <a
                  href="/landing/profile/edit"
                  className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
                >
                  Editar perfil
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <FifaCard
                name={
                  partnerProfile?.name ||
                  (pairLink ? "Tu pareja" : "Sin pareja")
                }
                rating={
                  partnerProfile?.level != null
                    ? Math.round(Number(partnerProfile.level) * 10)
                    : pairLink ? 60 : 0
                }
                level={
                  partnerProfile?.level != null
                    ? Number(partnerProfile.level).toFixed(1)
                    : pairLink ? "—" : "0.0"
                }
                position={partnerProfile?.position || (pairLink ? "—" : "—")}
                city={partnerProfile?.city || "—"}
                shots={partnerProfile?.shots || []}
                avatarUrl={partnerProfile?.avatar_url}
                badges={partnerBadges}
                stats={{ pac: 72, sho: 70, pas: 73, dri: 71, def: 69, phy: 74 }}
                accent="cyan"
                compact
              />
              <div className="flex gap-2">
                {pairLink ? (
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
                      setPairLink(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
                  >
                    Romper pareja
                  </button>
                ) : (
                  <span className="text-sm text-gray-400">
                    No tienes pareja activa.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Editor de avatar (para ti) */}
          <AvatarMaker
            userId={user.id}
            initialStyle={myProfile?.avatar_style}
            initialUrl={myProfile?.avatar_url}
            onSaved={(v) => setMyProfile((prev) => ({ ...(prev || {}), ...v }))}
          />

          {/* Acciones de partidos bajo las tarjetas */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
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
            {msg && <p className="mt-3 text-sm">{msg}</p>}
          </div>
        </div>

        {/* ===== DERECHA (1 col): indicadores + últimos 3 + invitar ===== */}
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
