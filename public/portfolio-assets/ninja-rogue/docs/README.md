# Ninja Rogue Mode Prototype

项目名：`忍者秘境：影替试炼`

这是一个面向“游戏系统策划秋招投递”的作品集工程。主题是为《忍者必须死3》构想一个限时肉鸽活动：以《Skul: The Hero Slayer》的“双角色/头骨切换、门奖励分支、随机构筑成长”为参考，将头骨位映射为忍三角色位，将装备/道具位映射为忍三武器位。Unity demo 已改为中文 2D 横版水墨占位版，并加入角色/武器/关卡差分、单跑道上下切位、左武器门、中央关底祭坛、右角色门和角色面板。

## Quick Start

1. 用 Unity `2022.3.62f3c1` 打开 `E:\u3d project\NinjaRogueModePrototype`。
2. 菜单点击 `Ninja Rogue > Generate Demo Scene`。
3. 打开 `Assets/Scenes/NinjaRogueMode_Demo.unity`。
4. 按 Play 试玩。

## Demo Controls

- `A/D`: 横向移动
- `W/S`: 在单条跑道内上下切换身位
- `Space`: 跳跃
- `Shift`: 冲刺
- `Tab`: 在已拥有角色之间切换
- `J`: 试放当前武器，查看不同武器的视觉差分
- `E`: 在门旁进入奖励门
- `1/2/3`: 选择奖励
- `Esc`: 跳过奖励
- `R`: 重开随机种子

## Deliverables

- `Docs/01_Idea_Pitch.md`: 活动点子的提出与立项逻辑
- `Docs/02_Game_Design_Proposal.md`: 系统策划案
- `Docs/03_PRD.md`: PRD 与验收口径
- `Docs/04_Art_Request_Document.md`: 美术需求文档
- `Docs/05_Implementation_Plan.md`: Demo 到落地的开发计划
- `Docs/06_Portfolio_Delivery_Guide.md`: 投递包装与面试讲述
- `Docs/07_Research_Notes.md`: 竞品拆解与资料来源
- `Docs/08_Asset_Sources.md`: 第三方占位素材来源与授权边界
- `Tables/*.csv`: 可直接给 Excel/Unity/程序使用的配表源
- `Assets/Resources/Config/ninja_rogue_catalog.json`: Unity demo 运行时配置
- `Assets/Editor/NinjaRogueSceneBuilder.cs`: 一键生成 demo 场景

## Asset Policy

本作品集只做系统能力证明，不下载、不扒取、不传播《忍者必须死3》商业美术资源。当前 demo 使用原创水墨占位图，并局部引入相近忍者题材第三方占位素材做角色/武器图标衍生；提交前需要保留来源说明和授权核验记录。若后续拿到官方授权或个人合法素材包，可以把 `source_mapping` 字段替换为真实角色/武器/图标 ID。
