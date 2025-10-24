// components/AvatarMaker.jsx
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const COLORS = ["#10B981", "#06B6D4", "#F59E0B", "#EF4444", "#8B5CF6"];
const ICONS  = ["🎾","⭐","⚡","🔥","💎","🛡️"];

export default function AvatarMaker({ userId, initialStyle = {}, initialUrl = "", onSaved }) {
  const [color, setColor] = useState(initialStyle?.color || COLORS[0]);
  const [icon, setIcon] = useState(initialStyle?.icon || ICONS[0]);
  const [avatarUrl, setAvatarUrl] = useState(initialUrl || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async () => {
    if (!userId) return;
    setBusy(true); setMsg("");
    const style = { color, icon };
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_style: style, avatar_url: avatarUrl || null })
      .eq("id", userId);
    setBusy(false);
    if (error) setMsg("❌ No se pudo guardar");
    else {
      setMsg("✅ Guardado");
      onSaved?.({ avatar_style: style, avatar_url: avatarUrl });
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold mb-2">Avatar</div>
      <div className="flex items-center gap-4">
        {/* Preview */}
        <div
          className="h-16 w-16 rounded-2xl flex items-center justify-center text-2xl border border-white/10"
          style={{ background: color }}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover rounded-2xl" />
          ) : (
            <span>{icon}</span>
          )}
        </div>

        <div className="flex-1 grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-gray-400 mb-1">Color</div>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border ${c === color ? "ring-2 ring-white/70" : "border-white/20"}`}
                  style={{ background: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Icono</div>
            <div className="flex gap-1 flex-wrap">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`px-2 py-1 rounded-lg border ${ic === icon ? "bg-white/10" : "bg-transparent"} border-white/15`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-2">
            <div className="text-xs text-gray-400 mb-1">URL (opcional)</div>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…/mi-avatar.png"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={save}
          disabled={busy}
          className={`px-4 py-2 rounded-xl font-semibold ${busy ? "bg-white/10 text-gray-500" : "bg-emerald-500 text-black hover:brightness-110"}`}
        >
          {busy ? "Guardando…" : "Guardar avatar"}
        </button>
        {msg && <span className="text-sm">{msg}</span>}
      </div>
    </div>
  );
}
