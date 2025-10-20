import { useEffect, useState } from "react";
import SiteLayout from "@/components/SiteLayout";
import { useAuth } from "@/src/AuthContext";
import { supabase } from "@/lib/supabaseClient";

export default function MisPartidos() {
  const { user, loading } = useAuth();
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) setMsg("❌ No se pudo cargar.");
      else setRows(data || []);
    })();
  }, [user]);

  if (loading) {
    return (
      <SiteLayout>
        <p className="text-gray-400">Cargando…</p>
      </SiteLayout>
    );
  }
  if (!user) {
    return (
      <SiteLayout>
        <p className="text-gray-400">Necesitas iniciar sesión.</p>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <h1 className="text-3xl font-bold mb-2">Mis partidos</h1>
      <p className="text-gray-400 mb-6">Partidos que has creado o en los que participas.</p>

      {msg && <p className="text-sm">{msg}</p>}

      <div className="space-y-3">
        {rows.map((m) => (
          <div key={m.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">{m.title || "Partido"}</div>
                <div className="text-sm text-gray-400">
                  {m.mode || m.type || "—"} · {m.location || m.city || "—"} ·{" "}
                  {m.date
                    ? new Date(m.date).toLocaleString()
                    : m.scheduled_at
                    ? new Date(m.scheduled_at).toLocaleString()
                    : "sin fecha"}
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  className="px-4 py-2 rounded-xl bg-emerald-500 text-black"
                  href={`/landing/feedback/${m.id}`}
                >
                  Feedback
                </a>
                <a
                  className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10"
                  href={
                    (m.location || m.city)
                      ? `https://playtomic.io/search?where=${encodeURIComponent(m.location || m.city)}`
                      : "https://playtomic.io/"
                  }
                  target="_blank" rel="noreferrer"
                >
                  Reservar en Playtomic
                </a>
              </div>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="text-gray-400">Aún no hay partidos.</div>
        )}
      </div>
    </SiteLayout>
  );
}
