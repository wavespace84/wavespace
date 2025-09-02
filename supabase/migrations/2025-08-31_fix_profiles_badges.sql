-- 1) 프로필 테이블: auth.users와 동기화되는 실테이블
create table if not exists public.user_profiles (
  id uuid primary key,                     -- auth.users.id
  email text unique,
  display_name text,
  member_type text,
  created_at timestamptz default now()
);

-- 2) 신규 유저 생성 시 user_profiles 자동 생성
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, display_name, member_type)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'member_type'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- 3) 뱃지 & 유저-뱃지 관계
create table if not exists public.badges (
  id bigserial primary key,
  name text not null,
  badge_type text,
  color text,
  icon text
);

create table if not exists public.user_badges (
  user_id uuid not null,
  badge_id bigint not null,
  earned_at timestamptz default now(),
  primary key (user_id, badge_id),
  constraint user_badges_user_id_fkey
    foreign key (user_id) references public.user_profiles(id) on delete cascade,
  constraint user_badges_badge_id_fkey
    foreign key (badge_id) references public.badges(id) on delete cascade
);

-- 4) 인덱스
create index if not exists idx_user_badges_user on public.user_badges(user_id);
create index if not exists idx_user_badges_badge on public.user_badges(badge_id);

-- 5) RLS (본인 데이터만 조회 허용)
alter table public.user_profiles enable row level security;
drop policy if exists "read own profile" on public.user_profiles;
create policy "read own profile" on public.user_profiles
  for select using (id = auth.uid());

alter table public.user_badges enable row level security;
drop policy if exists "read own badges" on public.user_badges;
create policy "read own badges" on public.user_badges
  for select using (user_id = auth.uid());

-- 6) Storage 버킷 생성 (FileService용)
insert into storage.buckets (id, name, public)
values ('files', 'files', true)
on conflict (id) do nothing;

-- (선택) 확인용 더미 배지
insert into public.badges(name, badge_type, color, icon)
values ('첫출석', 'attendance', '#3b82f6', 'award')
on conflict do nothing;