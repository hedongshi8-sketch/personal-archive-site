# 书摘种子维护

默认书摘放在 `src/data/siteData.ts` 的 `readingNotes`，会作为公开基础库显示。线上 Supabase 有数据时，前端会优先显示线上条目，再补齐静态基础库里缺失的条目；已知旧版“短摘”种子会在前端替换成新版要点摘记，避免线上旧数据继续污染公开页面。

如果想把这批书摘变成“站主可在线编辑/删除”的线上数据：

1. 确认站主邮箱已经注册，并且 `supabase/set-owner.sql` 已经跑过。
2. 打开 Supabase SQL Editor。
3. 粘贴并运行 `supabase/seed-reading-notes.sql` 的完整内容。
4. 回到 VS Code 运行：

```bash
npm run verify:reading-seeds
npm run verify:reading-owner-flow
```

当前本地书籍来源路径：

`D:\BaiduNetdiskDownload\L850\游戏设计合集1`

本轮已用可抽取文本或目录结构核对过的书：

- `体验引擎 游戏设计全景探秘 (（美）TynanSylvester著).epub`
- `大师谈游戏设计：创意与节奏 (图灵程序设计丛书) (吉泽秀雄).epub`
- `平衡掌控者——游戏数值战斗设计 (似水无痕 [似水无痕]).epub`
- `凭什么让你充值：一个游戏策划的自我修养（知乎 氪老师 作品）.epub`
- `游戏改变世界：游戏化如何让现实变得更美好 = Reality is Broken...epub`
- `Unity游戏开发（原书第3版） (迈克·吉格 Mike Geig).epub`

摘入规则：

- 页面统一使用 `要点摘记`，表示从本地 EPUB 文本层、目录和章节结构里提炼的策划方法点，不逐字搬运大段原文。
- `reflection` 写成 `策划用法`，用于说明这条阅读材料怎么转化成作品集、Demo、配表或关卡设计动作。
- 扫描版 PDF 如果普通文字层抽不出来，不能硬写成“原文摘录”；等 OCR 或可读版本确认后再追加。
- 不再使用“游戏玩法应该一直琢磨”这类空泛短句作为公开书摘。

在 `D:\BaiduNetdiskDownload\L850\游戏设计合集1` 及其子目录里暂时没有找到明确名为 `游戏心理学` 或 `社会心理学` 的文件，所以没有伪造这两本的书摘；之后拿到 PDF 再追加。
