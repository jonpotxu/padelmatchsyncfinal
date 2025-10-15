// /pages/matches/find.js
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { findMatchesForPair } from "../../utils/matching";
import Page from "../../matches/find";
export default Page;

export default function FindMatches() {
  const [mode, setMode] = useState("competitive");
  const [city, setCity] = useState("");
  const [pairs, setPairs] = useState([]);
  const [myPair, setMyPair] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("pairs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) setMsg("❌ " + error.message);
      else {
        setPairs(data || []);
        setMyPair((data || [])[0] || null);
      }
    })();
  }, []);

  const candidates = useMemo(() => {
    if (!myPair) return [];
    let pool = pairs.filter((p) => p.id !== myPair.id);
    if (city) pool = pool.filter((p) => (p.location || "").toLowerCase().includes(city.toLowerCase()));
    return findMatchesForPair(
      {
        id: myPair.id,
        average_score: Number(myPair.average_score || 6),
        competitiveness: myPair.competitiveness || "intermedio",
        availability: myPair.availability || [],
      },
      pool.map((p) => ({
        id: p.id,
        average_score: Number(p.average_score || 6),
        competitiveness: p.competitiveness || "intermedio",
        availability: p.availability || [],
        location: p.location || "",
        player1_id: p.player1_id,
        player2_id: p.player2_id,
      })),
      mode
    );
  }, [pairs, myPair, mode, city]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Buscar partido</h1>
        {msg && <p className="text-red-400 mb-4">{msg}</p>}

        {!myPair && (
          <p className="text-gray-400">
            Crea primero una pareja en <a className="underline" href="/pairs">/pairs</a>.
          </p>
        )}

        {myPair && (
          <>
            <div className="text-sm text-gray-400 mb-4">
              Mi pareja: <b>{myPair.id.slice(0, 8)}</b> — nivel medio{" "}
              <b>{Number(myPair.average_score || 6).toFixed(1)}</b> —{" "}
              {myPair.competitiveness || "intermedio"}
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
                <button
                  onClick={() => setMode("friendly")}
                  className={`px-4 py-2 rounded-lg ${
                    mode === "friendly" ? "bg-emerald-500 text-black" : "text-white"
                  }`}
                >
                  Amistoso
                </button>
                <button
                  onClick={() => setMode("competitive")}
                  className={`px-4 py-2 rounded-lg ${
                    mode === "competitive" ? "bg-emerald-500 text-black" : "text-white"
                  }`}
                >
                  Competitivo
                </button>
              </div>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ciudad / Club"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {candidates.map(({ opponent, score }) => (
                <div key={opponent.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Pareja {opponent.id.slice(0, 8)}</h3>
                    <span className="text-sm text-gray-400">{opponent.location || "—"}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-300">
                    <div>⚖️ Nivel medio: <b>{opponent.average_score.toFixed(1)}</b></div>
                    <div>🎯 Competitividad: <b>{opponent.competitiveness}</b></div>
                    <div>🗓️ Disponibilidad: <b>{(opponent.availability || []).join(", ") || "—"}</b></div>
                    {/* Links a fichas de los jugadores de la pareja */}
                    {(opponent.player1_id || opponent.player2_id) && (
                      <div className="text-xs text-gray-400 mt-2 space-x-2">
                        {opponent.player1_id && (
                          <a className="underline" href={`/players/${opponent.player1_id}`}>
                            Ver jugador 1
                          </a>
                        )}
                        {opponent.player2_id && (
                          <a className="underline" href={`/players/${opponent.player2_id}`}>
                            Ver jugador 2
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <div className="text-sm text-gray-400">Compatibilidad</div>
                    <div className="w-full h-2 bg-white/10 rounded">
                      <div
                        className="h-2 bg-emerald-500 rounded"
                        style={{ width: `${Math.round(score * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{Math.round(score * 100)}%</div>
                  </div>
                  <div className="mt-5 flex gap-3">
                    <a
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-black"
                      href={`/matches/new?pairB=${encodeURIComponent(opponent.id)}`}
                    >
                      Invitar a partido
                    </a>
                    <a
                      className="px-4 py-2 rounded-xl border border-white/15 bg-white/5"
                      href="https://playtomic.io"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Reservar en Playtomic
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {candidates.length === 0 && (
              <p className="text-gray-400 mt-8">No hay parejas compatibles con esos filtros.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
