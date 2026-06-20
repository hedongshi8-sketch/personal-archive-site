# Supabase SMTP 邮件配置

Supabase 默认邮件服务只适合测试。正式站点要稳定发送注册确认邮件、重发确认邮件和未来的密码重置邮件，需要在 Supabase Auth 里配置 Custom SMTP。

官方参考：

- Supabase Custom SMTP：https://supabase.com/docs/guides/auth/auth-smtp
- Supabase Auth Rate Limits：https://supabase.com/docs/guides/auth/rate-limits

## 免费临时方案：Gmail App Password

如果只是先把确认邮件跑通，不想现在买域名，可以先用 `hedongshi8@gmail.com` 的 Gmail SMTP。这个方案 0 元，适合个人作品集早期验证；缺点是发件人会显示你的 Gmail，邮件专业度和可达性不如自有域名。

前提：

1. Google 账号开启 2-Step Verification。
2. 在 Google 账号里创建 App Password。Google 官方说明：App Password 是 16 位密码，只有开启两步验证的账号才能使用。
3. 这个 App Password 只粘贴到 Supabase 后台，不要写进仓库、`.env` 或前端代码。

Supabase SMTP 填这一组：

```text
Host       = smtp.gmail.com
Port       = 465
Username   = hedongshi8@gmail.com
Password   = Gmail App Password
Sender     = 个人策划档案 <hedongshi8@gmail.com>
```

如果 Supabase 的 465/TLS 连接失败，再换 587/STARTTLS 试一次：

```text
Host       = smtp.gmail.com
Port       = 587
Username   = hedongshi8@gmail.com
Password   = Gmail App Password
Sender     = 个人策划档案 <hedongshi8@gmail.com>
```

本地先测 Gmail SMTP。可以给当前 PowerShell 终端设置 Gmail App Password：

```powershell
$env:GMAIL_ADDRESS="hedongshi8@gmail.com"
$env:GMAIL_APP_PASSWORD="你的 Gmail App Password"
$env:AUTH_EMAIL_TO="hedongshi8@gmail.com"
npm run verify:gmail-smtp
```

也可以把同样的变量放到本机 `.env.local`，脚本会自动读取；`.env.local` 已被 gitignore，不要提交或截图。`verify:gmail-smtp` 会优先使用 `GMAIL_SMTP_TO`，其次使用 `AUTH_EMAIL_TO`，再退回到 `GMAIL_ADDRESS`。

如果只想先确认本机变量是否齐，可以跑一键体检。默认不会真的发邮件：

```powershell
npm run verify:email
```

要让体检同时发送 Gmail SMTP 测试邮件、触发 Supabase 注册确认邮件，再打开两个开关：

```powershell
$env:EMAIL_STACK_SEND_GMAIL="true"
$env:EMAIL_STACK_TRIGGER_AUTH="true"
npm run verify:email
```

如果你不想再创建任何注册测试账号，更推荐用密码重置邮件做最终收件箱验证：

```powershell
npm run verify:email:final
```

`verify:email:final` 等价于打开 `EMAIL_STACK_SEND_GMAIL=true` 和 `EMAIL_STACK_TRIGGER_PASSWORD_RESET=true`：它会发送一封 Gmail SMTP 测试邮件，并触发一次 Supabase 密码重置邮件。脚本通过后，还要去收件箱/垃圾箱确认两封邮件真的到达。

这个命令默认会先试 `465/TLS`，失败后自动试 `587/STARTTLS`。如果你只想测某一个端口，可以临时加：

```powershell
$env:GMAIL_SMTP_PORT="587"
npm run verify:gmail-smtp
```

测通后，可以手动把同一组 Gmail SMTP 参数填到 Supabase `Authentication -> Email -> SMTP Settings`，也可以用脚本自动配置。

自动配置需要一个 Supabase Personal Access Token，权限要能写 Auth 配置：

1. 打开 https://supabase.com/dashboard/account/tokens
2. 创建一个新的 access token，例如命名为 `personal-archive-smtp-setup`
3. 只在当前 PowerShell 终端临时设置，不要写进 `.env` 或仓库

```powershell
$env:SUPABASE_ACCESS_TOKEN="你的 Supabase access token"
$env:GMAIL_APP_PASSWORD="你的 Gmail App Password"
npm run supabase:configure-gmail-smtp
```

脚本会从 `VITE_SUPABASE_URL` 自动识别项目 ref，然后调用 Supabase Management API 写入：

```text
Host          = smtp.gmail.com
Port          = 465
Username      = hedongshi8@gmail.com
Password      = Gmail App Password
Sender email  = hedongshi8@gmail.com
Sender name   = 个人策划档案
Site URL      = https://hedongshi8-sketch.github.io/personal-archive-site/
```

如果你更想手动配置，Supabase 后台仍然按上面的字段填即可。

配置完成后触发一次 Supabase Auth 确认邮件：

```powershell
$env:GMAIL_ADDRESS="hedongshi8@gmail.com"
$env:AUTH_EMAIL_TO="你的收件邮箱"
npm run verify:auth-email
```

