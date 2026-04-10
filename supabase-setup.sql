-- ============================================================
-- 圖書館研討室預約系統 — Supabase 資料庫初始化
-- 在 Supabase 後台 SQL Editor 貼上並執行
--
-- ⚠️  如果之前已執行過舊版 SQL，請先執行以下三行刪除舊表：
--   drop table if exists bookings;
--   drop table if exists recurring;
--   drop table if exists blocked_dates;
-- 然後再執行以下全部內容。
-- ============================================================

-- 1. 預約記錄
create table if not exists bookings (
  id            text primary key,
  date          text not null,
  slot_id       text not null,
  room          text not null,
  type          text not null,
  name          text not null,
  department    text,
  student_class text,
  purpose       text,
  headcount     integer,
  cancel_code   text not null,
  created_at    timestamptz default now()
);

-- 2. 固定每週預約
create table if not exists recurring (
  id            text primary key,
  day_of_week   integer not null,
  slot_id       text not null,
  room          text not null,
  type          text not null,
  name          text not null,
  department    text,
  student_class text,
  purpose       text,
  headcount     integer,
  start_date    text not null,
  end_date      text,
  is_recurring  boolean default true
);

-- 3. 封鎖日期
create table if not exists blocked_dates (
  date   text primary key,
  reason text
);

-- ============================================================
-- 授權 anon 及 authenticated 角色讀寫所有表
-- （這是 Supabase 前端 JS SDK 能存取表的必要條件）
-- ============================================================
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on bookings      to anon, authenticated;
grant select, insert, update, delete on recurring     to anon, authenticated;
grant select, insert, update, delete on blocked_dates to anon, authenticated;

-- ============================================================
-- Row Level Security（允許所有人讀寫，無需登入）
-- ============================================================
alter table bookings      enable row level security;
alter table recurring     enable row level security;
alter table blocked_dates enable row level security;

-- 如果 policy 已存在會報錯，可先 drop 再建：
drop policy if exists "public_all" on bookings;
drop policy if exists "public_all" on recurring;
drop policy if exists "public_all" on blocked_dates;

create policy "public_all" on bookings
  for all using (true) with check (true);

create policy "public_all" on recurring
  for all using (true) with check (true);

create policy "public_all" on blocked_dates
  for all using (true) with check (true);
