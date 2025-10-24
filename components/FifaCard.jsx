// components/FifaCard.jsx
import Image from "next/image";

export default function FifaCard({
  name = "Jugador",
  level = 6.0,
  position = "drive",
  shots = [],
  avatarUrl = "",
  badges = [],
  footer = null, // JSX opcional (botones, etc.)
}) {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 overflow-hidden">
      {/* Marco “FIFA-like” simple */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-cyan-500/10 blur-2xl" />
      </div>

      {/* Header: nivel + posición */}
      <div className="flex items-center justify-between">
        <div className="text-3xl font-extrabold">{Number(level || 0).toFixed(1)}</div>
        <div className="text-xs uppercase tracking-wider text-gray-300">
          {position || "—"}
        </div>
      </div>

      {/* Avatar */}
      <div className="mt-4 flex items-center gap-4">
        <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-white/10 bg-black/40">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-2xl">
              {String(name || "?").slice(0,1).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div className="text-xl font-semibold">{name || "Jugador"}</div>
          {badges?.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {badges.map((b, idx) => (
                <span key={idx} className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10">
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Golpes */}
      <div className="mt-4">
        <div className="text-xs text-gray-400 mb-1">Golpes</div>
        <div className="flex flex-wrap gap-2">
          {(shots || []).slice(0, 6).map((s, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-lg bg-white/7 border border-white/10">
              {s}
            </span>
          ))}
          {(shots || []).length === 0 && (
            <span className="text-xs text-gray-500">—</span>
          )}
        </div>
      </div>

      {/* Footer */}
      {footer && <div className="mt-5">{footer}</div>}
    </div>
  );
}
