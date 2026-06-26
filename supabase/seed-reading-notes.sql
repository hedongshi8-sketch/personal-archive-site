-- Optional seed data for the public reading archive.
-- Run after the owner profile exists. The static site already includes these notes;
-- this script makes them editable through the owner account online.

with owner_profile as (
  select id
  from public.profiles
  where email = 'hedongshi8@gmail.com'
  order by created_at asc
  limit 1
),
seed_rows (
  id,
  kind,
  title,
  creator,
  quote,
  reflection,
  tags,
  published,
  created_at
) as (
  values
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a201'::uuid,
      'book'::public.reading_note_kind,
      '通关！游戏设计之道（第2版）',
      'Scott Rogers',
      '短摘：游戏玩法应该是你要一直琢磨的。',
      '',
      array['玩法', '玩家体验', '设计文档']::text[],
      true,
      '2026-06-26'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a202'::uuid,
      'book'::public.reading_note_kind,
      '通关！游戏设计之道（第2版）',
      'Scott Rogers',
      '短摘：把游戏的流程、玩法以及细节都写出来。',
      '',
      array['设计文档', '表达', '卖点']::text[],
      true,
      '2026-06-26'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a203'::uuid,
      'book'::public.reading_note_kind,
      '游戏设计艺术（第2版）',
      'Jesse Schell',
      '短摘：玩游戏的场景对游戏会产生巨大的影响。',
      '',
      array['体验设计', '设计透镜', '复盘']::text[],
      true,
      '2026-06-26'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a204'::uuid,
      'book'::public.reading_note_kind,
      '游戏设计艺术（第2版）',
      'Jesse Schell',
      '短摘：想出创意，尝试制作，不断测试和改进。',
      '',
      array['玩家体验', '系统拆解', '验证']::text[],
      true,
      '2026-06-26'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a205'::uuid,
      'book'::public.reading_note_kind,
      '游戏设计基础',
      'Ernest Adams',
      '短摘：玩家做出的决定会反映他的游戏风格。',
      '',
      array['核心循环', '规则', '系统设计']::text[],
      true,
      '2026-06-26'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a206'::uuid,
      'book'::public.reading_note_kind,
      '游戏设计基础',
      'Ernest Adams',
      '短摘：玩家非常喜欢定义自己。',
      '',
      array['平衡', '数值', '选择']::text[],
      true,
      '2026-06-26'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a207'::uuid,
      'book'::public.reading_note_kind,
      '体验引擎：游戏设计全景探秘',
      'Tynan Sylvester',
      '目录摘记：情感触发器、虚构层、心流和沉浸共同构成体验引擎。',
      '',
      array['体验引擎', '事件', '叙事反馈']::text[],
      true,
      '2026-06-26'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a208'::uuid,
      'book'::public.reading_note_kind,
      '游戏机制：高级游戏设计技术',
      'Ernest Adams / Joris Dormans',
      '短摘：你必须在长远目标和短期需求之间找到一个平衡点。',
      '',
      array['机制', '反馈循环', '经济系统']::text[],
      true,
      '2026-06-26'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a209'::uuid,
      'book'::public.reading_note_kind,
      '游戏设计入门：理解玩家思维',
      'Zack Hiwiller',
      '短摘：在游戏一开始就设计一些小回报。',
      '',
      array['玩家心理', '教学', '奖励']::text[],
      true,
      '2026-06-26'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a210'::uuid,
      'book'::public.reading_note_kind,
      '游戏设计入门：理解玩家思维',
      'Zack Hiwiller',
      '短摘：更多地赋予玩家能动性，并不一定意味着会产生更好的效果。',
      '',
      array['玩家心理', '动机', '用户分层']::text[],
      true,
      '2026-06-26'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a211'::uuid,
      'book'::public.reading_note_kind,
      '游戏情感设计：如何触动玩家的心灵',
      'Katherine Isbister',
      '短摘：玩家通过游戏角色把自己和虚拟形象联系起来。',
      '',
      array['游戏心理', '情感设计', '反馈']::text[],
      true,
      '2026-06-26'::timestamptz
    )
)
insert into public.reading_notes (
  id,
  owner_id,
  kind,
  title,
  creator,
  source_url,
  cover_url,
  quote,
  reflection,
  tags,
  published,
  created_at,
  updated_at
)
select
  seed_rows.id,
  owner_profile.id,
  seed_rows.kind,
  seed_rows.title,
  seed_rows.creator,
  null,
  null,
  seed_rows.quote,
  seed_rows.reflection,
  seed_rows.tags,
  seed_rows.published,
  seed_rows.created_at,
  now()
from seed_rows
left join owner_profile on true
on conflict (id) do update set
  kind = excluded.kind,
  title = excluded.title,
  creator = excluded.creator,
  quote = excluded.quote,
  reflection = excluded.reflection,
  tags = excluded.tags,
  published = excluded.published,
  updated_at = now();

select title, creator, array_to_string(tags, ', ') as tags
from public.reading_notes
where id between '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a201'::uuid
  and '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a211'::uuid
order by created_at desc, title asc;
