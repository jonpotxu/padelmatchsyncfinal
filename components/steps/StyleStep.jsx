export default function StyleStep({ data, update, onPrev, onNext }) {
  return (
    <div>
      <p className="text-sm text-gray-400 mb-3">Actitud en pista</p>
      <div className="flex gap-3 flex-wrap">
        {["tranquilo","equilibrado","intenso"].map((a)=>(
          <button key={a} onClick={()=>update({ attitude:a })}
            className={`px-4 py-2 rounded-xl border ${data.attitude===a ? "bg-emerald-500 text-black border-emerald-400" : "bg-white/5 border-white/10"}`}>
            {a}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400 mt-6 mb-3">Objetivo principal</p>
      <div className="flex gap-3 flex-wrap">
        {["divertirse","mejorar","competir"].map((o)=>(
          <button key={o} onClick={()=>update({ objective:o })}
            className={`px-4 py-2 rounded-xl border ${data.objective===o ? "bg-emerald-500 text-black border-emerald-400" : "bg-white/5 border-white/10"}`}>
            {o}
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
