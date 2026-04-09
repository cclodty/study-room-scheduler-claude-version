-- ============================================================
-- 圖書館研討室預約系統 — Supabase 資料庫初始化
-- 在 Supabase 後台 SQL Editor 貼上並執行
-- ============================================================

-- 1. 預約記錄
create table if not exists bookings (
  id          text primary key,
  date        text not null,
  slot_id     text not null,
  room        text not null,
  type        text not null,
  name        text not null,
  department  text,
  class       text,
  purpose     text,
  headcount   integer,
  cancel_code text not null,
  created_at  timestamptz default now()
);

-- 2. 固定每週預約
create table if not exists recurring (
  id          text primary key,
  day_of_week integer not null,
  slot_id     text not null,
  room        text not null,
  type        text not null,
  name        text not null,
  department  text,
  class       text,
  purpose     text,
  headcount   integer,
  start_date  text not null,
  end_date    text,
  is_recurring boolean default true
);

-- 3. 封鎖日期
create table if not exists blocked_dates (
  date   text primary key,
  reason text
);

-- ============================================================
-- Row Level Security（允許所有人讀寫，無需登入）
-- ============================================================
alter table bookings      enable row level security;
alter table recurring     enable row level security;
alter table blocked_dates enable row level security;

create policy "public_all" on bookings
  for all using (true) with check (true);

create policy "public_all" on recurring
  for all using (true) with check (true);

create policy "public_all" on blocked_dates
  for all using (true) with check (true);
