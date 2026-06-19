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
- [ ] `npm run smoke:dist`
- [ ] `npm run audit:release`
- [ ] `npm run verify:comments`
- [ ] `npm run deploy:readiness`
- [ ] `npm run pack:static`（需要手动上传静态包时）
- [ ] `dist/portfolio-assets` 和 `public/portfolio-assets` 文件数一致。
- [ ] `dist/portfolio-previews` 和 `public/portfolio-previews` 文件数一致。
- [ ] `dist/_headers` 和 `dist/_redirects` 存在。
- [ ] `dist/.nojekyll` 和 `dist/404.html` 存在。

## Supabase

- [ ] 已执行 `supabase/schema.sql`。
- [ ] 已执行 `supabase/seed-portfolio.sql`。
- [ ] `portfolio_projects` 有 3 条项目。
- [ ] `portfolio_items` 有 19 条公开作品。
- [ ] `music_tracks`、`gallery_items`、`reading_notes`、`site_settings` 表已创建。
- [ ] 评论插入策略包含 `client_elapsed_ms` 和 `honeypot` 防刷字段。
- [ ] Storage bucket `portfolio-public` 存在且 public。
- [ ] 站主邮箱首次 magic link 登录完成。
- [ ] `profiles.role` 已将站主邮箱设置为 `owner`。
- [ ] `npm run verify:supabase`
- [ ] `npm run verify:owner-backend`
- [ ] `npm run verify:owner-backend:remote`

## 部署平台

- [ ] GitHub 仓库已创建并推送 `main` 分支。
- [ ] 如果先走 GitHub Pages：Settings -> Pages -> Source 已选择 GitHub Actions，`Deploy to GitHub Pages` workflow 已通过。
- [ ] Vercel 项目已连接该 GitHub 仓库。
- [ ] Vercel 环境变量已设置：
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_SUPABASE_PUBLIC_BUCKET`
- [ ] GitHub Actions Secrets 已设置：
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_SUPABASE_PUBLIC_BUCKET`
  - [ ] `VITE_GITHUB_COMMENTS_REPO`
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
- [ ] 如果 Supabase 还没启用公网评论：Utterances App 已安装并授权仓库。

## 线上验收

- [ ] 公网 URL 可以打开首页。
- [ ] `npm run verify:remote`
- [ ] `npm run verify:comments:remote`
- [ ] `/#docs` 可以看到 19 个作品。
- [ ] `游戏小镇` 筛选显示 8 个作品，并能打开原型 iframe。
- [ ] Excel、DOCX、Markdown 和文本作品可以在详情栏站内预览。
- [ ] `可交互原型` 筛选和搜索 `战争` 正常。
- [ ] 访客可以提交留言。
- [ ] 留言墙错误答案或提交过快会被拦截。
- [ ] 未登录访客看不到可用的作品集编辑权限。
- [ ] 站主登录后可以进入私密发帖区。
- [ ] 站主登录后可以上传作品集文件并登记新作品。
- [ ] 站主登录后可以上传音乐并设置全站背景音乐。
- [ ] 站主登录后可以上传图片并修改首页封面。
- [ ] `/#notes` 可以浏览书摘心得，站主登录后可以发布书籍/视频心得。
- [ ] 上述上传在刷新页面后仍存在，确认不是 Local Preview 临时数据。
