-- Run this once in the Supabase SQL Editor (Project > SQL Editor) after
-- `npx prisma migrate dev` has created the `profiles` table.

-- 1. Storage bucket for customer photo uploads.
insert into storage.buckets (id, name, public)
values ('customer-uploads', 'customer-uploads', true)
on conflict (id) do nothing;

-- Anyone (including guests) can upload — the customizer runs before login.
create policy "Public can upload customer photos"
on storage.objects for insert
to public
with check (bucket_id = 'customer-uploads');

-- Anyone can read (needed so <Image> and the admin ZIP export can fetch
-- the file by its public URL).
create policy "Public can read customer photos"
on storage.objects for select
to public
using (bucket_id = 'customer-uploads');

-- 2. Keep public.profiles in sync with auth.users automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'CUSTOMER')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Promote your own account to admin after you sign up once, e.g.:
-- update public.profiles set role = 'ADMIN' where email = 'you@example.com';
