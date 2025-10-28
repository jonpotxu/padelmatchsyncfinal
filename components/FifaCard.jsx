// components/FifaCard.jsx
import React from "react";

export default function FifaCard({
  name = "Jugador",
  level = 6,
  position = "—",
  initials = "J",
  badges = [],
  stats = { ATQ: 20, DEF: 18, COM: 17, COL: 21 },
  footer = null,
  className = "",
}) {
  // Capamos stats a 1–99 por estética
  const cap = (n) => Math.max(1, Math.min(99, Math.round(Number(n ?? 0))));
  const S = {
    ATQ: cap(stats.ATQ),
    DEF: cap(stats.DEF),
    COM: cap(stats.COM),
    COL: cap(stats.COL),
  };

  // Fondo “placa” con punteado
  const plateBg = {
    backgroundImage: [
      // punteado
      "radial-gradient(rgba(255,255,255,0.06) 1px, rgba(0,0,0,0) 1px)",
      // brillo lateral
      "linear-gradient(120deg, rgba(0,0,0,0.2), rgba(16,185,129,0.08) 30%, rgba(0,0,0,0.25) 60%)",
      // metal azulado
      "linear-gradient(#0d1720, #0b1320)",
    ].join(", "),
    backgroundSize: "18px 18px, 100% 100%, 100% 100%",
    backgroundPosition: "0 0, 0 0, 0 0",
  };

  return (
    <div
      className={[
        "relative rounded-3xl",
        "border border-white/10",
        "bg-black/40",
        "p-5 md:p-6",
        "shadow-[0_10px_25px_-10px_rgba(0,0,0,0.6)]",
        "overflow-hidden",
        className,
      ].join(" ")}
      style={plateBg}
    >
      {/* Glow de borde inferior */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-10 h-24 bg-gradient-to-t from-emerald-500/15 to-transparent blur-xl" />

      {/* Bisel interno sutil */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

      {/* Cabecera: nivel, nombre, position + avatar */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80">
              NIVEL
            </div>
            <div className="text-lg font-extrabold">{Number(level).toFixed(1)}</div>
          </div>
          <div className="mt-1 text-xl md:text-2xl font-semibold truncate">{name}</div>
          <div className="text-xs text-white/60 mt-0.5">{posToLabel(position)}</div>

          {/* Badges */}
          {badges?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {badges.map((b, i) => (
                <span
                  key={i}
                  className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-md bg-white/7 border border-white/10 text-white/80"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Avatar con aro */}
        <div className="shrink-0 relative">
          <div className="size-12 md:size-14 rounded-full bg-white/5 border border-white/15 grid place-items-center">
            <div className="size-10 md:size-12 rounded-full bg-emerald-500/15 grid place-items-center text-lg md:text-xl font-bold text-emerald-200">
              {String(initials || "?").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="mt-4 h-px w-full bg-gradient-to-r from-white/5 via-white/15 to-white/5" />

      {/* Stats – cuatro casillas */}
      <div className="mt-4 grid grid-cols-4 gap-3">
        <StatBox label="ATQ" value={S.ATQ} />
        <StatBox label="DEF" value={S.DEF} />
        <StatBox label="COM" value={S.COM} />
        <StatBox label="COL" value={S.COL} />
      </div>

      {/* Footer (botones) */}
      {footer && (
        <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-3">
          {footer}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
      <div className="text-[11px] tracking-wider text-white/60">{label}</div>
      <div className="text-2xl font-extrabold">{value}</div>
    </div>
  );
}

function posToLabel(p) {
  if (!p) return "—";
  const map = { drive: "Revés", reves: "Revés", flex: "Indif." };
  return map[p] || p;
}
