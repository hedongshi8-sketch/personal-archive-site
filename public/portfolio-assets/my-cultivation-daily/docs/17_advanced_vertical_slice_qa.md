# P-20260802-我的修仙日常 高级竖切Demo QA 报告

## 任务

- 任务ID：REV-20260804-12 追加要求
- 范围：读取 GitHub 游戏制作 skills 后继续升级 Godot 场景
- 状态：done

## 已读取 Skill

| Skill | 路径 | 本轮转化动作 |
| --- | --- | --- |
| godot | `C:\Users\36808\.codex\skills\godot\SKILL.md` | 按 Godot 4.7 工作流做脚本检查、运行和截图验证 |
| godot-tilemap | `C:\Users\36808\.codex\skills\godot-tilemap\SKILL.md` | 短期用 Node2D 分层模拟 TileMapLayer：Ground / Transition / Path / Decor / Occlusion / VFX |
| godot-animation | `C:\Users\36808\.codex\skills\godot-animation\SKILL.md` | 用代码驱动轻微循环动效和截图状态切换 |
| godot-shaders | `C:\Users\36808\.codex\skills\godot-shaders\SKILL.md` | 采用 2D 发光、轮廓和冷暖色 VFX 思路做显形/元神/传音表达 |
| level-design | `C:\Users\36808\.codex\skills\level-design\SKILL.md` | 重排入口、生活焦点、神秘焦点、路径和留白 |
| game-feel | `C:\Users\36808\.codex\skills\game-feel\SKILL.md` | 增加轻微浮动、状态变化和截图前后反馈 |
| camera-systems | `C:\Users\36808\.codex\skills\camera-systems\SKILL.md` | 增加 Camera2D 取景与平滑跟随 |
| game-ui-ux | `C:\Users\36808\.codex\skills\game-ui-ux\SKILL.md` | 保持默认 HUD 克制，避免变量表和说明堆屏 |

## 场景升级专项检查

| 检查项 | 结果 | 说明 |
| --- | --- | --- |
| 构图 | 通过 | 默认画面有入口、路径、生活焦点和神秘焦点 |
| 路径 | 通过 | 主路径从洞府/庭院引向山门、灵泉和断桥区域 |
| 地标 | 通过 | 洞府、石灯、山门、灵泉、阵眼、茶客等具备可辨识点位 |
| 前景遮挡 | 通过 | 增加 `OcclusionYSortLayer` 和前景遮挡对象 |
| 环境动效 | 通过 | VFX、交互物和角色存在轻微循环动效 |
| 光影 | 通过 | 通过局部 tint / glow sprite 表达石灯、灵泉、阵眼焦点 |
| 镜头 | 通过 | 增加 `Camera2D_FramedOpenArea` 取景，不再只是截图工具视角 |
| 交互手感 | 通过 | 截图状态覆盖默认、元神传音、显形、爆炸前后反馈 |

## 证据

- 默认画面：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_高级竖切Demo_默认画面.png`
- 显形前后：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_高级竖切Demo_显形前后.png`
- 爆炸前后：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_高级竖切Demo_爆炸前后.png`
- 元神传音：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_高级竖切Demo_元神传音.png`
- 逐帧证据：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_高级竖切Demo_逐帧证据\`

## 风险

- 短期未完整改成 Godot 原生 `TileMapLayer + TileSet` 资源；当前采用 Node2D 分层和授权切片模拟可验收层级。原因是现有工程以脚本生成 Sprite2D 为主，直接大改 TileSet 风险高，容易破坏既有玩法验证。
- 仍使用 Kenney Tiny Dungeon CC0 素材做题材近似表达，后续美术版建议补更贴合修仙日常的授权资源。
