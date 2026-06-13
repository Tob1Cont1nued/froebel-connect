-- ============================================================
-- FRÖBEL.connect – Datenbankschema
-- Ausführen im Supabase SQL-Editor
-- ============================================================

-- Aktiviere UUID-Extension
create extension if not exists "pgcrypto";

-- ============================================================
-- KITAS
-- ============================================================
create table kitas (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  city        text,
  address     text,
  created_at  timestamptz default now()
);

-- ============================================================
-- PROFILE (erweitert auth.users)
-- ============================================================
create table profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text not null,
  email       text not null,
  role        text not null check (role in ('eltern', 'fachkraft', 'traeger')),
  kita_id     uuid references kitas(id),
  avatar      text,
  created_at  timestamptz default now()
);

-- Automatisch Profile anlegen wenn User sich registriert
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'eltern')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- KINDER
-- ============================================================
create table children (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  age         int,
  emoji       text default '🌻',
  kita_id     uuid references kitas(id),
  created_at  timestamptz default now()
);

-- Eltern ↔ Kinder (m:n)
create table parent_children (
  parent_id   uuid references profiles(id) on delete cascade,
  child_id    uuid references children(id) on delete cascade,
  primary key (parent_id, child_id)
);

-- ============================================================
-- ANWESENHEIT
-- ============================================================
create table attendance (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid references children(id) on delete cascade,
  date        date not null default current_date,
  present     boolean default false,
  checked_by  uuid references profiles(id),
  created_at  timestamptz default now(),
  unique (child_id, date)
);

-- ============================================================
-- ABWESENHEITEN
-- ============================================================
create table absences (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid references children(id) on delete cascade,
  parent_id   uuid references profiles(id),
  from_date   date not null,
  to_date     date not null,
  reason      text not null,
  note        text,
  status      text default 'pending' check (status in ('pending', 'confirmed')),
  created_at  timestamptz default now()
);

-- ============================================================
-- TERMINE
-- ============================================================
create table appointments (
  id          uuid primary key default gen_random_uuid(),
  kita_id     uuid references kitas(id) on delete cascade,
  title       text not null,
  date        timestamptz not null,
  time        text,
  type        text check (type in ('event', 'closure', 'meeting', 'info')),
  description text,
  created_at  timestamptz default now()
);

-- ============================================================
-- NACHRICHTEN / CHAT
-- ============================================================
create table conversations (
  id          uuid primary key default gen_random_uuid(),
  subject     text,
  kita_id     uuid references kitas(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create table conversation_participants (
  conversation_id  uuid references conversations(id) on delete cascade,
  profile_id       uuid references profiles(id) on delete cascade,
  unread_count     int default 0,
  primary key (conversation_id, profile_id)
);

create table messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid references conversations(id) on delete cascade,
  sender_id        uuid references profiles(id),
  text             text not null,
  created_at       timestamptz default now()
);

-- updated_at in conversations bei neuer Nachricht aktuell halten
create or replace function update_conversation_timestamp()
returns trigger as $$
begin
  update conversations set updated_at = now() where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

create trigger on_new_message
  after insert on messages
  for each row execute procedure update_conversation_timestamp();

-- ============================================================
-- DOKUMENTE
-- ============================================================
create table documents (
  id          uuid primary key default gen_random_uuid(),
  kita_id     uuid references kitas(id) on delete cascade,
  title       text not null,
  category    text not null,
  file_url    text,
  size        text,
  icon        text default '📄',
  created_at  timestamptz default now()
);

-- ============================================================
-- PORTFOLIO
-- ============================================================
create table portfolio_entries (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid references children(id) on delete cascade,
  title       text not null,
  description text,
  emoji       text default '📚',
  image_url   text,
  created_at  timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table profiles             enable row level security;
alter table kitas                enable row level security;
alter table children             enable row level security;
alter table parent_children      enable row level security;
alter table attendance           enable row level security;
alter table absences             enable row level security;
alter table appointments         enable row level security;
alter table conversations        enable row level security;
alter table conversation_participants enable row level security;
alter table messages             enable row level security;
alter table documents            enable row level security;
alter table portfolio_entries    enable row level security;

-- Hilfsfunktion: eigene Rolle abrufen
create or replace function my_role()
returns text as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer;

-- Hilfsfunktion: eigene Kita-ID abrufen
create or replace function my_kita_id()
returns uuid as $$
  select kita_id from profiles where id = auth.uid();
$$ language sql security definer;

-- Profiles: jeder sieht sein eigenes Profil; Träger & Fachkräfte sehen alle aus ihrer Kita
create policy "Eigenes Profil lesen"    on profiles for select using (id = auth.uid());
create policy "Eigenes Profil updaten"  on profiles for update using (id = auth.uid());

-- Kitas: alle eingeloggten User sehen ihre Kita
create policy "Eigene Kita lesen" on kitas for select using (id = my_kita_id());

-- Kinder: Eltern sehen ihre eigenen Kinder; Fachkräfte sehen alle Kinder ihrer Kita
create policy "Eltern sehen eigene Kinder" on children for select
  using (
    id in (select child_id from parent_children where parent_id = auth.uid())
    or kita_id = my_kita_id()
  );

-- Abwesenheiten: Eltern sehen/erstellen ihre eigenen; Fachkräfte sehen alle ihrer Kita
create policy "Abwesenheiten lesen" on absences for select
  using (parent_id = auth.uid() or my_role() in ('fachkraft', 'traeger'));
create policy "Abwesenheiten erstellen" on absences for insert
  with check (parent_id = auth.uid());
create policy "Abwesenheiten bestätigen" on absences for update
  using (my_role() in ('fachkraft', 'traeger'));

-- Termine: alle User ihrer Kita sehen Termine
create policy "Termine lesen" on appointments for select using (kita_id = my_kita_id());
create policy "Termine erstellen" on appointments for insert
  with check (kita_id = my_kita_id() and my_role() in ('fachkraft', 'traeger'));

-- Nachrichten: Teilnehmer sehen ihre Konversationen
create policy "Konversationen lesen" on conversations for select
  using (id in (select conversation_id from conversation_participants where profile_id = auth.uid()));
create policy "Nachrichten lesen" on messages for select
  using (conversation_id in (select conversation_id from conversation_participants where profile_id = auth.uid()));
create policy "Nachrichten senden" on messages for insert
  with check (
    sender_id = auth.uid()
    and conversation_id in (select conversation_id from conversation_participants where profile_id = auth.uid())
  );

-- Dokumente: alle User ihrer Kita
create policy "Dokumente lesen" on documents for select using (kita_id = my_kita_id());

-- Portfolio: Eltern ihrer Kinder; Fachkräfte ihrer Kita
create policy "Portfolio lesen" on portfolio_entries for select
  using (
    child_id in (select child_id from parent_children where parent_id = auth.uid())
    or child_id in (select id from children where kita_id = my_kita_id())
  );
