-- Seed current public portfolio metadata.
-- Safe to rerun after supabase/schema.sql.

insert into public.portfolio_projects (id, title, summary, sort_order, published)
values
  ('barbarq', '野蛮人大作战', '野蛮人大作战相关策划案、配置表和美术需求。', 10, true),
  ('system-planner', '系统策划', '系统策划作品集、拆解案、原型和可视化材料。', 20, true),
  ('game-town', '游戏小镇', '游戏小镇原型、方案、美术需求、配置表和归档资源。', 30, true)
on conflict (id) do update set
  title = excluded.title,
  summary = excluded.summary,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = now();

insert into public.portfolio_items (
  id, project_id, title, kind, summary, tags, public_url, preview_url, thumbnail_url, source_path, featured, published, sort_order, updated_at
)
values
  ('88fa761f-706f-c19a-a390-d957a007f3d7', 'barbarq', '野蛮人大作战2 - 菇霸争夺战策划案', 'pdf', '围绕菇霸争夺战玩法模式整理的规则、目标、节奏与核心体验说明。', array['玩法模式', '战斗规则', '活动策划']::text[], '/portfolio-assets/barbarq/docs/野蛮人大作战2-菇霸争夺战.pdf', '/portfolio-assets/barbarq/docs/野蛮人大作战2-菇霸争夺战.pdf', null, 'E:\工作相关\野蛮人大作战2-菇霸争夺战.pdf', true, true, 10, '2026-04-07'::timestamptz),
  ('12b244c6-6f54-1701-ac9b-d2496405d33e', 'barbarq', '菇霸争夺战配置表', 'excel', '玩法配置与数据拆分表，适合展示系统拆解、表结构和可落地配置能力。', array['Excel', '配置表', '数值拆解']::text[], '/portfolio-assets/barbarq/sheets/野蛮人大作战2-菇霸争夺战.xlsx', '/portfolio-previews/barbarq-main-sheet.json', null, 'E:\工作相关\野蛮人大作战2-菇霸争夺战.xlsx', true, true, 11, '2026-04-13'::timestamptz),
  ('0147fb6e-5635-1e38-8923-654b00d21cd9', 'barbarq', '菇霸争夺战相关表格', 'excel', '补充表格，用于承接模式规则、字段整理与外围配置。', array['Excel', '补充表', '字段整理']::text[], '/portfolio-assets/barbarq/sheets/野蛮人大作战2-菇霸争夺战相关表格.xlsx', '/portfolio-previews/barbarq-related-sheet.json', null, 'E:\工作相关\野蛮人大作战2-菇霸争夺战相关表格.xlsx', false, true, 12, '2026-04-01'::timestamptz),
  ('2c795c34-3941-45cf-a773-89e2bf84d3b5', 'barbarq', '菇霸争夺战部分美术需求', 'pdf', '玩法设计转化到美术需求的说明，展示需求拆分、表达和协作交付。', array['美术需求', '协作文档', 'PDF']::text[], '/portfolio-assets/barbarq/docs/野蛮人大作战2-菇霸争夺战部分美术需求.pdf', '/portfolio-assets/barbarq/docs/野蛮人大作战2-菇霸争夺战部分美术需求.pdf', null, 'E:\工作相关\野蛮人大作战2-菇霸争夺战部分美术需求.pdf', false, true, 13, '2026-04-07'::timestamptz),
  ('9e9741c7-ed1e-299a-9138-72025306d892', 'barbarq', '菇霸争夺战美术需求表', 'excel', '与美术需求 PDF 对应的表格版本，便于生产跟踪和字段管理。', array['Excel', '美术需求', '生产跟踪']::text[], '/portfolio-assets/barbarq/sheets/野蛮人大作战2-菇霸争夺战部分美术需求.xlsx', '/portfolio-previews/barbarq-art-sheet.json', null, 'E:\工作相关\野蛮人大作战2-菇霸争夺战部分美术需求.xlsx', false, true, 14, '2026-04-01'::timestamptz),
  ('f4172d5f-4908-b44a-7663-4260bf561f41', 'system-planner', '系统策划实习生作品集', 'pdf', '最终投递版作品集，集中展示系统拆解、文档表达和策划分析能力。', array['作品集', '系统策划', 'PDF']::text[], '/portfolio-assets/system-planner/docs/01_作品集_系统策划实习生_最终投递版.pdf', '/portfolio-assets/system-planner/docs/01_作品集_系统策划实习生_最终投递版.pdf', null, 'E:\策划文档\系统策划实习生投递包\最终投递版\01_作品集_系统策划实习生_最终投递版.pdf', true, true, 15, '2026-06-16'::timestamptz),
  ('70cf8c1d-3fae-0389-4fac-f458ee4a1247', 'system-planner', '简历 + 作品集合并版', 'pdf', '投递用合并版本，包含简历与作品集主内容。', array['投递包', '简历', '作品集']::text[], '/portfolio-assets/system-planner/docs/00_简历+作品集_系统策划实习生_最终合并版_待替换个人信息.pdf', '/portfolio-assets/system-planner/docs/00_简历+作品集_系统策划实习生_最终合并版_待替换个人信息.pdf', null, 'E:\策划文档\系统策划实习生投递包\最终投递版\00_简历+作品集_系统策划实习生_最终合并版_待替换个人信息.pdf', false, true, 16, '2026-06-16'::timestamptz),
  ('cccf7317-ba87-358a-bf5c-8d54aa6b7004', 'system-planner', '战意 / 骑砍2 / 全面战争系统拆解案', 'excel', '横向拆解多个战争题材游戏的系统结构、循环与可借鉴设计点。', array['系统拆解', 'Excel', '战争题材']::text[], '/portfolio-assets/system-planner/sheets/系统策划拆解案_战意_骑砍2_全面战争.xlsx', '/portfolio-previews/system-planner-war-sheet.json', null, 'E:\策划文档\系统策划实习生投递包\最终投递版\系统策划拆解案_战意_骑砍2_全面战争.xlsx', true, true, 17, '2026-06-16'::timestamptz),
  ('38dd2607-15fe-5b89-5fc3-b5777261a23c', 'system-planner', '3D战争界面 HTML 交互原型', 'html-prototype', '可直接交互的战意赛季经济闭环界面原型，用于面试补充展示。', array['可交互原型', 'HTML', '界面设计']::text[], '/portfolio-assets/system-planner/prototypes/war-ui/index.html', '/portfolio-assets/system-planner/prototypes/war-ui/index.html', null, 'E:\策划文档\系统策划实习生投递包\最终投递版\03_3D战争界面HTML原型_面试补充.html', true, true, 18, '2026-06-16'::timestamptz),
  ('30146a2b-76b7-da2a-cea9-b4f2bc1951e4', 'system-planner', '游戏经历可视化总览', 'image', '将游戏经历和品类覆盖整理成可视化图，适合作为作品集辅助材料。', array['可视化', '游戏经历', '图片']::text[], '/portfolio-assets/system-planner/images/game_experience_overview.png', '/portfolio-assets/system-planner/images/game_experience_overview.png', '/portfolio-assets/system-planner/images/game_experience_overview.png', 'E:\策划文档\resume_game_visuals\game_experience_overview.png', false, true, 19, '2026-06-18'::timestamptz),
  ('1dcd6201-3da9-994b-6490-3aeec3a98b33', 'game-town', '游戏小镇微信小程序交互原型', 'html-prototype', '登录、分身创建、小镇、地图、冒险、背包、角色、招募、战斗等核心链路均可点击。', array['可交互原型', '微信小程序', '模拟经营']::text[], '/portfolio-assets/game-town/prototype/index.html', '/portfolio-assets/game-town/prototype/index.html', '/portfolio-assets/game-town/images/visual-concept.png', 'E:\游戏小镇\index.html', true, true, 20, '2026-06-10'::timestamptz),
  ('7224c209-3fdd-9e72-fb05-76ec9aee59b2', 'game-town', '游戏小镇方案完善版', 'docx', '完整方案文档，包含玩法设定、系统结构、美术需求和开发说明。', array['方案文档', '模拟经营', 'DOCX']::text[], '/portfolio-assets/game-town/docs/游戏小镇方案V_0.2完善版(1).docx', '/portfolio-previews/game-town-design-doc.json', null, 'E:\游戏小镇\游戏小镇方案V_0.2完善版(1).docx', false, true, 21, '2026-06-10'::timestamptz),
  ('4b93af34-9841-4420-a0c0-e88c930176d1', 'game-town', '游戏小镇方案补全文档', 'markdown', '补充玩法、地图、怪物、村落和系统配置说明，适合快速阅读设计思路。', array['方案补充', 'Markdown', '系统设计']::text[], '/portfolio-assets/game-town/docs/游戏小镇方案补全文档.md', '/portfolio-previews/game-town-expanded-design.json', null, 'E:\游戏小镇\游戏小镇方案补全文档.md', false, true, 22, '2026-06-10'::timestamptz),
  ('c104b887-6456-44cb-a805-601d9149f9ea', 'game-town', '游戏小镇原型说明', 'markdown', '说明原型入口、可交互链路和配套表格，方便 HR 先理解项目结构。', array['原型说明', 'Markdown', '阅读指南']::text[], '/portfolio-assets/game-town/docs/README-原型说明.md', '/portfolio-previews/game-town-prototype-readme.json', null, 'E:\游戏小镇\README-原型说明.md', false, true, 23, '2026-06-10'::timestamptz),
  ('31e1a52d-d6b9-4247-d3c8-e87882b376cd', 'game-town', '游戏小镇美术需求文档', 'html-prototype', '美术需求 HTML 文档，可在站内直接打开阅读。', array['美术需求', 'HTML', '生产协作']::text[], '/portfolio-assets/game-town/docs/游戏小镇美术需求文档.html', '/portfolio-assets/game-town/docs/游戏小镇美术需求文档.html', null, 'E:\游戏小镇\游戏小镇美术需求文档.html', false, true, 24, '2026-06-10'::timestamptz),
  ('76bcbb6e-a5dc-6860-9afa-116cffd763ed', 'game-town', '游戏小镇系统配置表合集', 'excel', 'NPC、物品、任务、土地、地域、事件、建筑、怪物、装备等 12 个配置表。', array['Excel', '配置表', '系统设计']::text[], '/portfolio-assets/game-town/sheets/NPC表.xlsx', '/portfolio-previews/game-town-config-sheets.json', null, 'E:\游戏小镇\相关表格', true, true, 25, '2026-06-10'::timestamptz),
  ('d9caa4e3-bda6-4d1b-9168-89acc6b9a584', 'system-planner', '系统策划投递说明', 'text', '投递包内的阅读顺序和重点提示，适合作为作品集入口说明。', array['投递说明', '阅读顺序', '文本']::text[], '/portfolio-assets/system-planner/notes/投递说明_只看这个.txt', '/portfolio-previews/system-planner-submission-note.json', null, 'E:\策划文档\系统策划实习生投递包\投递说明_只看这个.txt', false, true, 26, '2026-06-16'::timestamptz),
  ('8524dbae-2398-ff06-801c-93bb4ff0c50e', 'game-town', '游戏小镇视觉概念图', 'image', '作为游戏小镇作品的视觉入口和缩略展示图。', array['视觉概念', '图片', '展示图']::text[], '/portfolio-assets/game-town/images/visual-concept.png', '/portfolio-assets/game-town/images/visual-concept.png', '/portfolio-assets/game-town/images/visual-concept.png', 'E:\游戏小镇\visual-concept.png', false, true, 27, '2026-06-09'::timestamptz),
  ('d490053d-eda9-b83f-6467-ccc978710b24', 'game-town', '游戏小镇完整打包文件', 'archive', '完整工程与作品素材打包，提供下载留档。', array['压缩包', '完整归档', '下载']::text[], '/portfolio-assets/game-town/archive/游戏小镇.rar', null, null, 'E:\游戏小镇\游戏小镇.rar', false, true, 28, '2026-06-11'::timestamptz)
on conflict (id) do update set
  project_id = excluded.project_id,
  title = excluded.title,
  kind = excluded.kind,
  summary = excluded.summary,
  tags = excluded.tags,
  public_url = excluded.public_url,
  preview_url = excluded.preview_url,
  thumbnail_url = excluded.thumbnail_url,
  source_path = excluded.source_path,
  featured = excluded.featured,
  published = excluded.published,
  sort_order = excluded.sort_order,
  updated_at = excluded.updated_at;
