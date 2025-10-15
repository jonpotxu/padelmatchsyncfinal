// pages/landing/formulario/index.js
import { useMemo, useState } from "react";
import Link from "next/link";
import SiteLayout from "../../../components/SiteLayout";
import { supabase } from "../../../lib/supabaseClient";


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

export default function Formulario() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    city: "",
    level: 5.0, // rango 1.0 - 7.0
    position: "",
    objective: "",
    attitude: "",
    competitiveness: "",
    frequency: "",
    shots: [],
    walls: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [createdId, setCreatedId] = useState("");

  const canSubmit = useMemo(() => {
    // Requisitos mínimos para MVP
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

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || busy) return;

    setBusy(true);
    setMsg("");
    setCreatedId("");

    try {
      const payload = {
        name: form.name,
        email: form.email || null,
        city: form.city,
        level: Number(form.level),
        position: form.position,
        objective: form.objective || null,
        attitude: form.attitude,
        competitiveness: form.competitiveness,
        frequency: form.frequency,
        shots: form.shots, // array
        walls: form.walls,
      };

      const { data, error } = await supabase.from("players").insert([payload]).select("id").single();
      if (error) throw error;

      const id = data?.id;
      setCreatedId(id || "");
      setMsg("✅ Perfil creado. ¡Ya casi estás!");
    } catch (err) {
      setMsg("❌ No se pudo guardar el perfil. Revisa los campos o inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Crea tu perfil</h1>
        <p className="text-gray-300 mt-2">
          Responde con toques —sin apenas teclear— y afinaremos tu nivel y estilo para encontrar{" "}
          <b>pareja</b> y <b>partidos equilibrados</b>.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-8">
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
                <label className="text-sm text-gray-400 mb-1 block">Email (opcional)</label>
                <input
                  type="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="tú@correo.com"
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
            </div>
          </section>

          {/* Posición preferida (pregunta visual simple) */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Posición preferida</h3>
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
          </section>

          {/* Actitud / Competitividad / Frecuencia */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Cómo te gusta jugar</h3>

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
          </section>

          {/* Manejo de paredes + Golpes */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Técnica</h3>

            <div className="grid md:grid-cols-2 gap-6">
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

          {/* Objetivo (texto corto) */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-lg font-semibold mb-3">Tu objetivo (opcional)</h3>
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
              placeholder="Ej.: Mejorar juego en pared, subir a 5.5, preparar torneo..."
              value={form.objective}
              onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))}
            />
          </section>

          {/* Submit */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!canSubmit || busy}
              className={`px-5 py-3 rounded-2xl ${
                canSubmit && !busy
                  ? "bg-emerald-500 text-black"
                  : "bg-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              {busy ? "Guardando..." : "Crear mi perfil"}
            </button>

            {createdId && (
              <Link
                href={`/landing/players/${createdId}`}
                className="px-5 py-3 rounded-2xl border border-white/15 bg-white/5"
              >
                Ver mi ficha
              </Link>
            )}
          </div>

          {msg && <p className="text-sm mt-2">{msg}</p>}
        </form>
      </div>
    </SiteLayout>
  );
}
