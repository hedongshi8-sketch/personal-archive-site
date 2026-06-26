# 书摘种子维护

默认书摘放在 `src/data/siteData.ts` 的 `readingNotes`，会作为公开基础库显示。线上 Supabase 有数据时，前端会优先显示线上条目，再补齐静态基础库里缺失的条目。

如果想把这批书摘变成“站主可在线编辑/删除”的线上数据：

1. 确认站主邮箱已经注册，并且 `supabase/set-owner.sql` 已经跑过。
2. 打开 Supabase SQL Editor。
3. 粘贴并运行 `supabase/seed-reading-notes.sql` 的完整内容。
4. 回到 VS Code 运行：

```bash
npm run verify:reading-seeds
npm run verify:reading-owner-flow
```

当前已定位并放入基础库的书：

- `通关！游戏设计之道（第2版）`
- `游戏设计艺术（第2版）`
- `游戏设计基础`
- `体验引擎：游戏设计全景探秘`
- `游戏机制：高级游戏设计技术`
- `游戏设计入门：理解玩家思维`
- `游戏情感设计：如何触动玩家的心灵`

摘入规则：

- `短摘` 表示从 PDF 文字层或 OCR 识别文本中截取的极短片段。
- `目录摘记` 表示源文件正文主要是图片页，当前只从 EPUB 目录/大纲中抽取方法索引，不冒充原文段落。
- `reflection` 统一留空，所以这批不是书评，只是阅读素材入口。

在 `D:\BaiduNetdiskDownload\L850\游戏设计合集1` 及其子目录里暂时没有找到明确名为 `游戏心理学` 或 `社会心理学` 的文件，所以没有伪造这两本的书摘；之后拿到 PDF 再追加。
