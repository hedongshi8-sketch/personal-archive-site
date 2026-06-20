import type { ReadingNoteInput } from "./backendContract";

export function cleanPastedReadingText(value: string) {
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

export function parseTags(value: string) {
  return value
    .split(/[，,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseLabeledReadingLine(line: string) {
  const match = line.match(/^(书名|书籍|作品|标题|作者|来源|摘录|段落|原文|心得|评论|感想|标签|tag|tags)\s*[：:]\s*(.+)$/i);
  if (!match) {
    return null;
  }

  return {
    label: match[1].toLowerCase(),
    value: match[2].trim(),
  };
}

export function parseReadingClipboardText(value: string): Partial<ReadingNoteInput> {
  const cleanedText = cleanPastedReadingText(value);
  const lines = cleanedText.split("\n").filter(Boolean);
  const parsed: Partial<ReadingNoteInput> = {};
  const quoteLines: string[] = [];
  let activeBlock: "quote" | "reflection" | null = null;

  for (const line of lines) {
    const labeled = parseLabeledReadingLine(line);

    if (labeled) {
      if (["书名", "书籍", "作品", "标题"].includes(labeled.label)) {
        parsed.title = labeled.value.replace(/^《(.+)》$/, "$1");
        activeBlock = null;
        continue;
      }

      if (["作者", "来源"].includes(labeled.label)) {
        parsed.creator = labeled.value;
        activeBlock = null;
        continue;
      }

      if (["摘录", "段落", "原文"].includes(labeled.label)) {
        quoteLines.push(labeled.value);
        activeBlock = "quote";
        continue;
      }

      if (["心得", "评论", "感想"].includes(labeled.label)) {
        parsed.reflection = labeled.value;
        activeBlock = "reflection";
        continue;
      }

      if (["标签", "tag", "tags"].includes(labeled.label)) {
        parsed.tags = parseTags(labeled.value);
        activeBlock = null;
        continue;
      }
    }

    if (activeBlock === "reflection") {
      parsed.reflection = [parsed.reflection, line].filter(Boolean).join("\n");
      continue;
    }

    const titleMatch = line.match(/^《([^》]+)》\s*(?:[-—｜|]\s*)?(.+)?$/);
    if (titleMatch && !parsed.title) {
      parsed.title = titleMatch[1].trim();
      if (titleMatch[2]?.trim() && !parsed.creator) {
        parsed.creator = titleMatch[2].trim();
      }
      activeBlock = null;
      continue;
    }

    quoteLines.push(line);
    activeBlock = "quote";
  }

  if (quoteLines.length > 0) {
    parsed.quote = quoteLines.join("\n");
  }

  if (parsed.title) {
    parsed.kind = "book";
  }

  return parsed;
}
