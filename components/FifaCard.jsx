// components/FifaCard.jsx
import clsx from "clsx";

/**
 * FifaCard — tarjeta estilo “FIFA”
 *
 * Props:
 * - name: string
 * - level: number
 * - position: 'drive' | 'reves' | 'flex' | string
 * - initials: string (una letra)
 * - badges: string[] (pildoras)
 * - stats: { ATQ:number, DEF:number, COM:number, COL:number }
 * - footer: ReactNode (botones/enlaces)
 * - className: string (clases extra para el contenedor)
 */
export default function FifaCard({
  name = "Jugador",
  level = 6,
  position = "flex",
  initials = "J",
  badges = [],
  stats,
  footer = null,
  className, // <- AHORA sí lo recogemos correctamente
}) {
  // Fallback: si no llegan stats, los generamos a partir del nivel
  const base = Math.min(99, Math.max(1, Math.round((Number(level) || 6) * 10)));
  const safeStats = stats || {
    ATQ: base + 2,
    DEF: base,
    COM: base - 1,
    COL: base + 3,
  };

  const posLabel =
    position === "drive" ? "Drive" :
    position === "reves" ? "Revés" :
    position === "flex" ? "Indif." :
    position || "—";

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-3xl border border-white/10",
        "bg-gradient-to-b from-white/5 to-white/[0.03] p-5",
        "shadow-[0_10px_40px_rgba(16,185,129,0.08)]",
        className
      )}
    >
      {/* fondo sutil */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl" />

      {/* Cabecera: medalla nivel + posición */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black/40 border border-white/10">
            <div className="text-xl font-extrabold">{Number(level).toFixed(1)}</div>
            <div className="text-[10px] text-gray-400 leading-none">NIVEL</div>
          </div>
          <div>
            <div className="text-xl font-bold">{name}</div>
            <div className="text-xs text-gray-400">{posLabel}</div>
          </div>
        </div>

        {/* Iniciales/Avatar simple */}
        <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
          {String(initials || "J").slice(0, 1).toUpperCase()}
        </div>
      </div>

      {/* Badges */}
      {badges?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((b, i) => (
            <span
              key={i}
              className="text-xs rounded-full border border-white/15 bg-white/5 px-2 py-1 text-white/90"
            >
              {b}
            </span>
          ))}
        </div>
      )}

      {/* Stats 4 columnas: ATQ | DEF | COM | COL */}
      <div className="mt-5 grid grid-cols-4 gap-2">
        {["ATQ", "DEF", "COM", "COL"].map((k) => (
          <div
            key={k}
            className="rounded-2xl border border-white/10 bg-black/30 p-3 text-center"
          >
            <div className="text-[10px] text-gray-400">{k}</div>
            <div className="text-lg font-extrabold">{safeStats[k] ?? "—"}</div>
          </div>
        ))}
      </div>

      {/* Footer (botón editar / romper pareja, etc.) */}
      {footer && (
        <div className="mt-5 border-t border-white/10 pt-4">
          {footer}
        </div>
      )}
    </div>
  );
}
