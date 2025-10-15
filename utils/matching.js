// /utils/matching.js

// -------- Nivel estimado desde formulario (heurística MVP) --------
export function playerScoreFromForm(data) {
  let base = 5;
  if (data.shots?.includes("bandeja")) base += 0.6;
  if (data.shots?.includes("víbora")) base += 0.6;
  if (data.shots?.includes("salida-pared")) base += 0.5;
  if (data.walls === "alto") base += 0.8;
  if (data.objective === "competir") base += 0.4;
  return Math.max(1, Math.min(10, base));
}

// -------- Construir pareja desde dos jugadores --------
export function pairFromPlayers(p1, p2) {
  const avg = (Number(p1.level||5) + Number(p2.level||5)) / 2;
  const competitiveness = p1.competitiveness === p2.competitiveness
    ? (p1.competitiveness || "intermedio")
    : "intermedio";
  const availability = Array.from(new Set([...(p1.availability||[]), ...(p2.availability||[])]));
  return {
    id: `pair_${p1.id}_${p2.id}`,
    player1_id: p1.id,
    player2_id: p2.id,
    average_score: avg,
    competitiveness,
    availability,
    location: p1.city || p2.city || "",
    temporary: false,
  };
}

// -------- Compatibilidad entre dos parejas (0..1) --------
export function compatibilityScore(pairA, pairB) {
  const levelDiff = Math.abs(Number(pairA.average_score||0) - Number(pairB.average_score||0));
  const levelScore = 1 - Math.min(levelDiff / 3, 1); // tolera ~3 puntos de diferencia (3 => 0)

  const compScore = (pairA.competitiveness || "intermedio") === (pairB.competitiveness || "intermedio")
    ? 1
    : 0.6;

  const a = new Set(pairA.availability || []);
  const overlap = (pairB.availability || []).filter(x => a.has(x)).length;
  const availScore = Math.min(overlap / 3, 1); // 0..1 (3 solapes o más = 1)

  // Pesos: 50% nivel, 30% competitividad, 20% disponibilidad
  return 0.5 * levelScore + 0.3 * compScore + 0.2 * availScore;
}

// -------- Score de competitividad para guardar en matches --------
export function computeMatchCompetitiveness(pairARecord, pairBRecord) {
  // Entradas tal cual vienen de Supabase (tabla pairs)
  const a = {
    id: pairARecord.id,
    average_score: Number(pairARecord.average_score || 0),
    competitiveness: pairARecord.competitiveness || "intermedio",
    availability: pairARecord.availability || [],
  };
  const b = {
    id: pairBRecord.id,
    average_score: Number(pairBRecord.average_score || 0),
    competitiveness: pairBRecord.competitiveness || "intermedio",
    availability: pairBRecord.availability || [],
  };

  const score = compatibilityScore(a, b); // 0..1
  return Math.max(0, Math.min(1, +score.toFixed(2))); // redondeo a 2 decimales
}

// -------- Buscar rivales ordenados por compatibilidad --------
export function findMatchesForPair(pair, allPairs, mode = "competitive") {
  return allPairs
    .filter(p => p.id !== pair.id)
    .map(op => {
      let score = compatibilityScore(pair, op);
      if (mode === "friendly") score = score * 0.8 + 0.2; // más permisivo
      return { opponent: op, score };
    })
    .sort((a, b) => b.score - a.score);
}

// -------- Motes/identidad según estilo --------
export function pickNickname({ shots = [], attitude = "equilibrado", walls = "medio" }) {
  const s = new Set(shots);
  if (s.has("bandeja") && walls === "alto") return "El Francotirador";
  if (s.has("salida-pared") && walls === "alto") return "La Muralla";
  if (s.has("víbora")) return "La Vibra";
  if (attitude === "intenso") return "La Pantera";
  if (attitude === "tranquilo") return "El Arquitecto";
  return "Jugador Constante";
}
