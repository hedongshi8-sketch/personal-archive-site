# 策划档案作品集上线规划

## 目标

把本地作品集资产导入网站的「我的策划档案」独立界面，让访客可以随时在线查看公开作品、下载文档、打开可交互原型；站主登录后才可以新增、编辑、隐藏作品和审核评论。

## 已盘点到的本地资产

### E:\工作相关

重点导入：

- `野蛮人大作战2-菇霸争夺战.xlsx`
- `野蛮人大作战2-菇霸争夺战相关表格.xlsx`
- `野蛮人大作战2-菇霸争夺战部分美术需求.xlsx`
- `野蛮人大作战2-菇霸争夺战.pdf`
- `野蛮人大作战2-菇霸争夺战部分美术需求.pdf`
- `游戏小镇方案V_0.2完善版(1).docx`
- `游戏小镇-美术需求文档 V1.0.xlsx`
- `个人简历v2.0.pdf`

注意：用户提到“两个野蛮人大作战的 Excel”，实际扫描到 3 个野蛮人大作战 Excel。实施时默认全部导入，除非手动排除其中一个。

### E:\策划文档

重点导入：

- `系统策划实习生投递包\最终投递版\00_简历+作品集_系统策划实习生_最终合并版_待替换个人信息.pdf`
- `系统策划实习生投递包\最终投递版\01_作品集_系统策划实习生_最终投递版.pdf`
- `系统策划实习生投递包\最终投递版\系统策划拆解案_战意_骑砍2_全面战争.xlsx`
- `系统策划实习生投递包\最终投递版\03_3D战争界面HTML原型_面试补充.html`
- `resume_game_visuals\game_experience_overview.png`
- `resume_game_visuals\game_top_hours.png`
- `resume_system_planner_assets\game_category_donut.png`
- `resume_system_planner_assets\game_hours_top10.png`
- `系统策划实习生投递包\README_投递使用说明.md`
- `系统策划实习生投递包\最终投递版\投递说明_只看这个.txt`

### E:\游戏小镇

用户提到 `E:\游戏小镇作品集`，但该路径当前不存在；实际存在的是 `E:\游戏小镇`。这个目录本身已经接近一个可交互网页原型：

- `index.html`
- `app.js`
- `styles.css`
- `README-原型说明.md`
- `游戏小镇方案V_0.2完善版(1).docx`
- `游戏小镇方案补全文档.md`
- `游戏小镇美术需求文档.html`
- `visual-concept.png`
- `doc-images\...` 共 48 张图片
- `相关表格\...` 共 12 个 Excel 表，包括 NPC、物品、任务、建筑、怪物、装备、事件等
- `游戏小镇.rar`

实施时按 `E:\游戏小镇` 作为游戏小镇作品集源目录处理。

## 资产导入规则

开发阶段先复制到仓库的公开目录，确保无需后端也能预览：

```text
public/portfolio-assets/
  barbarq/
    docs/
    sheets/
  system-planner/
    docs/
    sheets/
    prototypes/
    images/
  game-town/
    prototype/
    docs/
    sheets/
    images/
    archive/
```

上线接 Supabase 后，迁移到 Storage bucket：

```text
portfolio-public/
  barbarq/...
  system-planner/...
  game-town/...
portfolio-private/
  drafts/...
```

公开可访问文件放 `portfolio-public`，草稿或未筛选文件放 `portfolio-private`。

## 前端信息架构

「我的策划档案」保持一个整屏独立界面，内部做作品库工作台：

- 顶部：搜索、筛选、排序、站主编辑入口
- 左侧或顶部标签：全部、野蛮人大作战、游戏小镇、系统策划、可交互原型、PDF、Excel、图片
- 主区域：作品卡片网格
- 右侧详情面板：选中作品后的介绍、文件清单、预览区、下载按钮

作品卡片字段：

- 标题
- 项目：野蛮人大作战 / 游戏小镇 / 系统策划
- 类型：PDF / Excel / HTML 原型 / 图片 / DOCX / 压缩包
- 标签：系统拆解、玩法模式、数值表、美术需求、原型、简历作品集等
- 更新时间
- 摘要
- 操作：预览、打开原型、下载、复制链接

## 文件预览策略

- PDF：`iframe` 站内预览，保留下载入口。
- HTML 原型：复制完整目录后用 `iframe` 嵌入，可交互原型要保留 JS/CSS/图片相对路径。
- Excel：第一阶段提供下载和摘要卡；第二阶段引入 SheetJS，把每个 sheet 渲染成只读表格预览。
- DOCX：先下载；后续建议转 PDF 再预览。
- 图片：直接作为缩略图、详情图或作品证据图。
- RAR/ZIP：下载入口，不在站内解压执行。

## 数据模型

前端先新增 `src/data/portfolioItems.ts`：

```ts
export type PortfolioItem = {
  id: string;
  title: string;
  project: "barbarq" | "game-town" | "system-planner";
  kind: "pdf" | "excel" | "docx" | "html-prototype" | "image" | "archive" | "markdown" | "text";
  summary: string;
  tags: string[];
  publicUrl: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  sourcePath: string;
  updatedAt: string;
  featured?: boolean;
};
```

接 Supabase 后用表结构承载：

- `portfolio_projects`
- `portfolio_items`
- `portfolio_files`
- `portfolio_tags`
- `public_comments`
- `owner_posts`
- `profiles`

必要索引：

- `portfolio_items(project_id)`
- `portfolio_items(kind)`
- `portfolio_items(published, updated_at desc)`
- `portfolio_files(item_id)`
- `public_comments(approved, created_at desc)`

