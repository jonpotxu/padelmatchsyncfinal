// pages/landing/sobre.js
import SiteLayout from "../../components/SiteLayout";

export default function Sobre() {
  return (
    <SiteLayout>
      <h1 className="text-3xl font-bold">Sobre PadelMatch Sync</h1>
      <p className="text-gray-300 mt-2 max-w-3xl">
        Nacido por y para jugadores: encuentra pareja y rivales compatibles en minutos,
        y que cada partido te ayude a mejorar.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="rounded-2xl p-6 bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-1">Nuestra misión</h3>
          <p className="text-gray-300 text-sm">
            Democratizar partidos equilibrados, fomentar el aprendizaje y reforzar la comunidad del pádel.
          </p>
        </div>
        <div className="rounded-2xl p-6 bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold mb-1">Principios</h3>
          <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
            <li>Transparencia y datos al servicio del jugador</li>
            <li>Integraciones responsables (sin scraping)</li>
            <li>Feedback honesto y constructivo</li>
          </ul>
        </div>
      </div>
    </SiteLayout>
  );
}
