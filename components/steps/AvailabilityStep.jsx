const SLOTS = ["Lun tarde","Mar tarde","Mie tarde","Jue tarde","Vie tarde","Sab mañana","Dom mañana","Dom tarde"];

export default function AvailabilityStep({ data, update, onPrev, onNext }) {
  const toggle = (v) => {
    const set = new Set(data.availability);
    set.has(v) ? set.delete(v) : set.add(v);
    update({ availability: Array.from(set) });
  };

  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">Selecciona tus franjas (toca para activar/desactivar):</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SLOTS.map((s)=>(
          <button key={s} onClick={()=>toggle(s)}
            className={`px-3 py-2 rounded-xl border ${data.availability.includes(s) ? "bg-emerald-500 text-black border-emerald-400" : "bg-white/5 border-white/10"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="flex justify-between mt-8">
        <button onClick={onPrev} className="px-4 py-2 rounded-xl border bg-white/5 border-white/10">Atrás</button>
        <button onClick={onNext} className="px-4 py-2 rounded-xl bg-emerald-500 text-black">Siguiente</button>
      </div>
    </div>
  );
}
