// /pages/landing/profile/edit.js
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import SiteLayout from "@/components/SiteLayout";
import { useAuth } from "@/src/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const POSITIONS = [
  { key: "drive", label: "Drive (derecha)" },
  { key: "reves", label: "Revés (izquierda)" },
  { key: "flex", label: "Indiferente" },
];
const ATTITUDE = [
  { key: "diversion", label: "Diversión" },
  { key: "mixto", label: "Mixto" },
  { key: "competitivo", label: "Competitivo" },
];
const COMPETITIVENESS = [
  { key: "baja", label: "Baja" },
  { key: "media", label: "Media" },
  { key: "alta", label: "Alta" },
];
const FREQUENCY = [
  { key: "1x", label: "1/semana" },
  { key: "2x", label: "2/semana" },
  { key: "3x", label: "3+/semana" },
];
const WALLS = [
  { key: "baja", label: "Básico" },
  { key: "media", label: "Intermedio" },
  { key: "alta", label: "Avanzado" },
];
const SHOTS = [
  "bandeja",
  "víbora",
  "smash",
  "chiquita",
  "globo",
  "salida-pared",
  "dejada",
  "contra-pared",
];

export default function EditProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    city: "",
    level: 5.0,
    position: "",
    attitude: "",
    competitiveness: "",
    frequency: "",
    walls: "",
    shots: [],
    objective: "",
    avatar_url: "",
    seeking_pair: false,
    pair_status: null,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Cargar perfil actual
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "name, city, level, position, attitude, competitiveness, frequency, walls, shots, objective, avatar_url, seeking_pair, pair_status"
        )
        .eq("id", user.id)
        .maybeSingle();
      if (!error && data) {
        setForm({
          name: data.name || "",
          city: data.city || "",
          level: Number(data.level ?? 5) || 5,
          position: data.position || "",
          attitude: data.attitude || "",
          competitiveness: data.competitiveness || "",
          frequency: data.frequency || "",
          walls: data.walls || "",
          shots: Array.isArray(data.shots) ? data.shots : [],
          objective: data.objective || "",
          avatar_url: data.avatar_url || "",
          seeking_pair: !!data.seeking_pair,
          pair_status: data.pair_status || null,
        });
      }
    })();
  }, [user]);

  const canSave = useMemo(() => {
    return (
      form.name &&
      form.city &&
      form.position &&
      form.attitude &&
      form.competitiveness &&
      form.frequency &&
      form.walls &&
      form.level >= 1 &&
      form.level <= 7
    );
  }, [form]);

  const toggleArray = (key, value) => {
    setForm((f) => {
      const set = new Set(f[key] || []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...f, [key]: Array.from(set) };
    });
  };

  const save = async (e) => {
    e?.preventDefault?.();
    if (!user || busy || !canSave) return;
    setBusy(true);
    setMsg("");

    try {
      const payload = {
        name: form.name,
        city: form.city,
        level: Number(form.level),
        position: form.position,
        attitude: form.attitude,
        competitiveness: form.competitiveness,
        frequency: form.frequency,
        walls: form.walls,
        shots: form.shots,
        objective: form.objective || null,
        avatar_url: form.avatar_url || null,
        seeking_pair: !!form.seeking_pair,
        pair_status: form.pair_status || null,
      };

      const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
      if (error) throw error;

      setMsg("✅ Perfil actualizado.");
      // Volver a “Mi área”
      setTimeout(() => router.push("/landing/app"), 600);
    } catch (err) {
      setMsg("❌ No se pudo guardar. " + (err?.message || ""));
    } finally {
      setBusy(false);
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
        <p className="text-gray-400">Necesitas iniciar sesión.</p>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Editar perfil</h1>
        <p className="text-gray-400 mb-6">Actualiza tus datos para un mejor emparejamiento.</p>

        <form onSubmit={save} className="space-y-8">
          {/* Identidad */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Tu información</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Nombre</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Ciudad</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Nivel estimado <span className="text-gray-500">(1.0–7.0)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={7}
                    step={0.1}
                    value={form.level}
                    onChange={(e) => setForm((f) => ({ ...f, level: parseFloat(e.target.value) }))}
                    className="w-full accent-emerald-500"
                  />
                  <span className="w-12 text-right">{Number(form.level).toFixed(1)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Avatar (URL)</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                  placeholder="https://…/mi-avatar.png"
                  value={form.avatar_url}
                  onChange={(e) => setForm((f) => ({ ...f, avatar_url: e.target.value }))}
                />
              </div>
            </div>
          </section>

          {/* Juego y preferencias */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Cómo te gusta jugar</h3>

            {/* Posición */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Posición preferida</div>
              <div className="flex flex-wrap gap-2">
                {POSITIONS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, position: p.key }))}
                    className={`px-4 py-2 rounded-xl border ${
                      form.position === p.key
                        ? "bg-emerald-500 text-black border-emerald-500"
                        : "bg-white/5 border-white/10"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actitud / Competitividad / Frecuencia */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-400 mb-2">Actitud</div>
                <div className="flex flex-wrap gap-2">
                  {ATTITUDE.map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, attitude: a.key }))}
                      className={`px-3 py-2 rounded-xl border ${
                        form.attitude === a.key
                          ? "bg-emerald-500 text-black border-emerald-500"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Competitividad</div>
                <div className="flex flex-wrap gap-2">
                  {COMPETITIVENESS.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, competitiveness: c.key }))}
                      className={`px-3 py-2 rounded-xl border ${
                        form.competitiveness === c.key
                          ? "bg-emerald-500 text-black border-emerald-500"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-sm text-gray-400 mb-2">Frecuencia deseada</div>
                <div className="flex flex-wrap gap-2">
                  {FREQUENCY.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setForm((s) => ({ ...s, frequency: f.key }))}
                      className={`px-3 py-2 rounded-xl border ${
                        form.frequency === f.key
                          ? "bg-emerald-500 text-black border-emerald-500"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Paredes + Golpes */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">Manejo de paredes</div>
                <div className="flex flex-wrap gap-2">
                  {WALLS.map((w) => (
                    <button
                      key={w.key}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, walls: w.key }))}
                      className={`px-3 py-2 rounded-xl border ${
                        form.walls === w.key
                          ? "bg-emerald-500 text-black border-emerald-500"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-2">Golpes que dominas</div>
                <div className="flex flex-wrap gap-2">
                  {SHOTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleArray("shots", s)}
                      className={`px-3 py-2 rounded-xl border ${
                        form.shots.includes(s)
                          ? "bg-emerald-500 text-black border-emerald-500"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Objetivo y opciones */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Extras</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm text-gray-400 mb-1 block">Objetivo (opcional)</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                  placeholder="Ej.: Mejorar juego en pared, preparar torneo…"
                  value={form.objective}
                  onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  className="accent-emerald-500"
                  checked={form.seeking_pair}
                  onChange={(e) => setForm((f) => ({ ...f, seeking_pair: e.target.checked }))}
                />
                Estoy buscando pareja
              </label>
            </div>
          </section>

          {/* Acciones */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSave || busy}
              className={`px-5 py-3 rounded-2xl ${
                canSave && !busy
                  ? "bg-emerald-500 text-black"
                  : "bg-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              {busy ? "Guardando…" : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10"
            >
              Cancelar
            </button>
            <a href="/landing/app" className="text-sm text-gray-400 underline ml-auto">
              Volver a Mi área
            </a>
          </div>

          {msg && <p className="text-sm mt-2">{msg}</p>}
        </form>
      </div>
    </SiteLayout>
  );
}