## 权限方案

使用 Supabase Auth + Postgres RLS：

- 匿名访客：
  - 可以读取 `published = true` 的作品
  - 可以读取公开文件 URL
  - 可以提交评论
- 站主：
  - 可以创建、编辑、删除、隐藏作品
  - 可以上传文件
  - 可以管理私密帖
  - 可以审核或删除评论

RLS 原则：

- 所有 `select` 公共内容必须带 `published = true` 或 `approved = true`。
- 所有 `insert/update/delete` 管理动作必须检查 `profiles.role = 'owner'`。
- Storage public bucket 只放最终公开文件，private bucket 用 signed URL 给站主后台预览。

## 部署方案

推荐路线：

1. Vercel 或 Cloudflare Pages 托管 React/Vite 前端。
2. Supabase 托管 Auth、Postgres、Storage、RLS。
3. GitHub 仓库作为部署源，推送后自动部署。
4. 环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. 站主首次登录后，在 `profiles` 表把自己的账号设为 `owner`。

如果暂时不接 Supabase，也可以先把 `dist` 部署成静态站，所有作品公开可看，但不能真正做到“只有我能在线编辑”。真正的在线编辑权限必须有后端身份认证和数据库权限。

## 执行顺序

1. 复制公开作品资产到 `public/portfolio-assets`。
2. 新增 `src/data/portfolioItems.ts`，为每个作品建立元数据。
3. 重做 `DocsSection`：作品库工作台、筛选、详情面板、预览 iframe。
4. 给 `E:\游戏小镇` 原型建立 iframe 嵌入入口。
5. 给 `E:\策划文档` 的 HTML 原型建立 iframe 嵌入入口。
6. 跑 `npm run typecheck`、`npm run lint`、`npm run build`。
7. 浏览器验证：PDF 可预览、HTML 原型可交互、Excel 可下载、单屏布局不破。
8. 接 Supabase schema 和 Storage。
9. 增加站主登录与编辑 UI。
10. 部署到 Vercel/Cloudflare Pages。

## 需要人工确认

- 野蛮人大作战 Excel 是否 3 个全部公开，还是只选其中 2 个。
- `E:\游戏小镇` 是否就是用户说的 `E:\游戏小镇作品集`。
- 简历 PDF 是否适合公开放到作品站。
- 是否允许公开下载 Excel 原表，还是只展示只读预览。
- 使用 Vercel、Cloudflare Pages、Netlify 还是自有服务器。

## 当前执行状态

已完成：

- 真实作品资产已复制到 `public/portfolio-assets`，构建后 `dist/portfolio-assets` 保持 87 个文件。
- `DocsSection` 已改为策划档案工作台，支持搜索、筛选、详情、PDF/HTML/image 预览和下载。
- `E:\游戏小镇` 原型与系统策划 HTML 原型已可通过 iframe 预览。
- `vercel.json`、`public/_headers`、`public/_redirects` 已配置静态部署。
- `.github/workflows/ci.yml` 与 `.github/workflows/vercel-deploy.yml` 已配置，仓库推到 GitHub 并补齐 secrets 后可自动构建/部署。
- `.github/workflows/github-pages.yml` 已配置，仓库推到 GitHub 并开启 Pages 的 GitHub Actions source 后，可先发布公开静态作品集。
- `docs/deployment-runbook.md` 已整理 Supabase、Vercel、GitHub Actions、owner 初始化步骤。
- `@supabase/supabase-js` 已接入，`src/lib/backendContract.ts` 会在存在 Supabase 环境变量时切到真实后端。
- 策划档案页已具备 owner-only 管理面板，站主可以选择项目/类型、上传文件、填写标签并登记新作品。
- 私密发帖区已具备站主邮箱 magic link 登录入口和 owner 权限门禁；无环境变量时保持本地预览。
- 留言墙已具备昵称、留言发布、点赞后端接口；Supabase 模式下走 `public_comments` 和 `increment_comment_likes`。
- `supabase/schema.sql` 已包含 profiles 自动创建、owner RLS、公开评论、作品集表和资源表。
- `npm run typecheck`、`npm run lint`、`npm run build` 已通过。
- 本地 Git 仓库已初始化在 `main` 分支，并已提交作品集、发布审计、dist 冒烟检查和 CI 发布门禁。
- `npm run smoke:dist` 已覆盖首页、静态部署配置、游戏小镇原型、系统策划原型、野蛮人大作战 Excel 和作品集 PDF 的构建后可访问性。
- `npm run audit:release` 已检查资产数量、Supabase RLS、种子数量、CI/部署门禁、密钥模式和 Git 工作区状态。

尚需外部授权/人工操作：

- 创建 Supabase 项目，在 SQL Editor 执行 `supabase/schema.sql`。
- 执行 `supabase/seed-portfolio.sql`，把当前 19 个公开作品写入 `portfolio_items`。
- 创建公开 Storage bucket：`portfolio-public`。
- 在部署平台配置 `.env.example` 中的环境变量。
- 站主首次 magic link 登录后，将自己的 `profiles.role` 更新为 `owner`。
- 创建或连接 GitHub 远程仓库，执行 `git remote add origin <repo-url>` 并推送 `main`。
- 如果先走 GitHub Pages，在仓库 Settings -> Pages 中选择 GitHub Actions 作为 Source。
- 登录 Vercel/Cloudflare/GitHub 后发布到公网；当前机器未检测到 Vercel/Cloudflare/GitHub/Netlify CLI。
