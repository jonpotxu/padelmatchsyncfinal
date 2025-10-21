// /pages/landing/matches/new.js
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { computeMatchCompetitiveness } from "../../../utils/matching";
import { useAuth } from "@/src/AuthContext";

export default function NewMatch() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { pairB: pairBQuery } = router.query;

  const [pairs, setPairs] = useState([]);
  const [pairA, setPairA] = useState(null);
  const [pairB, setPairB] = useState(null);
  const [mode, setMode] = useState("competitive"); // friendly | competitive
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:MM
  const [msg, setMsg] = useState("");
  const [createdMatchId, setCreatedMatchId] = useState(null);
  const [activePartner, setActivePartner] = useState(null); // v_my_active_partner

  // Cargar todas las pairs + tu pareja activa
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: pairsData, error: e1 }, { data: vData, error: e2 }] = await Promise.all([
        supabase.from("pairs").select("*").order("created_at", { ascending: false }),
        supabase.from("v_my_active_partner").select("*").maybeSingle(),
      ]);

      if (!e1) setPairs(pairsData || []);
      if (!e2) setActivePartner(vData || null);
    })();
  }, [user]);

  // Preseleccionar tu pairA en base a v_my_active_partner
  useEffect(() => {
    if (!user || pairs.length === 0) return;

    const mineAny = pairs.find((p) => p.player1_id === user.id || p.player2_id === user.id) || null;

    if (activePartner?.partner_id) {
      const together =
        pairs.find(
          (p) =>
            (p.player1_id === user.id && p.player2_id === activePartner.partner_id) ||
            (p.player2_id === user.id && p.player1_id === activePartner.partner_id)
        ) || null;

      setPairA(together || mineAny);
    } else {
      setPairA(mineAny);
    }
  }, [user, pairs, activePartner]);

  // Si venía una pairB en la URL, precargar
  useEffect(() => {
    if (!pairBQuery || pairs.length === 0) return;
    const found = pairs.find((p) => p.id === pairBQuery);
    if (found) setPairB(found);
  }, [pairBQuery, pairs]);

  const liveScore = useMemo(() => {
    if (!pairA || !pairB) return null;
    return computeMatchCompetitiveness(pairA, pairB);
  }, [pairA, pairB]);

  const saveMatch = async () => {
    try {
      setMsg("");
      setCreatedMatchId(null);
      if (!pairA || !pairB || pairA.id === pairB.id) {
        setMsg("Elige dos parejas distintas (y asegúrate de que tu pareja está detectada).");
        return;
      }
      let iso = null;
      if (date && time) {
        const dt = new Date(`${date}T${time}:00`);
        if (!isNaN(dt.getTime())) iso = dt.toISOString();
      }
      const score = computeMatchCompetitiveness(pairA, pairB);

      const { data, error } = await supabase
        .from("matches")
        .insert([
          {
            pair_a_id: pairA.id,
            pair_b_id: pairB.id,
            location: location || null,
            date: iso,
            mode,
            competitiveness_score: score,
            status: "pendiente",
            notes: null,
          },
        ])
        .select();

      if (error) throw error;
      const mId = data?.[0]?.id;
      setCreatedMatchId(mId || null);
      setMsg(`✅ Partido creado: ${mId || ""}`);
    } catch (e) {
      setMsg("❌ " + (e?.message || "Error al guardar partido"));
    }
  };

  const PairSelect = ({ label, value, onChange, disabledIds = [] }) => (
    <div className="flex flex-col">
      <label className="text-sm text-gray-400 mb-1">{label}</label>
      <select
        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        value={value?.id || ""}
        onChange={(e) => onChange(pairs.find((p) => p.id === e.target.value))}
      >
        <option value="">— selecciona —</option>
        {pairs
          .filter((p) => !disabledIds.includes(p.id))
          .map((p) => (
            <option key={p.id} value={p.id}>
              {p.id.slice(0, 8)} · lvl {Number(p.average_score || 6).toFixed(1)} · {p.competitiveness || "intermedio"}
            </option>
          ))}
      </select>
      {value?.player1_id || value?.player2_id ? (
        <div className="text-xs text-gray-500 mt-1 space-x-2">
          {value.player1_id && (
            <a className="underline" href={`/players/${value.player1_id}`}>
              Ver jugador 1
            </a>
          )}
          {value.player2_id && (
            <a className="underline" href={`/players/${value.player2_id}`}>
              Ver jugador 2
            </a>
          )}
        </div>
      ) : null}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen text-white px-6 py-10">Cargando…</div>
    );
  }
  if (!user) {
    return (
      <div className="min-h-screen text-white px-6 py-10">Necesitas iniciar sesión.</div>
    );
  }

  const myId = user?.id;
  const disabledForB = pairA ? [pairA.id] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Nuevo partido</h1>
        <p className="text-gray-400 mb-6">
          Elige las parejas, modo y (opcional) fecha/club. Guardaremos el equilibrio del partido.
        </p>

        {/* Aviso si no se detecta tu pareja */}
        {!pairA && (
          <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm">
            No se ha detectado tu pareja. Crea/activa una en tu área o en la tabla <b>pairs</b>.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <PairSelect label="Pareja A (tú)" value={pairA} onChange={setPairA} />
          <PairSelect label="Pareja B (rival)" value={pairB} onChange={setPairB} disabledIds={disabledForB} />

          <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">Modo</label>
            <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => setMode("friendly")}
                className={`px-4 py-2 rounded-lg ${mode === "friendly" ? "bg-emerald-500 text-black" : "text-white"}`}
              >
                Amistoso
              </button>
              <button
                onClick={() => setMode("competitive")}
                className={`px-4 py-2 rounded-lg ${mode === "competitive" ? "bg-emerald-500 text-black" : "text-white"}`}
              >
                Competitivo
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">Ciudad / Club</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ciudad o club"
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-400 mb-1">Hora</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            />
          </div>
        </div>

        {/* Compatibilidad en vivo */}
        {liveScore !== null && (
          <div className="mt-6">
            <div className="text-sm text-gray-400 mb-1">
              Compatibilidad prevista: <b>{Math.round(liveScore * 100)}%</b>
            </div>
            <div className="w-full h-2 bg-white/10 rounded">
              <div className="h-2 bg-emerald-500 rounded" style={{ width: `${Math.round(liveScore * 100)}%` }} />
            </div>
          </div>
        )}

        <button onClick={saveMatch} className="mt-8 px-5 py-3 rounded-xl bg-emerald-500 text-black">
          Guardar partido
        </button>

        {msg && <p className="mt-4 text-sm">{msg}</p>}

        {createdMatchId && (
          <div className="mt-5 p-4 rounded-2xl bg-white/5 border border-emerald-500/40">
            <div className="text-sm">
              Partido guardado. Puedes ir a <a className="underline" href="/landing/matches/mis">Mis partidos</a> o
              enviar feedback tras el partido.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
