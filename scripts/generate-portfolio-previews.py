from __future__ import annotations

import json
import re
from datetime import date, datetime
from pathlib import Path
from typing import Any

from docx import Document
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P
from docx.table import Table
from docx.text.paragraph import Paragraph
from openpyxl import load_workbook


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
ASSETS = PUBLIC / "portfolio-assets"
OUT = PUBLIC / "portfolio-previews"

MAX_EXCEL_ROWS = 160
MAX_EXCEL_COLS = 40
MAX_DOCUMENT_BLOCKS = 180
MAX_TABLE_ROWS = 80
MAX_TABLE_COLS = 16


def public_path(path: Path) -> str:
    return path.relative_to(PUBLIC).as_posix()


def slug(value: str) -> str:
    normalized = re.sub(r"\s+", "-", value.strip().lower())
    normalized = re.sub(r"[^\w\-\u4e00-\u9fff]+", "-", normalized)
    normalized = re.sub(r"-{2,}", "-", normalized).strip("-")
    return normalized or "sheet"


def format_value(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.strftime("%Y-%m-%d %H:%M")
    if isinstance(value, date):
        return value.strftime("%Y-%m-%d")
    if isinstance(value, float):
        if value.is_integer():
            return str(int(value))
        return f"{value:.6g}"
    return str(value).replace("\r\n", "\n").replace("\r", "\n").strip()


def trim_matrix(rows: list[list[str]]) -> list[list[str]]:
    while rows and all(not cell for cell in rows[-1]):
        rows.pop()

    if not rows:
        return []

    last_col = 0
    for row in rows:
        for index, cell in enumerate(row):
            if cell:
                last_col = max(last_col, index + 1)

    return [row[:last_col] for row in rows]


def read_text(path: Path) -> str:
    for encoding in ("utf-8", "utf-8-sig", "gb18030"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    return path.read_text(encoding="utf-8", errors="replace")


def write_json(relative_path: str, payload: dict[str, Any]) -> None:
    target = OUT / relative_path
    target.parent.mkdir(parents=True, exist_ok=True)
    payload["generatedAt"] = datetime.now().strftime("%Y-%m-%d")
    target.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"wrote {target.relative_to(ROOT)}")


def build_excel_preview(item_id: str, title: str, sources: list[Path]) -> None:
    sheets: list[dict[str, Any]] = []

    for source in sources:
        workbook = load_workbook(source, read_only=True, data_only=False)
        try:
            for worksheet in workbook.worksheets:
                max_row = min(worksheet.max_row or 0, MAX_EXCEL_ROWS)
                max_col = min(worksheet.max_column or 0, MAX_EXCEL_COLS)
                if max_row <= 0 or max_col <= 0:
                    continue

                rows = [
                    [format_value(value) for value in row]
                    for row in worksheet.iter_rows(
                        min_row=1,
                        max_row=max_row,
                        min_col=1,
                        max_col=max_col,
                        values_only=True,
                    )
                ]
                rows = trim_matrix(rows)
                if not rows:
                    continue

                sheets.append(
                    {
                        "id": slug(f"{source.stem}-{worksheet.title}"),
                        "workbookName": source.name,
                        "sheetName": worksheet.title,
                        "rowCount": worksheet.max_row,
                        "columnCount": worksheet.max_column,
                        "truncatedRows": (worksheet.max_row or 0) > MAX_EXCEL_ROWS,
                        "truncatedColumns": (worksheet.max_column or 0) > MAX_EXCEL_COLS,
                        "cells": rows,
                    }
                )
        finally:
            workbook.close()

    write_json(
        f"{item_id}.json",
        {
            "kind": "excel",
            "title": title,
            "sourceFiles": [public_path(source) for source in sources],
            "sheetCount": len(sheets),
            "rowLimit": MAX_EXCEL_ROWS,
            "columnLimit": MAX_EXCEL_COLS,
            "sheets": sheets,
        },
    )


def iter_docx_blocks(document: Document):
    for child in document.element.body.iterchildren():
        if isinstance(child, CT_P):
            yield Paragraph(child, document)
        elif isinstance(child, CT_Tbl):
            yield Table(child, document)


def paragraph_block(paragraph: Paragraph) -> dict[str, Any] | None:
    text = paragraph.text.strip()
    if not text:
        return None

    style_name = paragraph.style.name if paragraph.style is not None else ""
    if style_name.startswith("Heading"):
        match = re.search(r"(\d+)", style_name)
        return {
            "type": "heading",
            "level": int(match.group(1)) if match else 2,
            "text": text,
        }

    if style_name in {"Title", "Subtitle"}:
        return {"type": "heading", "level": 1 if style_name == "Title" else 2, "text": text}

    return {"type": "paragraph", "text": text}


def table_block(table: Table) -> dict[str, Any] | None:
    rows: list[list[str]] = []
    for row in table.rows[:MAX_TABLE_ROWS]:
        cells = [cell.text.strip().replace("\r", "\n") for cell in row.cells[:MAX_TABLE_COLS]]
        rows.append(cells)

    rows = trim_matrix(rows)
    if not rows:
        return None

    return {
        "type": "table",
        "rowCount": len(table.rows),
        "columnCount": len(table.columns),
        "truncatedRows": len(table.rows) > MAX_TABLE_ROWS,
        "truncatedColumns": len(table.columns) > MAX_TABLE_COLS,
        "rows": rows,
    }


def build_docx_preview(item_id: str, title: str, source: Path) -> None:
    document = Document(source)
    blocks: list[dict[str, Any]] = []

    for block in iter_docx_blocks(document):
        next_block = table_block(block) if isinstance(block, Table) else paragraph_block(block)
        if next_block:
            blocks.append(next_block)
        if len(blocks) >= MAX_DOCUMENT_BLOCKS:
            break

    write_json(
        f"{item_id}.json",
        {
            "kind": "document",
            "title": title,
            "sourceFile": public_path(source),
            "blockLimit": MAX_DOCUMENT_BLOCKS,
            "truncatedBlocks": len(blocks) >= MAX_DOCUMENT_BLOCKS,
            "blocks": blocks,
        },
    )


def build_text_preview(item_id: str, title: str, source: Path, kind: str) -> None:
    write_json(
        f"{item_id}.json",
        {
            "kind": kind,
            "title": title,
            "sourceFile": public_path(source),
            "content": read_text(source),
        },
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    build_excel_preview(
        "barbarq-main-sheet",
        "菇霸争夺战配置表",
        [ASSETS / "barbarq" / "sheets" / "野蛮人大作战2-菇霸争夺战.xlsx"],
    )
    build_excel_preview(
        "barbarq-related-sheet",
        "菇霸争夺战相关表格",
        [ASSETS / "barbarq" / "sheets" / "野蛮人大作战2-菇霸争夺战相关表格.xlsx"],
    )
    build_excel_preview(
        "barbarq-art-sheet",
        "菇霸争夺战美术需求表",
        [ASSETS / "barbarq" / "sheets" / "野蛮人大作战2-菇霸争夺战部分美术需求.xlsx"],
    )
    build_excel_preview(
        "system-planner-war-sheet",
        "战意 / 骑砍2 / 全面战争系统拆解案",
        [ASSETS / "system-planner" / "sheets" / "系统策划拆解案_战意_骑砍2_全面战争.xlsx"],
    )
    build_excel_preview(
        "game-town-config-sheets",
        "游戏小镇系统配置表合集",
        sorted((ASSETS / "game-town" / "sheets").glob("*.xlsx")),
    )

    build_docx_preview(
        "game-town-design-doc",
        "游戏小镇方案完善版",
        ASSETS / "game-town" / "docs" / "游戏小镇方案V_0.2完善版(1).docx",
    )
    build_text_preview(
        "game-town-prototype-readme",
        "游戏小镇原型说明",
        ASSETS / "game-town" / "docs" / "README-原型说明.md",
        "markdown",
    )
    build_text_preview(
        "game-town-expanded-design",
        "游戏小镇方案补全文档",
        ASSETS / "game-town" / "docs" / "游戏小镇方案补全文档.md",
        "markdown",
    )
    build_text_preview(
        "system-planner-submission-note",
        "系统策划投递说明",
        ASSETS / "system-planner" / "notes" / "投递说明_只看这个.txt",
        "text",
    )


if __name__ == "__main__":
    main()
