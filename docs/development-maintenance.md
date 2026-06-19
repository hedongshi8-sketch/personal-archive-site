# 开发维护文档

这份文档给以后继续更新网站时使用。

## 项目结构

- `src/App.tsx`：主要页面、账号面板、编辑模式、作品/音乐/图库/书摘/动态/留言交互。
- `src/styles/main.css`：全站布局、响应式、编辑模式、暗色模式。
- `src/data/siteData.ts`：静态种子数据、导航、默认站点设置。
- `src/data/portfolioItems.ts`：作品集静态条目和筛选标签。
- `src/lib/backendContract.ts`：本地预览后端和 Supabase 后端统一接口。
- `supabase/schema.sql`：新项目完整数据库结构和 RLS。
- `supabase/migrations/20260619_account_editing.sql`：旧库升级脚本。
- `supabase/seed-portfolio.sql`：作品集种子数据。
- `scripts/`：构建、远程验证、Supabase 验证和发布审计脚本。

## 账号和权限

前端使用 `useAuthSession()` 管理全站账号状态。它会在页面打开时调用 `siteBackend.getCurrentUser()`，Supabase 会从浏览器 session 自动恢复登录状态。

权限规则：

- `visitor`：可以浏览公开内容，登录后可以编辑自己的用户名头像并留言。
- `owner`：拥有 visitor 权限，并且可以进入编辑模式、上传内容、发布站主动态、修改站点设置。

设置 owner：

```sql
update public.profiles
set role = 'owner'
where email = '你的邮箱';
```

推荐直接执行仓库里的 `supabase/set-owner.sql`，执行后应该能查到一行 `role = owner` 的结果。如果显示 `Success. No rows returned`，通常说明这个邮箱还没有注册/登录生成 profile，先在网站用邮箱密码登录或注册一次，再执行 owner SQL。

## 编辑模式

入口：右上角账号面板旁的“编辑模式”，只有 owner 可见。

可编辑内容：

- 首页标题：`site_settings.hero_title`
- 首页介绍：`site_settings.hero_description`
- 网站名称：`site_settings.brand_name`
- 网站副标题：`site_settings.brand_subtitle`
- 站主头像：`site_settings.site_avatar_url`
- 首页封面：`site_settings.hero_cover_url`

实现位置：

- `HeroSection`
- `EditableText`
- `siteBackend.updateSiteSettings`
- `siteBackend.uploadAsset(file, "site-cover" | "site-avatar")`

## 留言墙

留言要求登录账号。前端不再让用户手填作者名，而是使用 `profiles.username` 和 `profiles.avatar_url`。

相关表：

- `profiles`
- `public_comments`

关键 RLS：

- `approved comments are public`：公开读取已审核留言。
- `signed in users can create comments`：只有 `auth.uid() = author_id` 的登录用户能插入。

## 站主动态

旧的“私密发帖”已经改为公开“站主动态”。

相关表：

- `owner_posts.visibility = 'public' | 'draft'`

规则：

- 所有人可读 `visibility = 'public'` 的动态。
- 只有 owner 可插入、更新、删除。

## 添加新栏目

1. 在 `src/data/siteData.ts` 的 `navItems` 增加导航。
2. 在 `src/App.tsx` 的 `sectionIds` 增加 section id。
3. 新建对应组件，并加入 `activeScreen`。
4. 如果需要后端持久化：
   - 更新 `supabase/schema.sql`
   - 写 migration
   - 在 `src/lib/backendContract.ts` 增加接口
   - 更新验证脚本

## 常见更新流程

```bash
npm run typecheck
npm run lint
npm run build
npm run smoke:dist
npm run audit:release
```

`audit:release` 要求工作树干净，所以开发中有未提交文件时它最后一项会失败；提交后再跑即可。

本地不想连 Supabase、只想快速测试站主编辑模式时，可以临时强制本地预览：

```bash
$env:VITE_FORCE_LOCAL_PREVIEW="true"
npm run dev
```

这个开关只在 localhost 生效，不要把它配置到 GitHub Pages Secrets。

如果改了 Supabase：

1. 在 VS Code 终端运行 `npm run sql:supabase-upgrade`。
2. 复制终端输出的整段 SQL，到 Supabase SQL Editor 里执行。
3. SQL 最后会输出检查结果；如果 `site owner account` 显示 `missing account`，先在网站用站主邮箱注册或登录一次，再执行 `supabase/set-owner.sql`。
4. 回到 VS Code 跑下面两条验证。

```bash
npm run verify:supabase
npm run verify:owner-backend
```

如果看到 `site_settings.brand_name does not exist`、`owner_post_visibility: "public"` 或匿名留言没有被拦，说明第 1 步迁移还没有完整执行。

如果已经部署到 GitHub Pages：

```bash
npm run verify:remote
npm run verify:comments:remote
npm run verify:owner-backend:remote
```

## 数据库变更原则

- `schema.sql` 保持“新项目从零初始化”的完整版本。
- `supabase/migrations/` 放“旧项目升级到新结构”的增量脚本。
- RLS 策略要先写清楚：谁能读、谁能写、owner 权限如何判断。
- visitor 自己能改的数据必须通过 RPC 限制字段，例如 `update_own_profile` 只允许改用户名和头像，不允许改 `role`。

## 安全注意

- 不要提交 `.env`、`.env.local`、service role key、个人密码。
- 前端只使用 anon key，不能使用 service role key。
- owner 权限必须由数据库的 `profiles.role` 和 RLS 保护，不能只靠前端隐藏按钮。
- 公开仓库不会让别人 commit，除非你在 GitHub 仓库权限里主动给对方写权限。
