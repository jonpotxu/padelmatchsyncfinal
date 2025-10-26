// /pages/landing/profile/edit.js
import { useEffect, useState } from "react";
import SiteLayout from "@/components/SiteLayout";
import { useAuth } from "@/src/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import AvatarUploader from "@/components/AvatarUploader";

const POS = [
  { key: "drive", label: "Drive (derecha)" },
  { key: "reves", label: "Revés (izquierda)" },
  { key: "flex", label: "Indiferente" },
];

const ATTITUDE = ["Diversión", "Mixto", "Competitivo"];
const COMP = ["Baja", "Media", "Alta"];
const FREQ = ["1/semana", "2/semana", "3+/semana"];
const PAREDES = ["Básico", "Intermedio", "Avanzado"];
const DEFENSA = [
  { k: "basica", label: "Básica" },
  { k: "intermedia", label: "Intermedia" },
  { k: "avanzada", label: "Avanzada" },
];
const GOLPES = ["bandeja", "víbora", "smash", "chiquita", "globo", "salida-pared", "dejada", "contra-pared"];

export default function EditProfile() {
  const { user, loading } = useAuth();
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [p, setP] = useState({
    name: "",
    city: "",
    level: 6,
    position: "flex",
    attitude: null,
    competitiveness: null,
    frequency: null,
    paredes: "Básico",
    defense: null, // <- NUEVO
    shots: [],     // array<string>
    public_profile: false,
    avatar_url: null,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id,name,city,level,position,attitude,competitiveness,frequency,paredes,defense,shots,public_profile,avatar_url"
        )
        .eq("id", user.id)
        .maybeSingle();
      if (!error && data) {
        setP((prev) => ({ ...prev, ...data, shots: data.shots || [] }));
      }
    })();
  }, [user]);

  const toggleShot = (s) =>
    setP((prev) => {
      const set = new Set(prev.shots || []);
      set.has(s) ? set.delete(s) : set.add(s);
      return { ...prev, shots: Array.from(set) };
    });

  const save = async () => {
    if (!user) return;
    setMsg("");
    setSaving(true);
    try {
      const payload = {
        name: p.name || null,
        city: p.city || null,
        level: p.level ?? 6,
        position: p.position || "flex",
        attitude: p.attitude || null,
        competitiveness: p.competitiveness || null,
        frequency: p.frequency || null,
        paredes: p.paredes || null,
        defense: p.defense || null, // <- guardar NUEVO
        shots: p.shots || [],
        public_profile: !!p.public_profile,
        avatar_url: p.avatar_url || null,
      };
      const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
      if (error) throw error;
      setMsg("✅ Perfil guardado");
    } catch (e) {
      setMsg("❌ No se pudo guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

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
      <h1 className="text-3xl font-bold mb-2">Editar perfil</h1>
      <p className="text-gray-400 mb-6">Ajusta tu información y preferencias de juego.</p>

      {/* Básicos */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6">
        <h3 className="text-lg font-semibold mb-3">Básicos</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-400">Nombre</label>
            <input
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
              value={p.name || ""}
              onChange={(e) => setP((x) => ({ ...x, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400">Ciudad</label>
            <input
              className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2"
              value={p.city || ""}
              onChange={(e) => setP((x) => ({ ...x, city: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm text-gray-400">Nivel (1.0–7.0)</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={7}
                step={0.1}
                className="w-full accent-emerald-500"
                value={Number(p.level ?? 6)}
                onChange={(e) => setP((x) => ({ ...x, level: parseFloat(e.target.value) }))}
              />
              <span className="w-12 text-right">{Number(p.level ?? 6).toFixed(1)}</span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400">Posición preferida</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {POS.map((x) => (
                <button
                  key={x.key}
                  onClick={() => setP((prev) => ({ ...prev, position: x.key }))}
                  className={`px-3 py-2 rounded-xl border ${
                    p.position === x.key
                      ? "bg-emerald-500 text-black border-emerald-500"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cómo te gusta jugar */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 mb-6">
        <h3 className="text-lg font-semibold mb-3">Cómo te gusta jugar</h3>

        {/* Actitud */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Actitud</div>
          <div className="flex flex-wrap gap-2">
            {ATTITUDE.map((a) => (
              <button
                key={a}
                onClick={() => setP((x) => ({ ...x, attitude: a }))}
                className={`px-4 py-2 rounded-xl border ${
                  p.attitude === a ? "bg-emerald-500 text-black border-transparent" : "bg-white/5 border-white/10"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Competitividad */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Competitividad</div>
          <div className="flex flex-wrap gap-2">
            {COMP.map((c) => (
              <button
                key={c}
                onClick={() => setP((x) => ({ ...x, competitiveness: c }))}
                className={`px-4 py-2 rounded-xl border ${
                  p.competitiveness === c
                    ? "bg-emerald-500 text-black border-transparent"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Frecuencia */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Frecuencia deseada</div>
          <div className="flex flex-wrap gap-2">
            {FREQ.map((f) => (
              <button
                key={f}
                onClick={() => setP((x) => ({ ...x, frequency: f }))}
                className={`px-4 py-2 rounded-xl border ${
                  p.frequency === f ? "bg-emerald-500 text-black border-transparent" : "bg-white/5 border-white/10"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Manejo de paredes */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Manejo de paredes</div>
          <div className="flex flex-wrap gap-2">
            {PAREDES.map((g) => (
              <button
                key={g}
                onClick={() => setP((x) => ({ ...x, paredes: g }))}
                className={`px-4 py-2 rounded-xl border ${
                  p.paredes === g ? "bg-emerald-500 text-black border-transparent" : "bg-white/5 border-white/10"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* DEFENSA — NUEVO (entre paredes y golpes) */}
        <div className="mb-4">
          <div className="text-sm text-gray-400 mb-2">Defensa</div>
          <div className="flex flex-wrap gap-2">
            {DEFENSA.map((d) => (
              <button
                key={d.k}
                onClick={() => setP((x) => ({ ...x, defense: d.k }))}
                className={`px-4 py-2 rounded-xl border ${
                  p.defense === d.k ? "bg-emerald-500 text-black border-transparent" : "bg-white/5 border-white/10"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Golpes que dominas */}
        <div>
          <div className="text-sm text-gray-400 mb-2">Golpes que dominas</div>
          <div className="flex flex-wrap gap-2">
            {GOLPES.map((s) => (
              <button
                key={s}
                onClick={() => toggleShot(s)}
                className={`px-4 py-2 rounded-xl border ${
                  (p.shots || []).includes(s)
                    ? "bg-emerald-500 text-black border-transparent"
                    : "bg-white/5 border-white/10"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Extras */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <h3 className="text-lg font-semibold mb-3">Extras</h3>
        <label className="inline-flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            className="accent-emerald-500"
            checked={!!p.public_profile}
            onChange={(e) => setP((x) => ({ ...x, public_profile: e.target.checked }))}
          />
          Hacer mi perfil público
        </label>

        {/* Avatar debajo de Extras */}
        <div className="mt-6">
          <AvatarUploader
            userId={user.id}
            onSaved={(url) => setP((x) => ({ ...x, avatar_url: url }))}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className={`px-5 py-2 rounded-2xl font-semibold ${
            saving ? "bg-white/10 text-gray-500 cursor-not-allowed" : "bg-emerald-500 text-black hover:brightness-110"
          }`}
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </SiteLayout>
  );
}
