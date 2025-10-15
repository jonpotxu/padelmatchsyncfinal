import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Evita crashear en build si faltan envs
  console.warn("Supabase env vars missing. Check NEXT_PUBLIC_SUPABASE_URL / ANON_KEY");
}

// Persistencia en localStorage (browser). En SSR sólo se crea cliente sin sesión.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