这个命令默认直接使用 `AUTH_EMAIL_TO` 本体，避免生成 `+auth-test` 测试账号。如果没设置 `AUTH_EMAIL_TO`，脚本会尝试用 `GMAIL_ADDRESS` 作为收件邮箱。只有你明确想用 Gmail 加号别名隔离测试时，再额外设置：

```powershell
$env:AUTH_EMAIL_USE_ALIAS="true"
npm run verify:auth-email
```

脚本通过只能证明 Supabase 已接受注册并触发确认邮件请求；最终还要打开收件箱/垃圾箱确认邮件确实送达。

如果你的站主邮箱已经注册过，优先用密码重置邮件验证 Supabase Auth 发信链路。这个命令不会创建 `+auth-test` 账号：

```powershell
$env:PASSWORD_RESET_EMAIL_TO="hedongshi8@gmail.com"
npm run verify:password-reset-email
```

脚本通过只能证明 Supabase 已接受密码重置邮件请求；最终仍要打开收件箱/垃圾箱确认邮件确实送达。

## 正式方案：Resend + 自有域名

如果以后要让邮件更像正式网站，再买域名并换 Resend。Resend 官方有 Supabase SMTP 集成说明，需要 Resend API key 和 verified domain。

Supabase SMTP 填这一组：

```text
Host       = smtp.resend.com
Port       = 465
Username   = resend
Password   = Resend API key
Sender     = 个人策划档案 <noreply@你的域名>
```

如果用其他邮件服务商，例如 Brevo、SendGrid、阿里云邮件推送，也按同样字段填 Supabase。不要把 SMTP 密码写进仓库，也不要放进 `VITE_` 前端环境变量。

通用字段对应关系：

```text
SMTP Host      = 邮件服务商提供的 SMTP host
SMTP Port      = 587（STARTTLS）或 465（TLS）
SMTP Username  = 邮件服务商提供的 SMTP username
SMTP Password  = 邮件服务商提供的 SMTP password / API key
Sender email   = 发信邮箱，例如 noreply@你的域名
Sender name    = 个人策划档案
```

长期建议绑定自己的域名并完成 SPF、DKIM、DMARC 验证，否则邮件容易进垃圾箱。Resend 要求 verified domain 才适合作为正式发信通道。

## 从买域名到正式 SMTP 配完

下面用 `example.com` 代替你将来买到的域名。实际操作时把它换成你的域名。

### 1. 买一个域名

推荐在 Cloudflare Registrar、Namecheap、GoDaddy、阿里云、腾讯云里任选一个。为了 DNS 后续省事，优先用 Cloudflare：

1. 注册/登录 Cloudflare。
2. 进入 `Domain Registration` 或 `Registrar`。
3. 搜索你想要的域名，例如：
   - `hedongshi.com`
   - `hedongshi8.com`
   - `hedongshi.site`
   - `hedongshi.games`
4. 选择一个能注册、价格你能接受的域名并付款。
5. 注册完成后，确保这个域名的 DNS 托管在 Cloudflare。如果你在别的平台买域名，也可以把 nameservers 改成 Cloudflare 提供的两条 nameserver。

只为了发邮件，网站可以暂时继续用 GitHub Pages 的原地址。域名买来后先用于发信地址，例如 `noreply@example.com`。

### 2. 可选：把网站也绑定到自己的域名

如果你想让 HR 打开 `www.example.com` 而不是 GitHub Pages 地址：

1. 打开 GitHub 仓库 `personal-archive-site`。
2. 进入 `Settings -> Pages`。
3. 在 `Custom domain` 填 `www.example.com`，保存。
4. 回 Cloudflare DNS，添加：

```text
Type: CNAME
Name: www
Target: hedongshi8-sketch.github.io
Proxy status: DNS only
```

5. 等 GitHub Pages 识别后勾选 `Enforce HTTPS`。

如果只是先把邮件弄正常，这一步可以晚点做。

### 3. 在 Resend 添加发信域名

推荐用一个专门的认证邮件子域名，降低和未来个人邮箱、营销邮件互相影响的风险：

```text
auth.example.com
```

操作：

1. 注册/登录 Resend。
2. 进入 `Domains`。
3. 点击 `Add Domain`。
4. 填 `auth.example.com`。
5. Resend 会给你几条 DNS 记录，通常包括 DKIM、SPF/Return-Path、DMARC 等。
6. 回 Cloudflare DNS，把 Resend 给的记录逐条加进去。
7. 在 Resend 点 `Verify DNS Records`。
8. 等状态变成 `Verified`。

DNS 生效有时需要几分钟到 24 小时。记录没验证通过时，先检查 Cloudflare 里记录的 `Name`、`Type`、`Value` 有没有多写或少写域名后缀。

你也可以在本地检查 DNS 是否大致生效：

```powershell
$env:MAIL_DOMAIN="example.com"
$env:MAIL_SUBDOMAIN="auth.example.com"
$env:SITE_DOMAIN="www.example.com"
npm run verify:mail-dns
```

