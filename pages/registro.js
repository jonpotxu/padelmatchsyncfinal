import Head from "next/head";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Registro() {
  const [form, setForm] = useState({
    name: "", email: "", city: "",
    experience: "", frequency: "", tournaments: "",
    style: "", skill_level: 3,
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { error } = await supabase.from("pre_registrations").insert([form]);
      if (error) throw error;
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Registro — PadelMatch Sync</title></Head>
      <main className="min-h-screen bg-graphite text-white px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.svg" className="w-10 h-10" alt="logo" />
            <h1 className="text-3xl font-bold">Registro</h1>
          </div>
          {!done ? (
            <form onSubmit={onSubmit} className="space-y-6 card">
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1">Nombre</label>
                  <input required name="name" value={form.name} onChange={onChange} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none"/></div>
                <div><label className="block text-sm mb-1">Email</label>
                  <input required type="email" name="email" value={form.email} onChange={onChange} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none"/></div>
                <div className="md:col-span-2"><label className="block text-sm mb-1">Ciudad</label>
                  <input required name="city" value={form.city} onChange={onChange} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none"/></div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-sm mb-1">Experiencia</label>
                  <select required name="experience" value={form.experience} onChange={onChange} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none">
                    <option value="">Selecciona…</option>
                    <option>Menos de 6 meses</option>
                    <option>6 meses – 2 años</option>
                    <option>Más de 2 años</option>
                  </select></div>
                <div><label className="block text-sm mb-1">Frecuencia semanal</label>
                  <select required name="frequency" value={form.frequency} onChange={onChange} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none">
                    <option value="">Selecciona…</option>
                    <option>1 vez o menos</option>
                    <option>2 veces</option>
                    <option>3 veces o más</option>
                  </select></div>
                <div><label className="block text-sm mb-1">¿Torneos?</label>
                  <select required name="tournaments" value={form.tournaments} onChange={onChange} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none">
                    <option value="">Selecciona…</option>
                    <option>Nunca</option>
                    <option>A veces (aficionado)</option>
                    <option>Regularmente / federado</option>
                  </select></div>
                <div><label className="block text-sm mb-1">Estilo de juego</label>
                  <select required name="style" value={form.style} onChange={onChange} className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 outline-none">
                    <option value="">Selecciona…</option>
                    <option>Defensivo</option>
                    <option>Mixto</option>
                    <option>Ofensivo</option>
                  </select></div>
              </div>
              <div>
                <label className="block text-sm mb-1">Nivel técnico percibido (1–5)</label>
                <input type="range" min="1" max="5" name="skill_level" value={form.skill_level} onChange={onChange} className="w-full"/>
                <div className="text-right text-white/70 text-sm">Actual: {form.skill_level}</div>
              </div>
              {error && <div className="text-red-400">{error}</div>}
              <button disabled={loading} className="btn btn-primary w-full">{loading ? "Enviando..." : "Unirme a la lista"}</button>
            </form>
          ) : (
            <div className="card">
              <h2 className="text-2xl font-semibold mb-2">¡Gracias por unirte!</h2>
              <p className="text-white/70">Te avisaremos cuando abramos los primeros matches en tu zona.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
