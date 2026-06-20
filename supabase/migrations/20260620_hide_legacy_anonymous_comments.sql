-- Hide legacy anonymous test comments that were created before profile-bound comments were enforced.
-- This is rerunnable and only affects approved rows without a real authenticated author.

update public.public_comments
set approved = false
where approved = true
  and author_id is null;
