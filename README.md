# 我的个人网站

个人创作网站：策划文档作品集、游戏 Demo、音乐收藏、灵感图库、书摘心得、站主动态和登录留言墙。站主账号可以进入编辑模式，访客账号可以设置用户名头像并留言。

## 技术栈

- React 19 + TypeScript + Vite
- lucide-react 图标系统
- PWA 基础：manifest + service worker
- 静态作品集资源：`public/portfolio-assets`
- 站内作品预览：`public/portfolio-previews` 里的 Excel / DOCX / Markdown / 文本预览数据
- Supabase 后端：Auth 账号密码登录、Postgres RLS、Storage、用户资料、站主动态、留言、作品/音乐/图片/书摘上传和站点设置
- Supabase Auth 邮件：Custom SMTP 发送注册确认/重发确认邮件，配置看 [docs/supabase-smtp.md](docs/supabase-smtp.md)

## 本地运行

```bash
npm install
npm run dev
```

开发地址默认是 `http://localhost:5173/`。

## Supabase 权限模型

- 所有人都能浏览公开作品、音乐、图库、书摘、站主动态和已审核留言。
- 访客需要注册/登录账号后，才能设置用户名头像并在留言墙留言；如果 Supabase 开启邮箱确认，注册后要先点确认邮件再登录。
- 只有 `profiles.role = 'owner'` 的账号能进入编辑模式、上传资源、发布站主动态、修改首页标题、品牌名、头像和封面。
- Supabase Auth 会在浏览器保存 session，登录过一次后再次打开网站会自动读取当前账号。

## 初始化 Supabase

1. 新建 Supabase 项目。
2. 在 SQL Editor 执行 `supabase/schema.sql`。
3. 执行 `supabase/seed-portfolio.sql`，写入当前 19 个公开作品条目。
4. 确认 Storage bucket `portfolio-public` 存在且为 public。
5. 按 [docs/supabase-smtp.md](docs/supabase-smtp.md) 配好 Custom SMTP，否则注册确认邮件可能收不到。
6. 在网站上用邮箱密码注册你的站主账号；如果收到 Supabase 确认邮件，先点确认链接，再回到网站登录一次。
7. 回到 Supabase SQL Editor 执行 `supabase/set-owner.sql`，或手动执行：

```sql
update public.profiles
set role = 'owner'
where email = '你的邮箱';
```

已有旧库时，先执行 `supabase/migrations/20260619_account_editing.sql`，它会把旧版发帖结构升级到账号资料、公开站主动态和登录留言。

## 环境变量

复制 `.env.example` 到 `.env.local`，填入：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_SUPABASE_PUBLIC_BUCKET=portfolio-public
VITE_GITHUB_COMMENTS_REPO=hedongshi8-sketch/personal-archive-site
```

GitHub Pages 或 Vercel 部署时，也要把这些变量配置到平台 Secrets / Environment Variables。没有 Supabase 变量时，网站仍能作为静态作品集浏览，但在线编辑、账号留言和持久上传不会写入线上数据库。

## 站主使用方式

1. 打开网站，使用右上角账号面板登录。
2. 如果你是 owner，右上角会出现“编辑模式”。
3. 进入编辑模式后：
   - 点击首页标题、介绍、品牌名、副标题即可编辑。
   - 点击头像可以上传站主头像。
   - 点击封面上的“更换封面”可以上传首页封面。
4. 进入“我的策划档案”“音乐雷达”“灵感图库”“书摘心得”可以上传对应内容。
5. 进入“站主动态”可以发布公开更新记录。

## 常用检查

```bash
npm run typecheck
npm run lint
npm run build
npm run smoke:dist
npm run audit:release
npm run deploy:readiness
npm run verify:supabase
npm run verify:owner-backend
npm run verify:smtp
npm run verify:auth-email
npm run verify:mail-dns
```

`verify:supabase` 和 `verify:owner-backend` 需要本地或部署环境已经配置 Supabase 变量。线上发布后再跑：

`verify:smtp` 需要当前终端设置 `SMTP_HOST`、`SMTP_PORT`、`SMTP_USER`、`SMTP_PASS`、`SMTP_FROM`、`SMTP_TO`，只用于验证邮件服务商的 SMTP 账号能真实发测试邮件。

`verify:auth-email` 需要当前终端设置 `AUTH_EMAIL_TO`，用于触发 Supabase Auth 注册确认邮件，确认 Custom SMTP 已经被 Supabase 用起来。

`verify:mail-dns` 需要当前终端设置 `MAIL_DOMAIN`，用于检查 Resend/Cloudflare 的发信 DNS 记录是否生效。

```bash
npm run verify:remote
npm run verify:comments:remote
npm run verify:owner-backend:remote
```

## 部署

完整流程看 [docs/deployment-runbook.md](docs/deployment-runbook.md)，发布前后核对看 [docs/release-checklist.md](docs/release-checklist.md)，日后维护和开发说明看 [docs/development-maintenance.md](docs/development-maintenance.md)。
