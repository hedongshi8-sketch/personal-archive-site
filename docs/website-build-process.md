# 个人网站制作过程记录

> 这份记录整理个人网站从搭框架、接作品集、上线、后台权限、资源预览、音乐上传到正式域名绑定的主要过程。文档只记录流程和配置思路，不保存任何密码、App Password、API Key 或私密凭据。

## 1. 初始目标

网站定位为个人策划档案站，面向 HR 和访客公开展示：

- 策划文档作品集
- 游戏 Demo 与 HTML 原型
- Excel 配置表站内预览
- 喜欢的音乐与默认背景音乐
- 图片收藏
- 站主私密/公开发帖区
- 访客评论区
- 只有站主可用的编辑、上传和删除入口

核心原则是：访客随时能打开网站浏览，站主登录后才拥有编辑权限。

## 2. 技术框架

当前项目是一个 Vite + React + TypeScript 前端站点：

- `src/App.tsx`：主要页面、账号状态、作品集、音乐、图片、书摘、评论等功能入口。
- `src/data/portfolioItems.ts`：静态作品集条目和筛选标签。
- `src/lib/backendContract.ts`：本地预览后端与 Supabase 后端统一接口。
- `src/styles/main.css`：全站视觉与响应式样式。
- `public/portfolio-assets`：作品集源文件、原型、图片等公开资源。
- `public/portfolio-previews`：PDF / DOCX / Excel / Markdown 等站内预览 JSON 和图片资源。
- `supabase/`：线上数据库表、RLS 权限、Storage bucket、修复 SQL。
- `.github/workflows/github-pages.yml`：GitHub Pages 自动部署。

## 3. 作品集导入与站内预览

已接入的作品集资源包括：

- `E:\工作相关` 中的野蛮人大作战相关 PDF / Excel。
- `E:\策划文档` 中的系统策划作品集、系统拆解表、3D 战争界面原型等。
- `E:\游戏小镇作品集` 中的游戏小镇方案、HTML 原型、配置表合集、补充文档和归档文件。

处理重点：

- PDF 不再只给下载链接，而是生成页面图片和文本块，支持站内阅读。
- DOCX 预览保留文档中的图片，避免只显示 OCR / 提取文本。
- Excel 预览支持工作表切换、表格滚动、嵌入图片展示。
- 游戏小镇系统配置表合集被保留为重点展示条目。
- 弱展示价值或不适合公开的条目被隐藏，例如野蛮人大作战相关表格、游戏小镇视觉概念图等。

## 4. PC 与手机端预览优化

PC 端曾出现预览区域过小的问题，已优化为：

- 默认预览区加高。
- 增加“放大预览”弹窗。
- PDF / DOCX / Excel 在放大模式下使用接近全屏阅读区域。

手机端曾出现 DOCX 图片无法好好预览的问题，已优化为：

- 文档页面图在手机端纵向排列。
- PDF 类视觉页优先显示页面图片。
- DOCX 内嵌图片不再被全局预览图片样式压扁或裁切。
- 详情操作按钮在手机端自动换行并铺满可用宽度。

## 5. 站主账号与 Supabase

站点使用 Supabase 做线上后端：

- `profiles` 记录用户身份，站主账号标记为 `owner`。
- 访客可以浏览公开内容和评论。
- 只有 `owner` 可以上传、编辑、删除作品集、音乐、图片、书摘等内容。
- Supabase Storage bucket 用于保存上传文件。
- RLS 策略限制匿名访客不能写入站主内容。

登录和注册流程曾配置过：

- 账号 session 自动读取。
- 账号面板显示登录/注册/退出状态。
- 邮件确认和密码重置跳回网站。
- Gmail SMTP 用于改善 Supabase 邮件送达。

## 6. 音乐上传与背景音乐

音乐区已支持：

- 上传音乐文件和封面。
- 设置默认背景音乐。
- 网站右下角显示背景音乐播放/暂停按钮。
- 音乐雷达切换曲目时同步播放选中音乐。

遇到过 Supabase Storage 大文件限制：

- bucket 的 `file_size_limit` 只能在项目全局上限以内生效。
- 免费项目对大音频可能仍会被服务器拒绝。
- 大文件更稳的方案是压缩成 MP3/M4A、使用外部音频 URL，或升级/更换对象存储。

## 7. GitHub Pages 上线

仓库使用 GitHub Pages 自动部署：

- GitHub 用户：`hedongshi8-sketch`
- 仓库：`personal-archive-site`
- 默认 Pages 地址：`https://hedongshi8-sketch.github.io/personal-archive-site/`
- `main` 分支推送后触发 CI 和 Pages 部署。

上线前常用验证：

```powershell
npm run typecheck
npm run lint
npm run build
npm run smoke:dist
npm run verify:portfolio-mobile-preview
npm run verify:remote
```

## 8. 正式域名 easttiger.top

域名购买在腾讯云，权威 DNS 当前走 DNSPod：

```text
vivien.dnspod.net
pettitoes.dnspod.net
```

GitHub Pages 绑定域名：

```text
easttiger.top
```

DNSPod 解析记录：

```text
@    A      185.199.108.153
@    A      185.199.109.153
www  CNAME  hedongshi8-sketch.github.io
```

GitHub 官方推荐 4 条 A 记录，但 DNSPod 免费版同一主机记录的 A 记录数量可能受限；当前先使用 2 条 A 记录也能访问。

验证结果：

- `http://easttiger.top/` 已返回 GitHub Pages 页面。
- `https://easttiger.top/` 已可访问。
- `www.easttiger.top` 已指向 GitHub Pages，并会跳转到主域名。
- `Enforce HTTPS` 可能需要等待 GitHub 完成证书签发后才能稳定开启。

## 9. 后续维护注意事项

- 不要把密码、SMTP App Password、Supabase Key 写进仓库。
- 如果更换正式域名，需要同步更新 Supabase Auth 的 `Site URL` 和 `Redirect URLs`。
- 作品集新增公开条目前，应确认是否适合 HR 直接浏览。
- 上传 Excel / DOCX / PDF 后，优先生成站内预览，避免 HR 必须下载文件。
- 手机端预览必须单独检查，尤其是带图片的 DOCX 和宽表格 Excel。
- 推送前至少跑类型检查、构建和作品集预览验证。
