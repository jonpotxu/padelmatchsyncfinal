import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const POS = [
  { key: "drive", label: "Drive (derecha)" },
  { key: "reves", label: "Revés (izquierda)" },
  { key: "flex", label: "Indiferente" },
];

const STATUS = [
  { key: "none", label: "Sin pareja" },
  { key: "looking", label: "Buscando pareja" },
  { key: "casual", label: "Solo partidos sueltos" },
  { key: "reliable", label: "Pareja fiable" },
];

export default function ProfileCard({ user }) {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [profile, setProfile] = useState({
    id: user?.id,
    name: "",
    city: "",
    level: 5.0,
    position: "flex",
    pair_status: "none",
    seeking_pair: false,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile((p) => ({ ...p, ...data }));
      setLoading(false);
    })();
  }, [user]);

  const save = async () => {
    setMsg("");
    const payload = { ...profile, id: user.id };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
    setMsg(error ? "❌ No se pudo guardar" : "✅ Guardado");
  };

  if (loading) {
    return <div className="rounded-2xl border border-white/10 bg-white/5 p-5">Cargando perfil…</div>;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-semibold mb-3">Tu perfil</h3>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-400">Nombre</label>
          <input
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
            value={profile.name || ""}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="text-sm text-gray-400">Ciudad</label>
          <input
            className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
            value={profile.city || ""}
            onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
            placeholder="Ej. Bilbao"
          />
        </div>

        <div>
          <label className="text-sm text-gray-400">Nivel (1.0–7.0)</label>
          <div className="flex items-center gap-3">
            <input
              type="range" min={1} max={7} step={0.1}
              className="w-full accent-emerald-500"
              value={Number(profile.level ?? 5).toFixed(1)}
              onChange={(e) => setProfile((p) => ({ ...p, level: parseFloat(e.target.value) }))}
            />
            <span className="w-12 text-right">{Number(profile.level ?? 5).toFixed(1)}</span>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-400">Posición preferida</label>
          <div className="flex flex-wrap gap-2">
            {POS.map((x) => (
              <button
                key={x.key}
                type="button"
                onClick={() => setProfile((p) => ({ ...p, position: x.key }))}
                className={`px-3 py-2 rounded-xl border ${
                  profile.position === x.key
                    ? "bg-emerald-500 text-black border-emerald-500"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm text-gray-400">Estado de pareja</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {STATUS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    pair_status: s.key,
                    seeking_pair: s.key === "looking" ? true : p.seeking_pair,
                  }))
                }
                className={`px-3 py-2 rounded-xl border ${
                  profile.pair_status === s.key
                    ? "bg-emerald-500 text-black border-emerald-500"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              className="accent-emerald-500"
              checked={!!profile.seeking_pair}
              onChange={(e) => setProfile((p) => ({ ...p, seeking_pair: e.target.checked }))}
            />
            Mostrarme como “buscando pareja”
          </label>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          className="px-5 py-2 rounded-2xl bg-emerald-500 text-black font-semibold hover:brightness-110"
        >
          Guardar
        </button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </div>
  );
}
