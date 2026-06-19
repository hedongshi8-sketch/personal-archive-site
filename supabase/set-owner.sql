-- Run after the owner email has registered or signed in once with password auth.
-- Replace the email value before executing.

update public.profiles
set role = 'owner'
where email = 'hedongshi8@gmail.com';

select id, email, role
from public.profiles
where email = 'hedongshi8@gmail.com';
