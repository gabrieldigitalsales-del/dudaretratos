-- Rode este SQL no Supabase: SQL Editor > New query > Run.
-- Ele cria a tabela do conteúdo e o bucket para fotos.

create table if not exists public.site_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "dudaretratos_public_read_site" on public.site_content;
create policy "dudaretratos_public_read_site"
  on public.site_content for select
  using (true);

drop policy if exists "dudaretratos_public_insert_site" on public.site_content;
create policy "dudaretratos_public_insert_site"
  on public.site_content for insert
  with check (true);

drop policy if exists "dudaretratos_public_update_site" on public.site_content;
create policy "dudaretratos_public_update_site"
  on public.site_content for update
  using (true)
  with check (true);

drop policy if exists "dudaretratos_public_delete_site" on public.site_content;
create policy "dudaretratos_public_delete_site"
  on public.site_content for delete
  using (true);

insert into public.site_content (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('dudaretratos', 'dudaretratos', true)
on conflict (id) do update set public = true;

drop policy if exists "dudaretratos_public_read_storage" on storage.objects;
create policy "dudaretratos_public_read_storage"
  on storage.objects for select
  using (bucket_id = 'dudaretratos');

drop policy if exists "dudaretratos_public_upload_storage" on storage.objects;
create policy "dudaretratos_public_upload_storage"
  on storage.objects for insert
  with check (bucket_id = 'dudaretratos');

drop policy if exists "dudaretratos_public_update_storage" on storage.objects;
create policy "dudaretratos_public_update_storage"
  on storage.objects for update
  using (bucket_id = 'dudaretratos')
  with check (bucket_id = 'dudaretratos');

drop policy if exists "dudaretratos_public_delete_storage" on storage.objects;
create policy "dudaretratos_public_delete_storage"
  on storage.objects for delete
  using (bucket_id = 'dudaretratos');
