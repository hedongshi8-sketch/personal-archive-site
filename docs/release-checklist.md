# 发布前审计清单

用于确认网站从本地项目进入公网发布状态。每次发布前后按顺序检查。

## 本地仓库

- [ ] `git status --short` 只包含计划提交的源码、配置、文档和公开资源。
- [ ] `dist/`、`node_modules/`、`.env` 被 `.gitignore` 忽略。
- [ ] 没有真实 Supabase key、Vercel token、邮箱登录链接进入仓库。
- [ ] 已提交 `.github/workflows/ci.yml` 和 `.github/workflows/vercel-deploy.yml`。

## 构建质量

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `dist/portfolio-assets` 和 `public/portfolio-assets` 文件数一致。
- [ ] `dist/_headers` 和 `dist/_redirects` 存在。

## Supabase

- [ ] 已执行 `supabase/schema.sql`。
- [ ] 已执行 `supabase/seed-portfolio.sql`。
- [ ] `portfolio_projects` 有 3 条项目。
- [ ] `portfolio_items` 有 16 条公开作品。
- [ ] Storage bucket `portfolio-public` 存在且 public。
- [ ] 站主邮箱首次 magic link 登录完成。
- [ ] `profiles.role` 已将站主邮箱设置为 `owner`。

## 部署平台

- [ ] GitHub 仓库已创建并推送 `main` 分支。
- [ ] Vercel 项目已连接该 GitHub 仓库。
- [ ] Vercel 环境变量已设置：
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_SUPABASE_PUBLIC_BUCKET`
- [ ] GitHub Actions Secrets 已设置：
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_SUPABASE_PUBLIC_BUCKET`
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`

## 线上验收

- [ ] 公网 URL 可以打开首页。
- [ ] `/#docs` 可以看到 16 个作品。
- [ ] `游戏小镇` 筛选显示 6 个作品，并能打开原型 iframe。
- [ ] `可交互原型` 筛选和搜索 `战争` 正常。
- [ ] 访客可以提交留言。
- [ ] 未登录访客看不到可用的作品集编辑权限。
- [ ] 站主登录后可以进入私密发帖区。
- [ ] 站主登录后可以上传作品集文件并登记新作品。
