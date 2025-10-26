// components/AvatarUploader.jsx
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Sube avatar al bucket "avatars" (público) con compresión cliente < 1MB.
 * Requiere tener el bucket "avatars" creado como público.
 */
export default function AvatarUploader({ userId, onSaved }) {
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function compressToWebP(file, maxBytes = 1_000_000, maxSize = 512) {
    const img = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
    canvas.width = Math.floor(img.width * ratio);
    canvas.height = Math.floor(img.height * ratio);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    let quality = 0.92;
    let blob = await new Promise((r) => canvas.toBlob(r, "image/webp", quality));
    while (blob.size > maxBytes && quality > 0.4) {
      quality -= 0.1;
      // eslint-disable-next-line no-await-in-loop
      blob = await new Promise((r) => canvas.toBlob(r, "image/webp", quality));
    }
    return new File([blob], "avatar.webp", { type: "image/webp" });
  }

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setMsg("");
    setBusy(true);
    try {
      // Comprimir
      const webp = await compressToWebP(file);

      // Subir a supabase storage
      const path = `${userId}/${Date.now()}-avatar.webp`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, webp, {
        cacheControl: "3600",
        upsert: true,
        contentType: "image/webp",
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = pub?.publicUrl;

      // Guardar en profiles.avatar_url
      const { error: updErr } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
      if (updErr) throw updErr;

      onSaved?.(url);
      setMsg("✅ Avatar actualizado.");
    } catch (err) {
      setMsg("❌ No se pudo subir el avatar.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-semibold mb-3">Avatar</h3>
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        disabled={busy}
        className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-black hover:file:brightness-110"
      />
      <div className="text-xs text-gray-400 mt-2">
        {fileName ? <>Archivo: <b>{fileName}</b> — </> : null}
        Máx. 1 MB. Se convierte a WebP y se escala a 512px.
      </div>
      {msg && <p className="mt-3 text-sm">{msg}</p>}
    </div>
  );
}
