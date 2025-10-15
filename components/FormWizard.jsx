import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import AvailabilityStep from "./steps/AvailabilityStep";
import TechnicalStep from "./steps/TechnicalStep";
import StyleStep from "./steps/StyleStep";
import SummaryStep from "./steps/SummaryStep";

const steps = [
  { key: "personal", title: "Perfil" },
  { key: "availability", title: "Disponibilidad" },
  { key: "technical", title: "Técnica" },
  { key: "style", title: "Estilo & Actitud" },
  { key: "summary", title: "Resumen" },
];

export default function FormWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState({
    name: "", city: "",
    availability: [], // ej: ["Lun tarde", "Jue noche"]
    competitiveness: "intermedio",
    frequency: "2-3/semana",
    position: "drive", // drive | revés | flexible
    shots: [], // ["bandeja","víbora","smash","globo","salida-pared","chiquita"]
    walls: "medio", // manejo de paredes: bajo/medio/alto
    attitude: "equilibrado", // tranquilo | intenso | equilibrado
    objective: "mejorar", // divertirse | mejorar | competir
  });

  const next = () => setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  const prev = () => setStepIndex((i) => Math.max(i - 1, 0));
  const update = (patch) => setData((d) => ({ ...d, ...patch }));

  const current = steps[stepIndex].key;

  return (
    <div>
      {/* Progreso */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s.key} className="flex-1 h-2 rounded bg-white/10">
            <div className={`h-2 rounded ${i <= stepIndex ? "bg-emerald-500" : "bg-transparent"}`} />
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-400 mb-6">Paso {stepIndex + 1} de {steps.length} — {steps[stepIndex].title}</p>

      {/* Contenido */}
      <div className="relative min-h-[380px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.25 }}
          >
            {current === "personal" && <PersonalInfoStep data={data} update={update} onNext={next} />}
            {current === "availability" && <AvailabilityStep data={data} update={update} onPrev={prev} onNext={next} />}
            {current === "technical" && <TechnicalStep data={data} update={update} onPrev={prev} onNext={next} />}
            {current === "style" && <StyleStep data={data} update={update} onPrev={prev} onNext={next} />}
            {current === "summary" && <SummaryStep data={data} onPrev={prev} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
