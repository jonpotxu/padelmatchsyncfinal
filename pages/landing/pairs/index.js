import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { pairFromPlayers } from "../../utils/matching";
import Page from "../../pairs";
export default Page;

export default function Pairs() {
  const [players, setPlayers] = useState([]);
  const [me, setMe] = useState(null);    // por ahora elige uno manualmente
  const [mate, setMate] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("players").select("*").order("created_at", { ascending: false });
      if (!error) setPlayers(data || []);
    })();
  }, []);

  const createPair = async () => {
    if (!me || !mate || me.id === mate.id) { setMsg("Elige dos jugadores distintos."); return; }
    const p1 = {
      id: me.id, level: Number(me.level||5),
      competitiveness: me.competitiveness, availability: me.availability, city: me.city
    };
    const p2 = {
      id: mate.id, level: Number(mate.level||5),
      competitiveness: mate.competitiveness, availability: mate.availability, city: mate.city
    };
    const pair = pairFromPlayers(p1, p2);

    const { data, error } = await supabase.from("pairs").insert([{
      player1_id: pair.player1_id,
      player2_id: pair.player2_id,
      average_score: pair.average_score,
      competitiveness: pair.competitiveness,
      availability: pair.availability,
      location: pair.location,
      temporary: true
    }]).select();

    if (error) setMsg("❌ " + error.message);
    else setMsg("✅ Pareja creada: " + (data?.[0]?.id || ""));
  };

  const Selector = ({ label, value, onChange }) => (
    <div className="flex flex-col">
      <label className="text-sm text-gray-400 mb-1">{label}</label>
      <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-2"
        value={value?.id || ""} onChange={(e)=>onChange(players.find(p=>p.id===e.target.value))}>
        <option value="">— selecciona —</option>
        {players.map(p=>(
          <option key={p.id} value={p.id}>{p.name || p.id} — lvl {Number(p.level||5).toFixed(1)}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <h1 className="text-2xl font-bold mb-4">Crear pareja temporal</h1>
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl">
        <Selector label="Jugador A (tú)" value={me} onChange={setMe} />
        <Selector label="Jugador B (compañero)" value={mate} onChange={setMate} />
      </div>
      <button onClick={createPair} className="mt-6 px-5 py-3 rounded-xl bg-emerald-500 text-black">Crear pareja</button>
      {msg && <p className="mt-4 text-sm">{msg}</p>}
    </div>
  );
}
