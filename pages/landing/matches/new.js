// /pages/landing/matches/new.js
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";             // <— ojo: 3 niveles
import { computeMatchCompetitiveness } from "../../../utils/matching";

// ❌ quita esto:
// import Page from "../../matches/new";
// export default Page;

export default function NewMatch() {
  const router = useRouter();
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

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("pairs")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) setPairs(data || []);
      else setMsg("❌ " + error.message);
    })();
  }, []);

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
        setMsg("Elige dos parejas distintas.");
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

  const PairSelect = ({ label, value, onChange }) => (
    <div className="flex flex-col">
      <label className="text-sm text-gray-400 mb-1">{label}</label>
      <select
        className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        value={value?.id || ""}
        onChange={(e) => onChange(pairs.find((p) => p.id === e.target.value))}
      >
        <option value="">— selecciona —</option>
        {pairs.map((p) => (
          <option key={p.id} value={p.id}>
            {p.id.slice(0, 8)} · lvl {Number(p.average_score || 6).toFixed(1)} ·{" "}
            {p.competitiveness || "intermedio"}
          </option>
        ))}
      </select>
      {value?.player1_id || value?.player2_id ? (
        <div className="text-xs text-gray-500 mt-1 space-x-2">
          {value.player1_id && (
            <a className="underline" href={`/players/${value.player1_id}`}>Ver jugador 1</a>
          )}
          {value.player2_id && (
            <a className="underline" href={`/players/${value.player2_id}`}>Ver jugador 2</a>
          )}
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Nuevo partido</h1>
        <p className="text-gray-400 mb-6">
          Elige las parejas, modo y (opcional) fecha/club. Guardaremos el equilibrio del partido.
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <PairSelect label="Pareja A (tú)" value={pairA} onChange={setPairA} />
          <PairSelect label="Pareja B (rival)" value={pairB} onChange={setPairB} />

          {/* ... resto del JSX igual que ya tenías ... */}
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
            {/* ... botones de navegación ... */}
          </div>
        )}
      </div>
    </div>
  );
}
