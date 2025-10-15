export default function PersonalInfoStep({ data, update, onNext }) {
  return (
    <div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Tu nombre</label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none"
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="(opcional) Puedes saltar"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Ciudad / Club habitual</label>
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none"
            value={data.city}
            onChange={(e) => update({ city: e.target.value })}
            placeholder="Madrid, Barcelona, Valencia..."
          />
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-400 mb-2">Frecuencia deseada</p>
        <div className="flex flex-wrap gap-3">
          {["1/semana", "2-3/semana", "4+/semana"].map((f) => (
            <button
              key={f}
              onClick={() => update({ frequency: f })}
              className={`px-4 py-2 rounded-full border ${data.frequency===f ? "bg-emerald-500 text-black border-emerald-400" : "bg-white/5 border-white/10"}`}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm text-gray-400 mb-2">Competitividad</p>
        <div className="flex gap-3">
          {["casual","intermedio","torneos"].map((c) => (
            <button
              key={c}
              onClick={() => { update({ competitiveness: c }); onNext(); }}
              className={`px-4 py-2 rounded-xl border ${data.competitiveness===c ? "bg-emerald-500 text-black border-emerald-400" : "bg-white/5 border-white/10"}`}
            >{c}</button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">Se avanza automáticamente al elegir competitividad.</p>
      </div>
    </div>
  );
}
