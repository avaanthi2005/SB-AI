-- Run once in Supabase SQL Editor. Row-level security protects every account.
create table if not exists public.sb_chats (
 id uuid primary key, user_id uuid not null references auth.users(id) on delete cascade,
 title text not null default 'New conversation', messages jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now()
);
create index if not exists sb_chats_user_created on public.sb_chats(user_id,created_at desc);
alter table public.sb_chats enable row level security;
create policy "Users can read their own chats" on public.sb_chats for select to authenticated using (auth.uid()=user_id);
create policy "Users can create their own chats" on public.sb_chats for insert to authenticated with check (auth.uid()=user_id);
create policy "Users can edit their own chats" on public.sb_chats for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "Users can delete their own chats" on public.sb_chats for delete to authenticated using (auth.uid()=user_id);
create table if not exists public.sb_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 memory text not null default '' check (char_length(memory)<=4000)
);
alter table public.sb_profiles enable row level security;
create policy "Users can read their own memory" on public.sb_profiles for select to authenticated using (auth.uid()=user_id);
create policy "Users can create their own memory" on public.sb_profiles for insert to authenticated with check (auth.uid()=user_id);
create policy "Users can edit their own memory" on public.sb_profiles for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
