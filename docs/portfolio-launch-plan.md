# 策划档案作品集上线记录

这份文档保留作品集上线的历史背景。当前开发、部署、发布和维护步骤以这些文件为准：

- `README.md`
- `docs/deployment-runbook.md`
- `docs/release-checklist.md`
- `docs/development-maintenance.md`

## 已完成的作品集导入

- 真实作品资产已复制到 `public/portfolio-assets`。
- 构建后 `dist/portfolio-assets` 保持 87 个文件。
- `public/portfolio-previews` 已生成站内只读预览数据。
- `DocsSection` 支持搜索、筛选、详情、PDF/HTML/image 预览、Excel 站内浏览和下载。
- 游戏小镇原型与系统策划 HTML 原型可通过 iframe 预览。
- `supabase/seed-portfolio.sql` 包含 19 个公开作品条目。

## 当前网站方向

网站已经从单一策划档案馆升级为个人网站：

- 首页文案、品牌名、头像、封面可由站主在编辑模式中修改。
- 站主动态公开展示，只有 owner 可发布。
- 访客需要邮箱密码账号登录后才能留言。
- 访客可以维护自己的用户名和头像。
- 站主账号由 Supabase `profiles.role = 'owner'` 控制。

继续开发时不要使用早期的邮件链接登录流程，按 `docs/development-maintenance.md` 的账号密码体系维护。
