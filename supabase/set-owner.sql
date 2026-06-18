-- Run after the owner email has signed in once through magic link.
-- Replace the email value before executing.

update public.profiles
set role = 'owner'
where email = 'hedongshi8@gmail.com';

select id, email, role
from public.profiles
where email = 'hedongshi8@gmail.com';
