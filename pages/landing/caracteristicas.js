// pages/landing/caracteristicas.js
import SiteLayout from "../../components/SiteLayout";
import Link from "next/link";

export default function Caracteristicas() {
  const features = [
    { title: "Onboarding visual", desc: "Cuestionario tap-first (posiciones, golpes, paredes) para estimar nivel." },
    { title: "Formación de parejas", desc: "Parejas estables o temporales según disponibilidad y objetivos." },
    { title: "Match Finder", desc: "Sugerencias por compatibilidad (nivel/actitud/agenda), modo amistoso o competitivo." },
    { title: "Reserva simplificada", desc: "Handoff a Playtomic para reservar pista." },
    { title: "Feedback post-partido", desc: "Valoraciones 1–5 rápidas: comunicación, posicionamiento, regularidad, deportividad, paredes." },
    { title: "Ficha técnica", desc: "Resumen con fortalezas, áreas de mejora, golpe especial y mote automático." },
  ];

  return (
    <SiteLayout>
      <h1 className="text-3xl font-bold">Características</h1>
      <p className="text-gray-300 mt-2 max-w-2xl">
        Tecnología + UX para que jugar sea más fácil, justo y divertido.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl p-6 bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold mb-1">{f.title}</h3>
            <p className="text-gray-300 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex items-center gap-3">
        <Link href="/landing/formulario" className="px-5 py-3 rounded-2xl bg-emerald-500 text-black font-semibold">
          Empezar ahora
        </Link>
        <Link href="/landing/matches/find" className="px-5 py-3 rounded-2xl border border-white/15 bg-white/5">
          Ver rivales
        </Link>
      </div>
    </SiteLayout>
  );
}
