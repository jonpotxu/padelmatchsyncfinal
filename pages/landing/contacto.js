// pages/landing/contacto.js
import { useState } from "react";
import SiteLayout from "../../components/SiteLayout";
import { supabase } from "../../lib/supabaseClient";

export default function Contacto() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [msg, setMsg] = useState("");
  const canSubmit = form.name && form.email && form.message;

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const { error } = await supabase.from("contact_messages").insert([{
        name: form.name, email: form.email, message: form.message
      }]);
      if (error) throw error;
      setMsg("✅ Gracias. Te responderemos muy pronto.");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setMsg("❌ No se pudo enviar. Inténtalo de nuevo.");
    }
  };

  return (
    <SiteLayout>
      <h1 className="text-3xl font-bold">Contacto</h1>
      <p className="text-gray-300 mt-2 max-w-2xl">
        ¿Tienes preguntas, ideas o propuestas de colaboración? Escríbenos.
      </p>

      <form onSubmit={onSubmit} className="mt-8 max-w-xl space-y-4">
        <div>
          <label className="text-sm text-gray-400 mb-1 block">Nombre</label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            value={form.name}
            onChange={(e)=>setForm(f=>({ ...f, name: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Email</label>
          <input
            type="email"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            value={form.email}
            onChange={(e)=>setForm(f=>({ ...f, email: e.target.value }))}
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-400 mb-1 block">Mensaje</label>
          <textarea
            rows={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            value={form.message}
            onChange={(e)=>setForm(f=>({ ...f, message: e.target.value }))}
            required
          />
        </div>

        <button
          disabled={!canSubmit}
          className={`px-5 py-3 rounded-2xl ${canSubmit ? "bg-emerald-500 text-black" : "bg-white/10 text-gray-500 cursor-not-allowed"}`}
          type="submit"
        >
          Enviar
        </button>

        {msg && <p className="text-sm mt-2">{msg}</p>}
      </form>
    </SiteLayout>
  );
}
