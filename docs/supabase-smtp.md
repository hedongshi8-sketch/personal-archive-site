# Supabase SMTP 邮件配置

Supabase 默认邮件服务只适合测试。正式站点要稳定发送注册确认邮件、重发确认邮件和未来的密码重置邮件，需要在 Supabase Auth 里配置 Custom SMTP。

官方参考：

- Supabase Custom SMTP：https://supabase.com/docs/guides/auth/auth-smtp
- Supabase Auth Rate Limits：https://supabase.com/docs/guides/auth/rate-limits

## 推荐方案：Resend

优先用 Resend。Resend 官方有 Supabase SMTP 集成说明，需要 Resend API key 和 verified domain。

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

## 配置 Supabase

1. 打开 Supabase Dashboard，进入当前项目。
2. 进入 `Authentication -> Providers -> Email`，保持 Email provider 启用。
3. 如果要用注册确认，保持 `Confirm email` 开启。
4. 进入 `Authentication -> Email -> SMTP Settings` 或 `Project Settings -> Authentication -> SMTP Settings`。
5. 开启 Custom SMTP，填入邮件服务商提供的 host、port、username、password、sender email、sender name。
6. 保存后回到网站注册或点击“重发确认邮件”。

Supabase 的 `Site URL` 和 redirect URL 要包含线上站点：

```text
https://hedongshi8-sketch.github.io/personal-archive-site/
```

如果后台同时要求允许域名，也加入：

```text
https://hedongshi8-sketch.github.io
```

## 本地先测 SMTP

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

## 排障

- 一直收不到邮件：先查垃圾箱、广告箱、邮件服务商 activity/logs、Supabase Auth logs。
- 点重发也没用：默认 Supabase 邮件服务有严格频率限制，改 Custom SMTP 后再试。
- SMTP authentication 失败：username/password 填错，或服务商要求专用 SMTP 密码/API key。
- RCPT TO 失败：收件人被服务商测试模式限制，先把 `hedongshi8@gmail.com` 加到服务商的 verified recipients。
- 邮件进垃圾箱：绑定正式域名，完成 SPF、DKIM、DMARC。
