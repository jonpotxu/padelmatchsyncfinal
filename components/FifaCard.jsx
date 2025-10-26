// components/FifaCard.jsx
import clsx from "clsx";

/**
 * Props:
 * - name, level, position, avatarUrl
 * - badges: string[]
 * - stats: { ATQ:number, DEF:number, COM:number, COL:number }   // NUEVO
 * - footer: ReactNode
 */
export default function FifaCard({
  name = "Jugador",
  level = 6,
  position = "—",
  avatarUrl,
  badges = [],
  stats = { ATQ: 72, DEF: 70, COM: 71, COL: 74 },
  footer,
  className,
}) {
  const initial = (name || "?").slice(0, 1).toUpperCase();
  const levelInt = Math.round(level * 10); // para un “overall” visual

  return (
    <div
      className={clsx(
        "relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f172a] to-[#0b1220] p-5 shadow-[0_10px_40px_rgba(0,0,0,0.35)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-[radial-gradient(transparent_1px,rgba(255,255,255,0.04)_1px)] before:bg-[length:18px_18px]",
        "min-h-[230px]",
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-center gap-4">
        <div className="text-4xl font-extrabold leading-none">{levelInt}</div>
        <div
          className={clsx(
            "h-16 w-16 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-xl font-bold",
            avatarUrl ? "overflow-hidden p-0" : "p-0"
          )}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} className="h-full w-full object-cover rounded-full" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold">{name}</div>
          <div className="text-xs text-white/70">Lvl {level.toFixed(1)} — {position || "—"}</div>
          {badges?.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {badges.map((b, i) => (
                <span key={i} className="text-[10px] px-2 py-[2px] rounded-full border border-white/15 text-white/80">
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Separator “rail” */}
      <div className="mt-3 h-px w-full bg-white/10" />

      {/* 4 stats */}
      <div className="grid grid-cols-4 gap-3 mt-4">
        {[
          ["ATQ", stats.ATQ ?? 72],
          ["DEF", stats.DEF ?? 70],
          ["COM", stats.COM ?? 71],
          ["COL", stats.COL ?? 74],
        ].map(([label, val]) => (
          <div key={label}>
            <div className="text-[11px] text-white/60">{label}</div>
            <div className="text-xl font-bold">{Number(val ?? 0)}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {footer && <div className="mt-4">{footer}</div>}

      {/* Sutil glow bottom */}
      <div className="pointer-events-none absolute inset-x-4 bottom-0 h-3 rounded-full bg-emerald-400/10 blur-xl" />
    </div>
  );
}
