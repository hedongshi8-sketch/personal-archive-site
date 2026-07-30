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
      '体验引擎：游戏设计全景探秘',
      'Tynan Sylvester',
      '要点摘记：体验不是只由机制产生，目录把事件、情感触发器、虚构层、心流、沉浸放在同一条体验链上。',
      '策划用法：做活动或关卡时，把每个机制节点拆成「事件 -> 情绪 -> 反馈」，先判断它想触发什么感受，再决定数值和表现。',
      array['体验设计', '情感触发', '系统拆解']::text[],
      true,
      '2026-07-30'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a202'::uuid,
      'book'::public.reading_note_kind,
      '体验引擎：游戏设计全景探秘',
      'Tynan Sylvester',
      '要点摘记：技巧章节把深度、无障碍、弹性挑战、训练、失败处理放在一起看，难度曲线要服务情感维持。',
      '策划用法：忍三肉鸽可以把前几房作为训练和低压试错，中段用构筑分歧拉开深度，失败后保留明确复盘线索。',
      array['关卡节奏', '难度曲线', '失败反馈']::text[],
      true,
      '2026-07-30'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a203'::uuid,
      'book'::public.reading_note_kind,
      '大师谈游戏设计：创意与节奏',
      '吉泽秀雄',
      '要点摘记：核心创意拆成主题、概念、系统，并反复追问这个创意是否让概念更好玩。',
      '策划用法：写方案时先用一句话钉住主题，再列概念卖点和系统动作；不能强化核心体验的功能先降级或删除。',
      array['核心创意', '玩法表达', '方案取舍']::text[],
      true,
      '2026-07-30'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a204'::uuid,
      'book'::public.reading_note_kind,
      '大师谈游戏设计：创意与节奏',
      '吉泽秀雄',
      '要点摘记：过关和失败画面也有节奏；过关要承接成就感，失败要推动再尝试，时长和信息量都不能拖。',
      '策划用法：Demo 里结算页不只展示分数，还要给下一局目标、构筑问题和可调整方向，让玩家愿意再跑一局。',
      array['关卡节奏', '结算反馈', '再挑战']::text[],
      true,
      '2026-07-30'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a205'::uuid,
      'book'::public.reading_note_kind,
      '平衡掌控者：游戏数值战斗设计',
      '似水无痕',
      '要点摘记：数值策划不是解数学题，而是用规则维护战斗、经济、奖励投放的整体顺畅与平衡。',
      '策划用法：配表不能只填强度，还要说明产出、消耗、成长速度和玩家感受之间的约束关系。',
      array['数值设计', '经济循环', '奖励投放']::text[],
      true,
      '2026-07-30'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a206'::uuid,
      'book'::public.reading_note_kind,
      '平衡掌控者：游戏数值战斗设计',
      '似水无痕',
      '要点摘记：Excel、公式、技能、装备、随机、战斗数据结构和模拟验证，是从设计层走到实现层的一条链路。',
      '策划用法：作品集里的配置表要让 HR 看出字段为什么存在、程序怎么读、QA 怎么验，而不是只摆一张表。',
      array['Excel', '战斗公式', '配置落地']::text[],
      true,
      '2026-07-30'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a207'::uuid,
      'book'::public.reading_note_kind,
      '凭什么让你充值：一个游戏策划的自我修养',
      '氪老师',
      '要点摘记：先制造「想要」，再讲清用途、价值参照和获取路径，装备或资源需求才会从看见变成追求。',
      '策划用法：活动奖励页要同时回答三件事：它能解决什么问题、比当前拥有的强在哪、玩家下一步去哪拿。',
      array['玩家需求', '奖励展示', '商业化']::text[],
      true,
      '2026-07-30'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a208'::uuid,
      'book'::public.reading_note_kind,
      '凭什么让你充值：一个游戏策划的自我修养',
      '氪老师',
      '要点摘记：N+1、套装属性、质变成长和保值问题，本质是在延长需求，而不是简单把数值继续抬高。',
      '策划用法：做肉鸽奖励时要避免单一最优解，用套装、流派关键件和局内质变制造多条追求线。',
      array['需求延长', '构筑成长', '价值保值']::text[],
      true,
      '2026-07-30'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a209'::uuid,
      'book'::public.reading_note_kind,
      '游戏改变世界：游戏化如何让现实变得更美好',
      'Jane McGonigal',
      '要点摘记：好游戏给玩家明确任务、主动选择的挑战和及时反馈，所以辛苦也会变成愿意投入的工作。',
      '策划用法：任务设计要让目标、当前进度、下一步反馈同时可见，玩家才会把重复行为理解成有效推进。',
      array['任务设计', '即时反馈', '心流']::text[],
      true,
      '2026-07-30'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a210'::uuid,
      'book'::public.reading_note_kind,
      '游戏改变世界：游戏化如何让现实变得更美好',
      'Jane McGonigal',
      '要点摘记：失败如果被设计得有趣，玩家会继续尝试；成功的希望本身就能成为驱动力。',
      '策划用法：失败页应给出可理解的原因、可执行的调整和下一局更接近成功的信号，别只做惩罚。',
      array['失败反馈', '再挑战', '玩家动机']::text[],
      true,
      '2026-07-30'::timestamptz
    ),
    (
      '0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a211'::uuid,
      'book'::public.reading_note_kind,
      'Unity游戏开发（原书第3版）',
      'Mike Geig',
      '要点摘记：Unity 学习路径强调编辑器视图、场景导航、Game 视图测试和案例工程，原型要能运行而不只停在文档。',
      '策划用法：忍三肉鸽 Demo 放下载工程比放静态原型图更有说服力，HR 至少能看到可运行资产、脚本和配置结构。',
      array['Unity', '原型验证', 'Demo工程']::text[],
      true,
      '2026-07-30'::timestamptz
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
