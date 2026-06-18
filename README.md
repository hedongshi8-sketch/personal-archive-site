# 我的策划档案

个人创作网站：策划文档作品集、游戏 Demo、音乐收藏、灵感图库、站主私密发帖区和公开留言墙。

## 技术栈

- React 19 + TypeScript + Vite
- lucide-react 图标系统
- PWA 基础：manifest + service worker
- 静态作品集资产：`public/portfolio-assets`
- Supabase-ready 后端：Auth、Postgres RLS、Storage、公开评论、站主私密发帖

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
npm run verify:supabase
```

构建产物在 `dist`。`vercel.json`、`public/_redirects`、`public/_headers` 已经为 Vercel / Cloudflare Pages 的 SPA 路由和静态资源缓存做好准备。
`smoke:dist` 会在本地临时托管 `dist`，确认首页、原型 iframe、PDF 和 Excel 等关键公开路径可访问。
`deploy:readiness` 会检查 Git 远程、部署 CLI 和本地 Supabase 环境变量状态，帮助确认还差哪些外部授权。
`pack:static` 会生成 `release/personal-archive-site-static.zip` 和 manifest，方便没有 CLI 时手动上传静态站点。
`verify:remote` 会检查 GitHub Pages 默认公网 URL，确认首页、原型、PDF 和 Excel 可访问。
`verify:supabase` 会在配置 Supabase 环境变量后检查公开作品、访客评论、点赞 RPC 和 owner-only RLS。

## 作品集资产

当前真实作品已经复制到 `public/portfolio-assets`，构建后会进入 `dist/portfolio-assets`：

- `barbarq`：野蛮人大作战 PDF 和 Excel
- `system-planner`：系统策划作品集 PDF、Excel、HTML 原型和图片
- `game-town`：游戏小镇 HTML 原型、文档、图片、配置表和归档包

## 启用站主权限

前端已经接入 `src/lib/backendContract.ts`：

- 没有 Supabase 环境变量时：自动使用本地预览模式，方便开发和静态展示。
- 配置 Supabase 后：私密发帖、公开评论、点赞、资源上传接口切换到 Supabase。
- 策划档案页包含 owner-only 管理面板；owner 可以上传作品集文件并登记新作品条目。
- 真实权限由 `supabase/schema.sql` 的 Auth + RLS + profile role 控制。

部署前复制 `.env.example`，在本地或部署平台填入：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_SUPABASE_PUBLIC_BUCKET=portfolio-public
```

Supabase 侧步骤：

1. 新建 Supabase 项目。
2. 在 SQL Editor 执行 `supabase/schema.sql`。
3. 再执行 `supabase/seed-portfolio.sql`，把当前 16 个公开作品写入 `portfolio_items`。
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

这样外部访客可以浏览作品集和评论，只有 `profiles.role = 'owner'` 的账号能写入私密发帖和管理资源。

## 部署

完整上线流程见 [docs/deployment-runbook.md](docs/deployment-runbook.md)。
发布前后逐项验收见 [docs/release-checklist.md](docs/release-checklist.md)。

### GitHub Pages

- 推送 `main` 后，`.github/workflows/github-pages.yml` 会构建并发布 `dist`。
- 这条路线不需要 Vercel token，适合先把公开作品集放到公网。
- 仓库 Settings -> Pages 的 Source 选择 GitHub Actions。
- `public/.nojekyll` 和 `public/404.html` 已准备好，兼容 GitHub Pages 静态托管与直接路径访问。
- Supabase 环境变量未配置时，站点会保持本地预览模式；公开作品集可浏览，站主在线编辑不会启用真实权限。

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