如果只是先做邮件，`SITE_DOMAIN` 可以不设；脚本会把网站自定义域名 CNAME 当作可选项。

### 4. 创建 Resend API key

1. 在 Resend 进入 `API Keys`。
2. 创建一个新的 key。
3. 权限选择能发送邮件的权限。
4. 复制这个 API key，只保存到你的密码管理器或临时剪贴板。

不要把 Resend API key 发到 GitHub、写进 `.env`、写进前端代码，也不要放进任何 `VITE_` 变量。

## 配置 Supabase

1. 打开 Supabase Dashboard，进入当前项目。
2. 进入 `Authentication -> Providers -> Email`，保持 Email provider 启用。
3. 如果要用注册确认，保持 `Confirm email` 开启。
4. 进入 `Authentication -> Email -> SMTP Settings` 或 `Project Settings -> Authentication -> SMTP Settings`。
5. 开启 Custom SMTP，填入邮件服务商提供的 host、port、username、password、sender email、sender name。
6. 保存后回到网站注册或点击“重发确认邮件”。

如果你用 Resend + `auth.example.com`，Supabase 里填：

```text
Enable custom SMTP = on
Sender email       = noreply@auth.example.com
Sender name        = 个人策划档案
Host               = smtp.resend.com
Port               = 465
Username           = resend
Password           = Resend API key
```

`Confirm email` 建议保持开启。这样访客评论账号需要真实邮箱确认，站主账号也更安全。

Supabase 的 `Site URL` 和 redirect URL 要包含线上站点：

```text
https://hedongshi8-sketch.github.io/personal-archive-site/
```

如果后台同时要求允许域名，也加入：

```text
https://hedongshi8-sketch.github.io
```

## 本地先测 SMTP 服务商

在 PowerShell 里只给当前终端设置变量：

```powershell
$env:SMTP_HOST="smtp.example.com"
$env:SMTP_PORT="587"
$env:SMTP_SECURE="false"
$env:SMTP_USER="your-smtp-user"
$env:SMTP_PASS="your-smtp-password"
$env:SMTP_FROM="个人策划档案 <noreply@example.com>"
$env:SMTP_TO="hedongshi8@gmail.com"
npm run verify:smtp
```

看到这些结果才说明 SMTP 本身可用：

```text
PASS server greeting
PASS EHLO
PASS STARTTLS
PASS EHLO over TLS
PASS SMTP authentication
PASS MAIL FROM
PASS RCPT TO
PASS DATA
PASS test email accepted
PASS SMTP connection, authentication, and test email send completed
```

如果 `verify:smtp` 通过，但网站注册仍收不到邮件，优先检查 Supabase 的 SMTP Settings 是否保存成功，以及 Auth 邮件模板里的 redirect URL 是否被允许。

## 再测 Supabase 是否真的发确认邮件

SMTP 服务商测通后，再验证 Supabase Auth 是否真的用它发确认邮件：

```powershell
$env:AUTH_EMAIL_TO="hedongshi8@gmail.com"
npm run verify:auth-email
```

脚本默认只触发一次新的注册确认邮件，避免立刻重发时撞上 Supabase 的安全冷却时间。如果你要专门测试“重发确认邮件”，等冷却时间结束后再加：

```powershell
$env:AUTH_EMAIL_RESEND="true"
npm run verify:auth-email
```

如果你担心注册测试账号污染用户列表，可以改用密码重置邮件验证：

```powershell
$env:PASSWORD_RESET_EMAIL_TO="hedongshi8@gmail.com"
npm run verify:password-reset-email
```

这个命令不会创建新账号，适合验证已经注册过的站主邮箱能不能收到 Supabase Auth 邮件。

只有当你显式设置 `AUTH_EMAIL_USE_ALIAS=true` 时，注册确认脚本才会用当前 `.env` 里的 Supabase 项目创建一个加号别名测试注册邮箱，例如：

```text
hedongshi8+auth-test-20260619223000@gmail.com
```

Gmail 会把这个 plus alias 邮件投到 `hedongshi8@gmail.com`。如果你能收到 Supabase 的确认邮件，说明 Supabase Auth -> Custom SMTP -> 收件箱这条链路已经通了。

测试完成后，可以去 Supabase `Authentication -> Users` 删除这个 `+auth-test-...` 测试用户。

## 排障

- 一直收不到邮件：先查垃圾箱、广告箱、邮件服务商 activity/logs、Supabase Auth logs。
- 点重发也没用：默认 Supabase 邮件服务有严格频率限制，改 Custom SMTP 后再试。
- SMTP authentication 失败：username/password 填错，或服务商要求专用 SMTP 密码/API key。
- RCPT TO 失败：收件人被服务商测试模式限制，先把 `hedongshi8@gmail.com` 加到服务商的 verified recipients。
- 邮件进垃圾箱：绑定正式域名，完成 SPF、DKIM、DMARC。
