-- SQL seguro e isolado para o site Duda Retratos
-- Não apaga tabelas existentes de outros projetos.

create table if not exists public.dudaretratos_site_content (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.dudaretratos_site_content enable row level security;

drop policy if exists "dudaretratos_read_content" on public.dudaretratos_site_content;
create policy "dudaretratos_read_content"
  on public.dudaretratos_site_content
  for select
  using (true);

drop policy if exists "dudaretratos_insert_content" on public.dudaretratos_site_content;
create policy "dudaretratos_insert_content"
  on public.dudaretratos_site_content
  for insert
  with check (true);

drop policy if exists "dudaretratos_update_content" on public.dudaretratos_site_content;
create policy "dudaretratos_update_content"
  on public.dudaretratos_site_content
  for update
  using (true)
  with check (true);

insert into public.dudaretratos_site_content (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('dudaretratos_uploads', 'dudaretratos_uploads', true)
on conflict (id) do update set public = true;

drop policy if exists "dudaretratos_read_uploads" on storage.objects;
create policy "dudaretratos_read_uploads"
  on storage.objects
  for select
  using (bucket_id = 'dudaretratos_uploads');

drop policy if exists "dudaretratos_insert_uploads" on storage.objects;
create policy "dudaretratos_insert_uploads"
  on storage.objects
  for insert
  with check (bucket_id = 'dudaretratos_uploads');

drop policy if exists "dudaretratos_update_uploads" on storage.objects;
create policy "dudaretratos_update_uploads"
  on storage.objects
  for update
  using (bucket_id = 'dudaretratos_uploads')
  with check (bucket_id = 'dudaretratos_uploads');

drop policy if exists "dudaretratos_delete_uploads" on storage.objects;
create policy "dudaretratos_delete_uploads"
  on storage.objects
  for delete
  using (bucket_id = 'dudaretratos_uploads');
