# 我的修仙日常 Godot2D 像素资产竖切Demo

## 当前状态

本轮 `REV-20260804-12` 继续在现有 Godot 工程上做高质量像素开放小区域重做，目标是让默认画面更像单机像素游戏，而不是测试页。

## 打开方式

```powershell
& 'E:\Godot_v4.7-stable_win64.exe\Godot_v4.7-stable_win64.exe' --path 'E:\Demo验收\workspace\Demo工程\P-20260802-我的修仙日常_Godot2D像素资产竖切Demo'
```

如果系统已配置 `godot`，也可以在工程目录执行：

```powershell
godot --path .
```

## 操作

- `WASD` / 方向键：移动
- `E`：互动
- `Q`：元神出窍 / 归窍
- `J`：修行札记
- `T`：符箓匣
- `I`：行囊
- `M`：地图
- `L`：关系录 / 传音札
- `F3`：DebugOverlay
- `Esc`：关闭菜单
- `R`：仅在 DebugOverlay 开启时重置

## 视觉说明

- 默认画面已移除右上角整张资源图集。
- 玩家、NPC、环境、机关、资源点使用不同像素切片和颜色层次。
- 默认 HUD 保持克制，没有变量总账，也没有常驻已解锁列表。
- 2026-08-05 追加升级依据了本地 GitHub 游戏制作 skills：`godot`、`godot-tilemap`、`godot-animation`、`godot-shaders`、`level-design`、`game-feel`、`camera-systems`、`game-ui-ux`。
- 本轮按 `level-design` 先组织入口、生活焦点、神秘焦点、路径和留白；按 `godot-tilemap` 的分层原则使用 `GroundLayer / TransitionLayer / PathLayer / DecorLayer / OcclusionYSortLayer / VFXLayer` 做可验证分层；按 `camera-systems` 增加 Camera2D 取景；按 `godot-animation` / `game-feel` 增加轻微循环动效；按 `game-ui-ux` 保持 HUD 克制。

## 证据路径

- 默认玩家画面截图：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_开放小区域_默认画面截图.png`
- 开放入口证据截图：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_开放小区域_入口证据截图.png`
- v6 默认画面截图：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_高级竖切Demo_默认画面.png`
- v6 显形前后截图：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_高级竖切Demo_显形前后.png`
- v6 爆炸前后截图：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_高级竖切Demo_爆炸前后.png`
- v6 元神传音截图：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_高级竖切Demo_元神传音.png`
- v6 逐帧证据：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_高级竖切Demo_逐帧证据\`
- QA 报告：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_高质量像素开放小区域_QA报告.md`
- 测试用例：`E:\Demo验收\workspace\产物\P-20260802-我的修仙日常_高质量像素开放小区域_测试用例.xlsx`

## 资产

继续使用 Kenney Tiny Dungeon 的 CC0 像素资产与本地切片，不引入新的外部美术来源。
