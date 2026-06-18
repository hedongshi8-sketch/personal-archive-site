# 上线运行手册

这份手册用于把当前站点发布到公网，并启用“访客可浏览、只有站主可编辑”的权限链路。

## 1. Supabase

1. 新建 Supabase 项目。
2. 打开 SQL Editor，先执行 `supabase/schema.sql`。
3. 再执行 `supabase/seed-portfolio.sql`。
4. 确认 Storage 中存在公开 bucket：`portfolio-public`。
5. 在 Supabase Auth 中启用 Email provider。
6. 在 Authentication URL Configuration 中加入线上域名，例如：
   - `https://你的域名`
   - `https://你的域名/#private`

## 2. Vercel

1. 新建 Vercel 项目并连接 GitHub 仓库。
2. Framework Preset 选择 Vite。
3. Build Command 使用 `npm run build`。
4. Output Directory 使用 `dist`。
5. 添加环境变量：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_SUPABASE_PUBLIC_BUCKET=portfolio-public`
   - `VITE_GITHUB_COMMENTS_REPO=hedongshi8-sketch/personal-archive-site`

## 2.1 GitHub Pages 备用静态发布

如果暂时没有 Vercel token，可以先使用 GitHub Pages 发布公开作品集：

1. 创建 GitHub 仓库并推送 `main`。
2. 打开 GitHub 仓库 Settings -> Pages。
3. Source 选择 GitHub Actions。
4. 推送后 `.github/workflows/github-pages.yml` 会构建、冒烟测试、发布 `dist`。
5. `public/.nojekyll` 和 `public/404.html` 会随构建进入 `dist`，用于兼容 GitHub Pages 静态托管。
6. 发布完成后运行 `npm run verify:remote`，确认公网首页、原型、PDF 和 Excel 可访问。

这条路线可以让访客在线浏览作品集和 demo；站主在线编辑、私密发帖和真实评论仍需要 Supabase 初始化与环境变量。
如果要在 Supabase 前先启用公网评论，打开 <https://github.com/apps/utterances>，安装到 `personal-archive-site` 仓库；留言墙会使用 GitHub Issues 保存评论。

## 3. GitHub Actions 自动部署

仓库已经包含：

- `.github/workflows/ci.yml`
- `.github/workflows/github-pages.yml`
- `.github/workflows/vercel-deploy.yml`

在 GitHub 仓库的 Settings -> Secrets and variables -> Actions 添加：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SUPABASE_PUBLIC_BUCKET`
- `VITE_GITHUB_COMMENTS_REPO`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

配置完成后，推送到 `main` 会执行 CI 并部署到 Vercel；也可以手动运行 `Deploy to Vercel` workflow。

## 4. 设置站主账号

1. 打开线上网站，进入“私密发帖”或“我的策划档案”。
2. 输入你的站主邮箱，发送 magic link。
3. 完成邮箱登录。
4. 回到 Supabase SQL Editor 执行：

```sql
update public.profiles
set role = 'owner'
where email = '你的邮箱';
```

完成后，访客只能浏览和评论；站主账号可以发私密帖、上传作品集文件、登记新作品条目。

## 5. 发布前检查

本地先跑：

```bash
npm run typecheck
npm run lint
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

确认：

- `dist/portfolio-assets` 存在。
- 关键公开路径、原型 iframe、PDF 和 Excel 文件通过 `npm run smoke:dist`。
- `dist/_headers` 和 `dist/_redirects` 存在。
- `supabase/seed-portfolio.sql` 包含 16 个作品条目。
- 线上环境变量与 `.env.example` 一致。
- `npm run deploy:readiness` 没有 `BLOCK` 项；如果提示缺少 Git remote，先创建 GitHub 仓库并执行 `git remote add origin <repo-url>`。
- 如需手动上传，`release/personal-archive-site-static.zip` 已由 `npm run pack:static` 生成。
- `npm run verify:remote` 通过；如果 GitHub Pages 仍是 404，先在仓库 Settings -> Pages 中选择 GitHub Actions。
- `npm run verify:comments:remote` 通过；如果失败，确认最新 Pages 已部署并且 Utterances 配置仍在 bundle 中。
- 配置 Supabase 后，`npm run verify:supabase` 通过。
