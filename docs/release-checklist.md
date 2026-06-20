# 发布前审计清单

每次发版前后按这个顺序核对。

## 本地仓库

- [ ] `git status --short` 只包含本次计划提交的代码、配置、文档和公开资源。
- [ ] 没有真实密码、Supabase service role key、Vercel token 或其他私密凭据进入仓库。
- [ ] `.env` / `.env.local` 没有被提交。

## 构建质量

- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run smoke:dist`
- [ ] `npm run audit:release`
- [ ] `npm run deploy:readiness`

## Supabase

- [ ] 已执行 `supabase/schema.sql`。
- [ ] 旧库已执行 `supabase/migrations/20260619_account_editing.sql`。
- [ ] 已执行 `supabase/seed-portfolio.sql`。
- [ ] `portfolio_projects` 有 3 条项目。
- [ ] `portfolio_items` 有 19 条公开作品。
- [ ] `profiles` 有 `username` 和 `avatar_url` 字段。
- [ ] `owner_posts` 使用 `public` / `draft` 可见性。
- [ ] `public_comments` 有 `author_id` 和 `avatar_url`，插入策略要求登录用户。
- [ ] 旧匿名测试留言已执行 `supabase/migrations/20260620_hide_legacy_anonymous_comments.sql` 隐藏。
- [ ] Storage bucket `portfolio-public` 存在且为 public。
- [ ] Gmail 免费 SMTP 或正式 Custom SMTP 已配置，注册确认邮件能真实送达。
- [ ] 站主账号已注册，并在 `profiles.role` 中设为 `owner`。
- [ ] `npm run verify:supabase`
- [ ] `npm run verify:owner-backend`
- [ ] `npm run verify:gmail-smtp` 或正式 SMTP 的 `npm run verify:smtp`
- [ ] `npm run verify:auth-email`
- [ ] `npm run verify:password-reset-email`
- [ ] `npm run verify:mail-dns`

## 线上平台

- [ ] GitHub Pages Source 已选择 GitHub Actions。
- [ ] GitHub Actions Secrets 已配置：
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
  - [ ] `VITE_SUPABASE_PUBLIC_BUCKET`
  - [ ] `VITE_GITHUB_COMMENTS_REPO`
- [ ] GitHub Pages workflow 已通过。
- [ ] `npm run verify:remote`
- [ ] `npm run verify:comments:remote`
- [ ] `npm run verify:owner-backend:remote`

## 功能验收

- [ ] 访客可以浏览首页、作品集、Demo、音乐、图库、书摘、站主动态和留言列表。
- [ ] 访客看不到编辑模式入口。
- [ ] 访客注册账号后可以设置用户名和头像。
- [ ] 注册确认邮件能收到；点击确认链接后可登录。
- [ ] 未登录用户不能发表留言。
- [ ] 已登录用户能发表留言，留言显示账号用户名和头像。
- [ ] 刷新页面后，已登录账号自动恢复。
- [ ] 站主账号可以进入编辑模式。
- [ ] 编辑模式下可以点击首页标题、介绍、品牌名、副标题并保存。
- [ ] 编辑模式下可以上传站主头像和首页封面。
- [ ] 站主可以上传作品集文件并登记新作品。
- [ ] 站主可以上传音乐、封面并设置背景音乐。
- [ ] 站主可以上传图库图片并设为首页封面。
- [ ] 站主可以发布书摘/视频心得。
- [ ] 站主可以发布站主动态，访客能看到公开动态。
- [ ] 所有持久化内容刷新页面后仍然存在，确认不是 Local Preview 临时数据。
