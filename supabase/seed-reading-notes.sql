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
      '摘记：玩法要被一直琢磨；物品、过场、盈利和暂停画面都会改变玩家感受。',
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
      '摘记：文档先抓住读者兴趣，再展开类型、流程、玩法细节和能让人记住的卖点。',
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
      '摘记：把体验当作核心问题，用不同透镜反复检查目标、情绪、机制和反馈。',
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
      '摘记：设计师需要在游戏、玩家和体验之间来回验证，而不是只堆功能清单。',
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
      '摘记：先明确目标、核心机制和交互循环，再拆规则、界面、关卡与平衡。',
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
      '摘记：平衡不是把数值磨平，而是让选择、风险和回报形成可预期的张力。',
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
      '摘记：把游戏看成事件制造机；玩家记住的是故事化的变化，而不是孤立规则。',
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
      '摘记：机制可以被画成资源、行为和反馈回路；循环清楚，系统才可调。',
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
      '摘记：第一次大回报前的学习量越大，越需要小回报和循序渐进的教学。',
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
      '摘记：玩家动机并不相同；社交、成就、探索等背景会影响目标和奖励写法。',
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
      '摘记：情感设计要关注玩家如何从角色、社交线索和反馈中感到连接。',
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
