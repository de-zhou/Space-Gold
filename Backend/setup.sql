-- À coller dans Supabase > SQL Editor > Run (une seule fois)
create extension if not exists pgcrypto;

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  sub_id text not null,
  context text not null,
  committed boolean not null default false,
  created_at timestamptz not null default now(),
  data jsonb not null default '{}'::jsonb
);

create index if not exists sessions_sub_idx on sessions (sub_id, context, created_at);
create index if not exists sessions_local_idx on sessions (sub_id, context, (data->>'localSessionId'));

-- Sécurité : personne ne peut lire la table depuis l'extérieur.
-- Seul ton backend (qui utilise la chaîne de connexion) y accède.
alter table sessions enable row level security;
