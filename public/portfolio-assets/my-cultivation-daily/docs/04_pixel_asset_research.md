# 《我的修仙日常》像素资产调研包

## 任务信息

- 项目ID：`P-20260802-我的修仙日常`
- 任务编号：`REV-20260802-02`
- 任务类型：asset-research
- 目标：为《我的修仙日常》寻找可直接服务生活模拟 / 修仙日常 Demo 的免费像素资产，并输出可执行资产选型方案。

## 资料可靠性说明

| 来源类型 | 作用 | 可靠性 | 备注 |
| --- | --- | --- | --- |
| 官方站 / 官方商店页 | 确认作者、许可、尺寸、文件数 | 高 | 优先作为许可依据 |
| OpenGameArt / itch.io 页面 | 确认包内容、许可、是否需要署名 | 中高 | 以页面明示文本为准 |
| 本模块推导 | 组装主推荐与备选组合 | 设计推导 | 仅用于 Demo 选型 |

## 选型原则

1. 先看许可，优先 CC0。
2. 再看内容覆盖度，优先能覆盖地形、角色、作物、洞府/室内、NPC/商店、UI 图标。
3. 再看 Godot 适配度，优先 16x16 或可统一缩放的 PNG / sprite sheet。
4. 不把“看起来免费”当成许可确认。

## 主推荐组合

### 组合名称

**A 组：CC0 生活模拟主组合**

### 组合构成

- `Top Down Adventure Assets`
- `Pixel Platformer: Farm Expansion`
- `RPG Urban Pack`
- `Pixel UI Pack`
- `CC0 Currency Icons`
- `Simple RPG Inventory Icons`

### 为什么适合

- `Top Down Adventure Assets` 提供四向主角、10 个 NPC、2 套 tileset，适合快速建立生活模拟的角色与基础场景骨架。
- `Pixel Platformer: Farm Expansion` 提供农场、作物、温室类内容，适合灵田和种植循环。
- `RPG Urban Pack` 提供 16×16、480 个文件，tags 明确包含 city / urban / character / pixel，适合村庄、商店、道路、室内泛用模块。
- `Pixel UI Pack` 和 `CC0 Currency Icons` 可以直接补齐界面、货币、背包、资源显示。
- `Simple RPG Inventory Icons` 适合补充道具、装备、背包图标。

### Godot 适配建议

- 统一导入基准为 16×16 或 32×32。
- 关闭纹理滤镜，使用像素对齐与整数缩放。
- spritesheet 直接按 2D AnimatedSprite / TileSet 拆分导入。

## 备选组合

### 备选 A：农场与角色快速起步

- `Simple Farm Tiles`
- `Farming crops 16x16`
- `16x16 8-bit RPG character set`
- `Classy Furniture`
- `CC0 Currency Icons`
- `Simple RPG Inventory Icons`

适合做最轻量的田地、作物、室内家具和基础角色原型，资源都很小，适合先搭场景再补角色。

### 备选 B：城镇与洞府优先

- `RPG Urban Pack`
- `Tiny Town`
- `Pixel UI Pack`
- `Top Down Adventure Assets`
- `Classy Furniture`

适合做洞府外圈、门派集市、商店和居民区，偏生活模拟骨架，不追求作物量。

## 资产候选表

