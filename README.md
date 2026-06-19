# 我的策划档案

个人创作网站：策划文档作品集、游戏 Demo、音乐收藏、灵感图库、站主私密发帖区和公开留言墙。

## 技术栈

- React 19 + TypeScript + Vite
- lucide-react 图标系统
- PWA 基础：manifest + service worker
- 静态作品集资产：`public/portfolio-assets`
- 站内作品预览：`public/portfolio-previews` 预生成 Excel / DOCX / Markdown / 文本阅读数据
- Supabase-ready 后端：Auth、Postgres RLS、Storage、公开评论、站主私密发帖、作品/音乐/图片/书摘上传和站点设置

## 本地运行

```bash
npm install
npm run dev
```

开发地址默认是 `http://localhost:5173/`。

## 构建检查

```bash
npm run lint
npm run typecheck
npm run build
npm run smoke:dist
npm run audit:release
npm run deploy:readiness
npm run pack:static
npm run verify:remote
npm run verify:comments
npm run verify:comments:remote
npm run verify:supabase
```

构建产物在 `dist`。`vercel.json`、`public/_redirects`、`public/_headers` 已经为 Vercel / Cloudflare Pages 的 SPA 路由和静态资源缓存做好准备。
`smoke:dist` 会在本地临时托管 `dist`，确认首页、原型 iframe、PDF、Excel 原文件和站内预览 JSON 等关键公开路径可访问。
`deploy:readiness` 会检查 Git 远程、部署 CLI 和本地 Supabase 环境变量状态，帮助确认还差哪些外部授权。
`pack:static` 会生成 `release/personal-archive-site-static.zip` 和 manifest，方便没有 CLI 时手动上传静态站点。
`verify:remote` 会检查 GitHub Pages 默认公网 URL，确认首页、原型、PDF、Excel 和站内预览数据可访问。
`verify:comments` / `verify:comments:remote` 会检查 GitHub Issues 评论桥是否进入本地构建和线上 bundle。
`verify:supabase` 会在配置 Supabase 环境变量后检查公开作品、访客评论验证、点赞 RPC、音乐/图库/书摘公开读取和 owner-only RLS。

## 作品集资产

当前真实作品已经复制到 `public/portfolio-assets`，构建后会进入 `dist/portfolio-assets`：

- `barbarq`：野蛮人大作战 PDF 和 Excel
- `system-planner`：系统策划作品集 PDF、Excel、HTML 原型和图片
- `game-town`：游戏小镇 HTML 原型、文档、图片、配置表和归档包

Excel、DOCX、Markdown 和文本类材料会额外生成到 `public/portfolio-previews`，档案页优先展示站内只读预览，下载入口作为备用。

## 启用站主权限

前端已经接入 `src/lib/backendContract.ts`：

- 没有 Supabase 环境变量时：自动使用本地预览模式，方便开发和静态展示。
- 配置 Supabase 后：私密发帖、公开评论、点赞、资源上传接口切换到 Supabase。
- 策划档案页包含 owner-only 管理面板；owner 可以上传作品集文件并登记新作品条目。
- 音乐页包含 owner-only 上传入口；owner 可以上传音频、封面，并设置全站背景音乐。
- 图库页包含 owner-only 上传入口；owner 可以上传图片、分类整理，并设置首页封面。
- 书摘心得页包含 owner-only 发布入口；owner 可以上传封面，登记策划书籍和视频心得。
- 留言墙包含轻量防刷：算术验证、隐藏蜜罐和最短提交耗时；更强防护可后续接 Edge Function / Turnstile。
- 真实权限由 `supabase/schema.sql` 的 Auth + RLS + profile role 控制。

部署前复制 `.env.example`，在本地或部署平台填入：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_SUPABASE_PUBLIC_BUCKET=portfolio-public
VITE_GITHUB_COMMENTS_REPO=hedongshi8-sketch/personal-archive-site
```

Supabase 侧步骤：

1. 新建 Supabase 项目。
2. 在 SQL Editor 执行 `supabase/schema.sql`。
3. 再执行 `supabase/seed-portfolio.sql`，把当前 19 个公开作品写入 `portfolio_items`。
4. `schema.sql` 会创建公开 bucket：`portfolio-public`；如果 Supabase 控制台已存在同名 bucket，可直接复用。
5. 用网站私密区发送 magic link 到你的站主邮箱并完成首次登录。
6. 在 Supabase SQL Editor 把你的账号设成 owner：

```sql
update public.profiles
set role = 'owner'
where email = '你的邮箱';
```

也可以把 `supabase/set-owner.sql` 中的邮箱确认无误后直接执行。

初始化完成后运行：

```bash
set VITE_SUPABASE_URL=https://your-project.supabase.co
set VITE_SUPABASE_ANON_KEY=your-anon-public-key
set VITE_SUPABASE_PUBLIC_BUCKET=portfolio-public
npm run verify:supabase
```

这样外部访客可以浏览作品集、音乐、图库、书摘和评论，只有 `profiles.role = 'owner'` 的账号能写入私密发帖、上传资源和修改封面/背景音乐。

如果暂时还没接 Supabase，留言墙会额外显示 GitHub Issues 评论面板。到 <https://github.com/apps/utterances> 安装 Utterances App，并授权 `personal-archive-site` 仓库后，访客可以用 GitHub 账号留下公网持久评论。

## 部署

完整上线流程见 [docs/deployment-runbook.md](docs/deployment-runbook.md)。
发布前后逐项验收见 [docs/release-checklist.md](docs/release-checklist.md)。

### GitHub Pages

- 推送 `main` 后，`.github/workflows/github-pages.yml` 会构建并发布 `dist`。
- 这条路线不需要 Vercel token，适合先把公开作品集放到公网。
- 仓库 Settings -> Pages 的 Source 选择 GitHub Actions。
- `public/.nojekyll` 和 `public/404.html` 已准备好，兼容 GitHub Pages 静态托管与直接路径访问。
- Supabase 环境变量未配置时，站点会保持本地预览模式；公开作品集可浏览，本地上传只存在当前浏览器预览里，不会写入线上数据库。
- Supabase 未启用前，留言墙可以通过 Utterances + GitHub Issues 承接公网评论。

### Vercel

- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: 填 `.env.example` 中的三个 Supabase 变量
- 配置文件：`vercel.json`
- GitHub Actions 自动部署：`.github/workflows/vercel-deploy.yml`

### Cloudflare Pages

- Build Command: `npm run build`
- Build Output Directory: `dist`
- Environment Variables: 填 `.env.example` 中的三个 Supabase 变量
- `_headers` 和 `_redirects` 会随 Vite 构建复制到 `dist`

### 手动上传静态包

如果暂时不走 GitHub 自动部署，可以先运行：

```bash
npm run build
npm run smoke:dist
npm run pack:static
```

然后把 `release/personal-archive-site-static.zip` 上传到支持静态站点导入的平台。这个方式可以公开浏览作品集，但在线编辑、私密发帖和评论仍需要 Supabase 环境变量与数据库初始化完成。

真正上线需要登录你的 Vercel / Cloudflare / GitHub 账号后发布。当前仓库已经具备静态展示和 Supabase 权限接入骨架。
