-- Hide internal delivery notes and unfinished personal-info PDFs from the public portfolio.
-- These records are useful locally while assembling an application packet, but they should
-- not appear in the HR-facing website.

update public.portfolio_items
set
  published = false,
  featured = false,
  updated_at = now()
where
  id in (
    '70cf8c1d-3fae-0389-4fac-f458ee4a1247',
    'd9caa4e3-bda6-4d1b-9168-89acc6b9a584'
  )
  or title in ('简历 + 作品集合并版', '系统策划投递说明')
  or public_url like '%待替换个人信息%'
  or public_url like '%投递说明_只看这个%';
