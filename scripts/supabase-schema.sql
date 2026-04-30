create table if not exists public.users (
  id text primary key,
  name text not null,
  email text unique,
  avatar text not null,
  handle text,
  bio text,
  password_hash text,
  auth_provider text not null default 'credentials',
  provider_account_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users add column if not exists handle text;
alter table public.users add column if not exists bio text;

create unique index if not exists idx_users_provider_account
on public.users (auth_provider, provider_account_id);

create table if not exists public.followings (
  follower_id text not null references public.users(id) on delete cascade,
  following_id text not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id)
);

create index if not exists idx_followings_follower
on public.followings (follower_id);

create table if not exists public.notes (
  id text primary key,
  slug text not null,
  user_id text references public.users(id) on delete set null,
  title text not null,
  area text not null,
  prefecture text not null,
  start_date text not null,
  end_date text not null,
  date_range text not null,
  duration text not null,
  style jsonb not null default '[]'::jsonb,
  companions text not null,
  theme jsonb not null default '[]'::jsonb,
  summary text not null,
  cover_image text not null,
  status text not null,
  likes integer not null default 0,
  comments integer not null default 0,
  saves integer not null default 0,
  author_name text not null,
  author_avatar text not null,
  days jsonb not null default '[]'::jsonb,
  comment_items jsonb not null default '[]'::jsonb,
  spots jsonb not null default '[]'::jsonb,
  tags jsonb not null default '[]'::jsonb,
  share_url text not null,
  share_password text not null default '',
  allow_comments boolean not null default true,
  allow_download boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_notes_status on public.notes(status);
create index if not exists idx_notes_updated_at on public.notes(updated_at desc);

create table if not exists public.note_likes (
  user_id text not null references public.users(id) on delete cascade,
  note_id text not null references public.notes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, note_id)
);

create table if not exists public.note_saves (
  user_id text not null references public.users(id) on delete cascade,
  note_id text not null references public.notes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, note_id)
);

create index if not exists idx_note_likes_user
on public.note_likes (user_id, created_at desc);

create index if not exists idx_note_saves_user
on public.note_saves (user_id, created_at desc);

create table if not exists public.expense_items (
  id text primary key,
  user_id text not null references public.users(id) on delete cascade,
  title text not null,
  category text not null,
  amount integer not null,
  spent_at date not null,
  note_id text references public.notes(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_expense_items_user_month
on public.expense_items (user_id, spent_at desc);
