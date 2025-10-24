// components/FifaCard.jsx
import clsx from "clsx";

/**
 * FifaCard — tarjeta estilo FIFA adaptada al theme actual.
 *
 * Props:
 * - name: string
 * - rating: number | string   (ej. 78)  -> grande arriba a la izquierda
 * - level: number | string    (ej. 5.8) -> se muestra pequeño bajo rating
 * - position: "drive" | "revés" | "flex" | string
 * - city: string (opcional)
 * - avatarUrl: string (opcional)
 * - shots: string[] (opcional)  -> se muestran como badges
 * - badges: string[] (opcional) -> p.ej. ["competitivo", "constante"]
 * - stats:  { pac, sho, pas, dri, def, phy }  (números 0–99)
 * - accent: "emerald" | "cyan" | "violet" | "amber" | etc (tailwind color)
 * - compact: boolean (versión reducida)
 */
export default function FifaCard({
  name = "Jugador/a",
  rating = 78,
  level = 5.8,
  position = "indiferente",
  city,
  avatarUrl,
  shots = [],
  badges = [],
  stats = {},
  accent = "emerald",
  compact = false,
}) {
  const {
    pac = 78, // velocidad
    sho = 75, // pegada
    pas = 76, // pase
    dri = 77, // volea/definición
    def = 74, // defensa
    phy = 79, // físico/consistencia
  } = stats;

  // Inicial del avatar
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  // Paleta de acento
  const accentRing = `ring-${accent}-400/40`;
  const accentGlowFrom = `from-${accent}-400/25`;
  const accentGlowTo = `to-${accent}-300/10`;

  return (
    <div
      className={clsx(
        "relative rounded-[28px] p-[2px] transition-transform duration-300 hover:-translate-y-0.5",
        "bg-gradient-to-br",
        accentGlowFrom,
        accentGlowTo,
        "shadow-[0_10px_40px_rgba(16,185,129,.16)]" // queda bien con emerald; con otros acentos sigue discreto
      )}
    >
      {/* Inner glass card */}
      <div
        className={clsx(
          "relative rounded-[26px] px-5 pt-5 pb-4",
          "bg-gradient-to-b from-white/10 via-white/5 to-white/0",
          "border border-white/10 backdrop-blur"
        )}
        style={{
          // textura sutil de “estrellas”
          backgroundImage:
            "radial-gradient(circle at 20% 12%,rgba(255,255,255,.08) 0 2px,transparent 3px)",
          backgroundSize: "38px 38px",
        }}
      >
        {/* Cabezal */}
        <div className="flex items-start gap-3">
          <div className="min-w-[54px]">
            <div className="text-4xl leading-none font-extrabold tracking-tight">
              {String(rating).padStart(2, "0")}
            </div>
            <div className="mt-0.5 text-xs text-white/70">Lvl {level}</div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wide text-white/70">
              {position}
            </div>
          </div>

          {/* Avatar */}
          <div
            className={clsx(
              "relative h-20 w-20 shrink-0 rounded-full overflow-hidden ring-2",
              accentRing,
              "shadow-[0_0_0_6px_rgba(0,0,0,.35)]"
            )}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full grid place-items-center bg-white/10 text-2xl font-bold">
                {initial}
              </div>
            )}
          </div>

          {/* Nombre y meta */}
          <div className="flex-1">
            <div className="text-xl font-bold leading-tight">{name}</div>
            <div className="text-xs text-white/70 mt-0.5">{city || "—"}</div>

            {/* Badges */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {shots.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-white/15 bg-white/5 text-white/85"
                >
                  {s}
                </span>
              ))}
              {badges.slice(0, 2).map((b) => (
                <span
                  key={b}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-white/15 bg-white/5 text-white/70"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Separador sutil */}
        <div className="my-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Stats */}
        <div
          className={clsx(
            "grid gap-4",
            compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
          )}
        >
          <Stat label="PAC" value={pac} />
          <Stat label="SHO" value={sho} />
          <Stat label="PAS" value={pas} />
          <Stat label="DRI" value={dri} />
          <Stat label="DEF" value={def} />
          <Stat label="PHY" value={phy} />
        </div>
      </div>

      {/* Glow exterior muy sutil (blur) */}
      <div
        className="pointer-events-none absolute -inset-3 -z-10 rounded-[32px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 10%, rgba(16,185,129,.18), transparent 70%)",
          filter: "blur(12px)",
          opacity: 0.7,
        }}
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-baseline gap-2">
      <div className="text-[11px] tracking-widest text-white/60 w-8">{label}</div>
      <div className="text-xl font-bold tabular-nums">{String(value).padStart(2, "0")}</div>
    </div>
  );
}
