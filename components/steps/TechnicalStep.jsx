const SHOTS = ["bandeja","víbora","smash","globo","chiquita","salida-pared"];
const POSITIONS = [
  { key:"drive", label:"Drive", img:"/images/form/drive.png" },
  { key:"revés", label:"Revés", img:"/images/form/reves.png" },
  { key:"flexible", label:"Flexible", img:"/images/form/flexible.png" },
];

export default function TechnicalStep({ data, update, onPrev, onNext }) {
  const toggleShot = (s) => {
    const set = new Set(data.shots);
    set.has(s) ? set.delete(s) : set.add(s);
    update({ shots: Array.from(set) });
  };

  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">Posición preferida</p>
      <div className="grid grid-cols-3 gap-4">
        {POSITIONS.map((p)=>(
          <button key={p.key} onClick={()=>update({ position:p.key })}
            className={`rounded-2xl border p-3 ${data.position===p.key ? "bg-emerald-500/20 border-emerald-400" : "bg-white/5 border-white/10"}`}>
            <div className="aspect-[4/3] w-full bg-white/5 rounded-xl flex items-center justify-center text-sm text-gray-500">
              {/* Coloca imagen real si la tienes */}
              <span>{p.label}</span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400 mt-6 mb-3">¿Qué golpes dominas? (multi-selección)</p>
      <div className="flex flex-wrap gap-3">
        {SHOTS.map((s)=>(
          <button key={s} onClick={()=>toggleShot(s)}
            className={`px-4 py-2 rounded-full border ${data.shots.includes(s) ? "bg-emerald-500 text-black border-emerald-400" : "bg-white/5 border-white/10"}`}>
            {s}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400 mt-6 mb-3">Manejo de paredes</p>
      <div className="flex gap-3">
        {["bajo","medio","alto"].map((w)=>(
          <button key={w} onClick={()=>update({ walls:w })}
            className={`px-4 py-2 rounded-xl border ${data.walls===w ? "bg-emerald-500 text-black border-emerald-400" : "bg-white/5 border-white/10"}`}>
            {w}
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
