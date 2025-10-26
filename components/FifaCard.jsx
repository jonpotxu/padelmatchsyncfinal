// components/FifaCard.jsx
import clsx from "clsx";

/**
 * props:
 * - name: string
 * - level: number (1–7 ó 1–99, mostramos entero grande a la izquierda)
 * - position: string (reves, drive, flex)
 * - initials: string (1 letra círculo)
 * - badges: string[] (chips pequeñas)
 * - stats: { ATQ:number, DEF:number, COM:number, COL:number }
 * - footer: ReactNode (botones)
 */
export default function FifaCard({
  name = "Jugador",
  level = 6,
  position = "—",
  initials = "J",
  badges = [],
  stats = { ATQ: 50, DEF: 50, COM: 50, COL: 50 },
  footer = null,
}) {
  // Convertimos nivel [1–7] a un “rating” visual tipo FIFA (opcional)
  const rating = Math.max(1, Math.round(Number(level) * 10));

  return (
    <div
      className={
        `relative rounded-3xl border border-white/10 bg-gradient-to-b
         from-white/[0.04] to-white/[0.02] p-5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)] ` + className
      }
    >
      {/* fondo punteado */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
          maskImage:
            "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.4))",
        }}
      />

      <div className="relative z-10 flex items-start gap-4">
        {/* Rating grande */}
        <div className="flex flex-col items-center">
          <div className="text-4xl font-extrabold leading-none">{rating}</div>
          <div className="text-[10px] uppercase tracking-widest text-gray-400 -mt-1">
            Lvl {Number(level).toFixed(1)}
          </div>
        </div>

        {/* Avatar circular + nombre/pos/badges */}
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full border border-white/15 bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-xl font-bold">
              {String(initials || "J").slice(0, 1).toUpperCase()}
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight">{name}</div>
              <div className="text-[11px] text-gray-400">
                {positionLabel(position)}
              </div>
              {!!badges?.length && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {badges.map((b, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-gray-300"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Regla divisoria */}
          <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {/* Stats 4 columnas: ATQ DEF COM COL */}
          <div className="grid grid-cols-4 gap-4">
            {[
              ["ATQ", stats.ATQ],
              ["DEF", stats.DEF],
              ["COM", stats.COM],
              ["COL", stats.COL],
            ].map(([k, v]) => (
              <div key={k} className="text-center">
                <div className="text-[10px] tracking-widest text-gray-400">{k}</div>
                <div className="mt-0.5 text-xl font-extrabold">{Math.round(Number(v || 0))}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer (botones) */}
      {footer && <div className="mt-4">{footer}</div>}

      {/* halo sutil */}
      <div className="pointer-events-none absolute -inset-px rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.15)]" />
    </div>
  );
}

function positionLabel(pos) {
  if (pos === "reves") return "lvl — revés";
  if (pos === "drive") return "lvl — drive";
  if (pos === "flex") return "lvl — flex";
  return "—";
}
