import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { playerScoreFromForm } from "../../utils/matching";

export default function SummaryStep({ data, onPrev }) {
  const [loading, setLoading] = useState(false);
  const [okId, setOkId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      const level = playerScoreFromForm(data);

      const payload = {
        name: data.name || null,
        email: null, // lo añadiremos cuando activemos auth
        city: data.city || null,
        availability: data.availability || [],
        competitiveness: data.competitiveness,
        frequency: data.frequency,
        position: data.position,
        shots: data.shots || [],
        walls: data.walls,
        attitude: data.attitude,
        objective: data.objective,
        level,
      };

      const { data: inserted, error } = await supabase
        .from("players")
        .insert([payload])
        .select(); // para recuperar el id creado

      if (error) throw error;

      setOkId(inserted?.[0]?.id || null);
    } catch (err) {
      setErrorMsg(err?.message || "Error al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const Row = ({label, children}) => (
    <div className="flex gap-2"><span className="text-gray-500 w-40">{label}</span><span>{children}</span></div>
  );

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Resumen</h3>

      <div className="space-y-2">
        <Row label="Nombre:">{data.name || "—"}</Row>
        <Row label="Ciudad:">{data.city || "—"}</Row>
        <Row label="Frecuencia:">{data.frequency}</Row>
        <Row label="Competitividad:">{data.competitiveness}</Row>
        <Row label="Disponibilidad:">{data.availability.join(", ") || "—"}</Row>
        <Row label="Posición:">{data.position}</Row>
        <Row label="Golpes:">{data.shots.join(", ") || "—"}</Row>
        <Row label="Paredes:">{data.walls}</Row>
        <Row label="Actitud:">{data.attitude}</Row>
        <Row label="Objetivo:">{data.objective}</Row>
        <Row label="Nivel (estimado):">{playerScoreFromForm(data).toFixed(1)}</Row>
      </div>

      {errorMsg && (
        <p className="mt-4 text-red-400 text-sm">❌ {errorMsg}</p>
      )}
      {okId && (
        <p className="mt-4 text-emerald-400 text-sm">
          ✅ Perfil guardado correctamente. ID: {okId}
        </p>
      )}

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrev}
          className="px-4 py-2 rounded-xl border bg-white/5 border-white/10"
          disabled={loading}
        >
          Atrás
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-black disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Guardando..." : "Confirmar"}
        </button>
      </div>
    </div>
  );
}
