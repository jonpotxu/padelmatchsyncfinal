// /pages/feedback/[matchId].js
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Page from "../../feedback/[matchId]";
export default Page;


const FIELDS = [
  { key: "comms", label: "Comunicación" },
  { key: "positioning", label: "Posicionamiento" },
  { key: "consistency", label: "Regularidad" },
  { key: "sportsmanship", label: "Deportividad" },
  { key: "walls", label: "Manejo de paredes" },
];

export default function FeedbackMatch() {
  const router = useRouter();
  const { matchId } = router.query;

  const [players, setPlayers] = useState([]);
  const [about, setAbout] = useState("");
  const [fromPlayer, setFromPlayer] = useState("");
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!matchId) return;
    (async () => {
      // MVP: carga de todos los jugadores (si ya hiciste el filtro de 4, sustituye por tu useEffect filtrado)
      const { data, error } = await supabase
        .from("players")
        .select("id,name,level")
        .order("created_at", { ascending: false });
      if (!error) setPlayers(data || []);
    })();
  }, [matchId]);

  const hasAnyScore = useMemo(() => {
    return Object.values(scores).some(Boolean);
  }, [scores]);

  const canSubmit = !!about && hasAnyScore;

  const saveFeedback = async () => {
    setMsg("");
    if (!canSubmit) {
      setMsg("Selecciona a quién valoras y marca al menos una calificación.");
      return;
    }
    const payload = {
      match_id: matchId,
      about_player: about,
      from_player: fromPlayer || null,
      notes: notes || null,
      ...scores,
    };
    const { error } = await supabase.from("feedback").insert([payload]);
    if (error) setMsg("❌ " + error.message);
    else {
      setMsg("✅ Feedback enviado. ¡Gracias!");
      // Limpieza opcional
      // setAbout(""); setFromPlayer(""); setScores({}); setNotes("");
    }
  };

  const StarRow = ({ field }) => (
    <div className="flex items-center gap-3">
      <span className="w-40 text-sm text-gray-400">{field.label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={`px-3 py-1 rounded ${
              scores[field.key] === n ? "bg-emerald-500 text-black" : "bg-white/10"
            }`}
            onClick={() => setScores((s) => ({ ...s, [field.key]: n }))}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-2xl font-bold mb-4">Feedback del partido</h1>
      {!matchId && <p className="text-gray-400">Cargando…</p>}

      <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
        <div>
          <label className="text-sm text-gray-400 mb-1">¿A quién valoras?</label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
          >
            <option value="">— selecciona —</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || p.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-400 mb-1">(Opcional) ¿Quién eres?</label>
          <select
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            value={fromPlayer}
            onChange={(e) => setFromPlayer(e.target.value)}
          >
            <option value="">— anónimo MVP —</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || p.id.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {FIELDS.map((f) => (
          <StarRow key={f.key} field={f} />
        ))}
      </div>

      <div className="mt-6">
        <label className="text-sm text-gray-400 mb-1">Notas (opcional)</label>
        <textarea
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="P. ej. Muy buena salida de pared."
        />
      </div>

      <button
        onClick={saveFeedback}
        disabled={!canSubmit}
        className={`mt-6 px-5 py-3 rounded-xl ${
          canSubmit ? "bg-emerald-500 text-black" : "bg-white/10 text-gray-500 cursor-not-allowed"
        }`}
        title={!canSubmit ? "Selecciona jugador y marca al menos una calificación" : "Enviar feedback"}
      >
        Enviar feedback
      </button>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
