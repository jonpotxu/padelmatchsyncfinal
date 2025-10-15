// /pages/players/[id].js
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { averageFeedback, top2AndBottom2, specialStrokeFromProfile } from "../../utils/insights";
import { pickNickname } from "../../utils/matching";
import Page from "../../players/[id]";
export default Page;


const LABELS = {
  comms: "Comunicación",
  positioning: "Posicionamiento",
  consistency: "Regularidad",
  sportsmanship: "Deportividad",
  walls: "Paredes",
};

export default function PlayerCard() {
  const router = useRouter();
  const { id } = router.query;

  const [player, setPlayer] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [agg, setAgg] = useState(null);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      // 1) Cargar jugador
      const { data: pData, error: pErr } = await supabase
        .from("players")
        .select("*")
        .eq("id", id)
        .limit(1)
        .single();
      if (pErr || !pData) {
        setMsg("No se pudo cargar el jugador.");
        return;
      }
      setPlayer(pData);

      // 2) Feedback recibido
      const { data: fData } = await supabase
        .from("feedback")
        .select("*")
        .eq("about_player", id)
        .order("created_at", { ascending: false });
      setFeedback(Array.isArray(fData) ? fData : []);

      // 3) (Opcional) Agregado
      const { data: aRows } = await supabase
        .from("player_feedback_agg")
        .select("*")
        .eq("player_id", id)
        .limit(1);
      setAgg(Array.isArray(aRows) && aRows.length ? aRows[0] : null);
    })();
  }, [id]);

  // URL del perfil para compartir
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined" || !id) return "";
    return `${window.location.origin}/players/${id}`;
  }, [id]);

  const copyLink = async () => {
    try {
      if (!shareUrl) return;
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback: crea un input temporal
        const el = document.createElement("input");
        el.value = shareUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setMsg("No se pudo copiar el enlace.");
    }
  };

  if (!player) {
    return (
      <div className="min-h-screen bg-black text-white px-6 py-10">
        <h1 className="text-2xl font-bold mb-2">Ficha de jugador</h1>
        <p className="text-gray-400">{msg || "Cargando…"}</p>
      </div>
    );
  }

  // Cálculos (usa vista agg si existe; si no, cálculo local)
  const local = averageFeedback(feedback);
  const averages = agg
    ? {
        comms: Number(agg.comms_avg ?? 0),
        positioning: Number(agg.positioning_avg ?? 0),
        consistency: Number(agg.consistency_avg ?? 0),
        sportsmanship: Number(agg.sportsmanship_avg ?? 0),
        walls: Number(agg.walls_avg ?? 0),
      }
    : local.avg;
  const fbCount = agg?.fb_count ?? local.count;
  const { top2, bottom2 } = top2AndBottom2(averages);

  const nickname = pickNickname({
    shots: player.shots,
    attitude: player.attitude,
    walls: player.walls,
  });
  const special = specialStrokeFromProfile(player);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">{player.name || "Jugador"}</h1>
            <p className="text-gray-400">
              {player.city || "—"} · Nivel {Number(player.level || 5).toFixed(1)} · {player.position}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black"
              title="Copiar enlace del perfil"
            >
              Copiar enlace
            </button>
            {copied && (
              <span className="text-sm text-emerald-300">¡Copiado!</span>
            )}
          </div>
        </div>

        {msg && <p className="mt-3 text-sm text-red-400">{msg}</p>}

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Identidad */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-2">Identidad</h3>
            <p>🧩 Mote: <b>{nickname}</b></p>
            <p>💥 Golpe especial: <b>{special}</b></p>
            <p>🎯 Objetivo: <b>{player.objective}</b> · Actitud: <b>{player.attitude}</b></p>
            <p>⚙️ Competitividad: <b>{player.competitiveness}</b> · Frecuencia: <b>{player.frequency}</b></p>
            <p className="text-xs text-gray-400 mt-2">
              Golpes declarados: {(player.shots || []).join(", ") || "—"}
            </p>
          </div>

          {/* Fortalezas y mejoras */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-2">Fortalezas y mejoras</h3>
            {fbCount === 0 ? (
              <p className="text-gray-400 text-sm">Aún no hay feedback recibido.</p>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-2">{fbCount} valoraciones</p>
                {top2?.length > 0 && (
                  <div className="mb-2">
                    <div className="text-sm text-gray-400">Top 2</div>
                    <ul className="list-disc list-inside">
                      {top2.map((t) => (
                        <li key={t.key}>
                          <b>{LABELS[t.key] || t.key}</b> · {t.score}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {bottom2?.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-400">A mejorar</div>
                    <ul className="list-disc list-inside">
                      {bottom2.map((t) => (
                        <li key={t.key}>
                          <b>{LABELS[t.key] || t.key}</b> · {t.score}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Historial de feedback */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mt-6">
          <h3 className="text-lg font-semibold mb-2">Historial de valoraciones</h3>
          {feedback.length === 0 ? (
            <p className="text-gray-400 text-sm">Todavía no hay valoraciones.</p>
          ) : (
            <div className="space-y-3">
              {feedback.map((item) => (
                <div key={item.id} className="text-sm text-gray-300 border-b border-white/10 pb-2">
                  <div>
                    ⭐{" "}
                    {Object.keys(LABELS)
                      .map((k) => `${LABELS[k]}: ${item[k] || "-"}`)
                      .join(" · ")}
                  </div>
                  {item.notes && <div className="text-gray-400 mt-1">📝 {item.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
