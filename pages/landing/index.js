// pages/landing/index.js
import Link from "next/link";
import SiteLayout from "../../components/SiteLayout";

export default function Landing() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
          Encuentra tu <span className="text-emerald-400">pareja ideal</span> de pádel
          <br className="hidden md:block" /> y partidos equilibrados
        </h1>
        <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
          Calibración visual del nivel · Emparejamiento inteligente · Partidos amistosos o competitivos ·
          Handoff a Playtomic para reservar pista.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/landing/formulario" className="px-5 py-3 rounded-2xl bg-emerald-500 text-black font-semibold">
            Regístrate gratis
          </Link>
          <Link href="/landing/caracteristicas" className="px-5 py-3 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10">
            Ver características
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-gray-400">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Partner matching</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Pair vs Pair</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Feedback post-partido</span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Ficha técnica y mote</span>
        </div>
      </section>

      {/* TRES BLOQUES */}
      <section className="grid md:grid-cols-3 gap-6 mt-8">
        {[
          { title: "Emparejamiento preciso", desc: "Nivel, actitud y disponibilidad para encontrar compañero y rivales compatibles." },
          { title: "Partidos a tu medida", desc: "Elige amistoso o competitivo y te proponemos los mejores cruces." },
          { title: "Mejora continua", desc: "Feedback rápido para detectar fortalezas y áreas de mejora." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl p-6 bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold mb-1">{c.title}</h3>
            <p className="text-gray-300 text-sm">{c.desc}</p>
          </div>
        ))}
      </section>

      {/* CTA FINAL */}
      <section className="mt-12 text-center">
        <p className="text-gray-300">¿Listo para jugar mejor y más a menudo?</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <Link href="/landing/formulario" className="px-5 py-3 rounded-2xl bg-emerald-500 text-black font-semibold">
            Crear perfil y buscar pareja
          </Link>
          <Link href="/landing/matches/find" className="px-5 py-3 rounded-2xl border border-white/15 bg-white/5">
            Buscar rivales ahora
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
