-- Customer Feedback + Visitor Counter
-- Production-safe RLS structure for the existing Digital Service project.

create table if not exists public.customer_feedback (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    rating integer not null check (rating between 1 and 5),
    feedback text not null
        check (char_length(trim(feedback)) between 10 and 1000),
    status text not null default 'pending'
        check (status in ('pending', 'approved', 'rejected')),
    created_at timestamptz not null default now(),
    approved_at timestamptz
);

create index if not exists customer_feedback_status_created_idx
    on public.customer_feedback (status, created_at desc);

create table if not exists public.site_statistics (
    id integer primary key check (id = 1),
    visitor_count bigint not null default 0
        check (visitor_count >= 0),
    updated_at timestamptz not null default now()
);

insert into public.site_statistics (id, visitor_count)
values (1, 0)
on conflict (id) do nothing;

alter table public.customer_feedback enable row level security;
alter table public.site_statistics enable row level security;

drop policy if exists "Public can submit feedback"
    on public.customer_feedback;

create policy "Public can submit feedback"
on public.customer_feedback
for insert
to anon, authenticated
with check (
    status = 'pending'
    and approved_at is null
);

drop policy if exists "Public can view approved feedback"
    on public.customer_feedback;

create policy "Public can view approved feedback"
on public.customer_feedback
for select
to anon, authenticated
using (
    status = 'approved'
);

drop policy if exists "Admin can view all feedback"
    on public.customer_feedback;

create policy "Admin can view all feedback"
on public.customer_feedback
for select
to authenticated
using (
    auth.uid() = 'e3c0a5b6-7bb4-4efa-b7c4-64b37cc84b08'::uuid
);

drop policy if exists "Admin can update feedback"
    on public.customer_feedback;

create policy "Admin can update feedback"
on public.customer_feedback
for update
to authenticated
using (
    auth.uid() = 'e3c0a5b6-7bb4-4efa-b7c4-64b37cc84b08'::uuid
)
with check (
    auth.uid() = 'e3c0a5b6-7bb4-4efa-b7c4-64b37cc84b08'::uuid
);

drop policy if exists "Public can read visitor count"
    on public.site_statistics;

create policy "Public can read visitor count"
on public.site_statistics
for select
to anon, authenticated
using (
    id = 1
);
