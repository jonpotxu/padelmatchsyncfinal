// /utils/insights.js

// Calcula medias de feedback (array de filas de la tabla feedback)
export function averageFeedback(feedbackArray = []) {
  const keys = ["comms","positioning","consistency","sportsmanship","walls"];
  const acc = { count: 0 };
  keys.forEach(k => acc[k] = 0);

  feedbackArray.forEach(f => {
    keys.forEach(k => acc[k] += Number(f[k] || 0));
    acc.count += 1;
  });

  if (!acc.count) return { avg: {}, count: 0 };

  const avg = {};
  keys.forEach(k => { avg[k] = +(acc[k] / acc.count).toFixed(2); });
  return { avg, count: acc.count };
}

// Devuelve top 2 y bottom 2 de medias
export function top2AndBottom2(avg = {}) {
  const entries = Object.entries(avg); // [["comms",4.2],...]
  if (!entries.length) return { top2: [], bottom2: [] };
  const sorted = entries.sort((a,b)=> b[1]-a[1]);
  const top2 = sorted.slice(0,2).map(([k,v])=>({ key:k, score:v }));
  const bottom2 = sorted.slice(-2).map(([k,v])=>({ key:k, score:v }));
  return { top2, bottom2 };
}

// Heurística simple para “golpe especial” basado en el perfil
export function specialStrokeFromProfile(player) {
  const shots = new Set(player?.shots || []);
  if (shots.has("bandeja")) return "Bandeja profunda";
  if (shots.has("víbora")) return "Víbora";
  if (shots.has("salida-pared")) return "Salida de pared";
  if (shots.has("smash")) return "Smash";
  if (shots.has("chiquita")) return "Chiquita";
  if (shots.has("globo")) return "Globo táctico";
  if ((player?.walls||"") === "alto") return "Paredes (élite)";
  return "Consistencia";
}
