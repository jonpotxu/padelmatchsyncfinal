# PadelMatch Sync — Landing (Next.js + Tailwind + Supabase)

Landing con CTA + página de registro con mini test de nivel.

## Pasos

1) Instala dependencias
```
npm i
```

2) Crea `.env.local` en la raíz con:
```
NEXT_PUBLIC_SUPABASE_URL=TU_PROJECT_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

3) Crea la tabla en Supabase (SQL):
```
create extension if not exists "uuid-ossp";
create table if not exists public.pre_registrations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  city text not null,
  experience text not null,
  frequency text not null,
  tournaments text not null,
  style text not null,
  skill_level int not null,
  created_at timestamp with time zone not null default now()
);
```

4) Ejecuta en local
```
npm run dev
```

5) Despliega en Vercel y añade variables de entorno.
