create table if not exists public.questionnaire_submissions (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    user_id uuid references auth.users(id),
    email text,
    payload jsonb not null,
    
    constraint questionnaire_submissions_pkey primary key (id)
);

alter table public.questionnaire_submissions enable row level security;

-- Allow anyone to insert (public or authenticated)
create policy "Anyone can insert questionnaire_submissions"
    on public.questionnaire_submissions
    for insert
    to public, anon, authenticated
    with check (true);

-- Only service_role can select/update/delete typically, 
-- but users might want to see their own? For now, keep it simple: admin only via dashboard or edge function.
create policy "Service role has full access"
    on public.questionnaire_submissions
    using ( auth.role() = 'service_role' )
    with check ( auth.role() = 'service_role' );