| 组合 | 资产名称 | 来源URL | 作者 | 许可 | 是否需要署名 | 适用内容 | 下载/导入注意 | 风险 | 来源类型 | 事实/推导 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A主推 | Top Down Adventure Assets | https://opengameart.org/content/top-down-adventure-assets | ansimuz | CC0 | 不需要，署名可选 | 主角、10 NPC、2 套 tileset、基础探索地表 | 页面明示含 4 向角色和 2 tilesets；下载后按统一像素尺寸切图 | 开包内容较杂，可能需要手工筛图 | OGA | 资料事实 |
| A主推 | Pixel Platformer: Farm Expansion | https://opengameart.org/content/pixel-platformer-farm-expansion | Kenney | CC0 | 不需要，Kenney 名义署名可选 | 农场、作物、温室、田地扩展 | 页面说明有 100+ PNG tiles 和 tilesheets；适合农场/灵田 | 风格偏平台器材感，需筛选 | OGA | 资料事实 |
| A主推 | RPG Urban Pack | https://www.kenney.nl/assets/rpg-urban-pack | Kenney | CC0 | 不需要，Kenney 名义署名可选 | 村庄、道路、商店、室内、居民角色 | 16×16，480 files，适合和其他 16×16 资源拼装 | 只看页面信息，具体内容需下载后验证 | Kenney | 资料事实 |
| A主推 | Pixel UI Pack | https://www.kenney.nl/assets/pixel-ui-pack | Kenney | CC0 | 不需要，Kenney 名义署名可选 | UI 面板、按钮、背包界面 | 750 files，适合直接做 HUD | UI 风格较通用，需要做色彩统一 | Kenney | 资料事实 |
| A主推 | CC0 Currency Icons | https://opengameart.org/content/cc0-currency-icons | AntumDeluge | CC0 | 不需要 | 金币、银币、货币与资源图标 | 支持 16x16 / 24x24 / 32x32 / 64x64 | 图标风格偏通用 | OGA | 资料事实 |
| A主推 | Simple RPG Inventory Icons | https://opengameart.org/content/simple-rpg-inventory-icons | DezrasDragons | CC0 | 不需要，署名可选 | 道具、装备、库存图标 | 最宽 16px、最高 18px，适合小图标槽位 | 风格简洁，可能需要补作物/材料专用图标 | OGA | 资料事实 |
| 备选A | Simple Farm Tiles | https://opengameart.org/content/simple-farm-tiles | ChikenwingJJA | CC0 | 不需要 | 草地、农田、作物 | PNG 小体积，适合极简农场原型 | 信息量少，需要搭配其他资源 | OGA | 资料事实 |
| 备选A | Farming crops 16x16 | https://opengameart.org/content/farming-crops-16x16 | josehzz | CC0 | 不需要，署名可选 | 20 种作物、5 个生长阶段、作物头像 | 16x16，适合快速铺种植循环 | 比较像农场题材，修仙味需要后期包装 | OGA | 资料事实 |
| 备选A | 16x16 8-bit RPG character set | https://opengameart.org/content/16x16-8-bit-rpg-character-set | devurandom | CC0 | 不需要 | 基础主角 / NPC 行走帧 | 7 组站立/行走角色，NES 风格 | 人物风格很复古，需评估是否贴修仙题材 | OGA | 资料事实 |
| 备选A | Classy Furniture | https://opengameart.org/content/classy-furniture | Turnovus | CC0 | 不需要 | 桌子、床头柜、室内家具 | 适合洞府、房间、商店内部陈设 | 只有少量家具，覆盖面有限 | OGA | 资料事实 |
| 备选B | Tiny Town | https://kenney.nl/assets/tiny-town | Kenney | CC0 | 不需要 | 小镇和地图骨架 | 16×16，适合快速拼城镇轮廓 | 内容可能偏简化 | Kenney | 资料事实 |
| 备选B | Pixel UI Pack | https://www.kenney.nl/assets/pixel-ui-pack | Kenney | CC0 | 不需要 | HUD、按钮、面板 | 750 files，适合直接做 Demo UI | 与其他 Kenney 资源混搭更顺 | Kenney | 资料事实 |
| 备选B | Top Down Adventure Assets | https://opengameart.org/content/top-down-adventure-assets | ansimuz | CC0 | 不需要，署名可选 | 主角、NPC、地表、探索 | 4 向角色 + 10 NPC + 2 tilesets | 需要拆图和统一风格 | OGA | 资料事实 |

## 直接落地建议

1. Demo 先用 **A 主推组合** 搭出“洞府外圈 + 灵田 + NPC + HUD”。
2. 角色先接 `Top Down Adventure Assets`，地图先接 `RPG Urban Pack + Farm Expansion`。
3. UI 先接 `Pixel UI Pack + Currency Icons + Inventory Icons`。
4. 如果想更像“修仙”，优先在玩法文案和交互反馈上加壳，不要先追求独立定制美术。

## 不应照搬

- 不要把资源堆满后才做玩法，Demo 会变成拼贴而不是生活模拟。
- 不要混太多分辨率和风格，尤其是 16×16 和高分辨率角色图不要无脑混用。
- 不要把商店页“免费”误判为可再分发，必须看许可页或页面明示。

## 结论

对《我的修仙日常》来说，最稳的免费像素资产路径是：**CC0 + 16×16 统一基准 + 先搭生活模拟骨架**。主推荐组合已经足够覆盖地形、角色、作物、洞府/室内、NPC/商店、UI 图标这六类需求。
