# 上线运行手册

这份手册用于把网站发布到公网，并启用“公开浏览、账号留言、只有站主可编辑”的权限链路。

## 1. Supabase

1. 新建 Supabase 项目。
2. 打开 SQL Editor，首次建库执行 `supabase/schema.sql`。
3. 如果是从旧版本升级，执行 `supabase/migrations/20260619_account_editing.sql`。
4. 执行 `supabase/seed-portfolio.sql`。
5. 确认 Storage 里有 public bucket：`portfolio-public`。
6. 在 Authentication -> Providers 里启用 Email provider，允许邮箱密码登录/注册。
7. 按 [Supabase SMTP 邮件配置](supabase-smtp.md) 配好 Custom SMTP；不要依赖 Supabase 默认发信服务做正式注册确认。
8. 在 Authentication -> URL Configuration 里加入线上域名，例如：
   - `https://hedongshi8-sketch.github.io`
   - `https://hedongshi8-sketch.github.io/personal-archive-site/`

## 2. 设置站主账号

1. 打开网站右上角账号面板。
2. 用邮箱密码注册你的账号；如果 Supabase 发送了确认邮件，先点确认链接，再回到网站登录一次。
3. 回到 Supabase SQL Editor 执行：

```sql
update public.profiles
set role = 'owner'
where email = '你的邮箱';
```

4. 重新登录网站。右上角出现“编辑模式”后，站主权限生效。

## 3. GitHub Pages

1. GitHub 仓库 Settings -> Pages -> Source 选择 GitHub Actions。
2. 在 Settings -> Secrets and variables -> Actions 添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_PUBLIC_BUCKET`
   - `VITE_GITHUB_COMMENTS_REPO`
3. 推送 `main` 分支。
4. `.github/workflows/github-pages.yml` 会构建并发布 `dist`。
5. 发布后运行：

```bash
npm run verify:remote
npm run verify:comments:remote
npm run verify:owner-backend:remote
```

## 4. Vercel

1. 新建 Vercel 项目并连接 GitHub 仓库。
2. Framework Preset 选择 Vite。
3. Build Command 使用 `npm run build`。
4. Output Directory 使用 `dist`。
5. 添加和 GitHub Pages 相同的环境变量。

## 5. 发布前本地检查

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
```

`verify:supabase` 和 `verify:owner-backend` 依赖 `.env.local` 里的 Supabase 配置。未配置时失败是正常的，代表线上持久化能力还没接通。

`verify:smtp` 依赖当前终端的 SMTP 环境变量，只用于确认邮件服务商能真实发信；这些密钥不要写进仓库。

## 6. 验收重点

- 游客能打开首页、作品集、音乐、图库、书摘、站主动态和留言墙。
- 游客不能看到作品上传、音乐上传、图库上传、书摘发布和首页编辑入口。
- 新用户能邮箱密码注册，设置用户名和头像。
- 新用户注册确认邮件能收到，点击确认链接后可以登录。
- 登录用户能留言，未登录用户不能留言。
- 站主能进入编辑模式，点击标题/品牌/首页介绍修改文字，点击头像/封面上传图片。
- 站主能发布站主动态，访客能看到公开动态。
- 刷新页面后，登录状态仍然保留。
