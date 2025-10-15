import { useEffect } from "react";
import { useRouter } from "next/router";
import SiteLayout from "@/components/SiteLayout";
import { useAuth } from "@/src/AuthContext";

export default function AppArea() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/landing/login?next=/landing/app");
    }
  }, [loading, user, router]);

  if (loading) return <SiteLayout><p>Cargando…</p></SiteLayout>;
  if (!user) return null;

  return (
    <SiteLayout>
      <h1 className="text-2xl font-bold">Mi área</h1>
      <p className="text-gray-300 mt-2">Hola, {user.email || user.id} 👋</p>
      <p className="text-gray-400 mt-4">Desde aquí conectaremos perfil, pareja y partidos.</p>
    </SiteLayout>
  );
}
