# 07 竞品拆解与资料来源

## 已核验资料入口

- 忍者必须死3 BWIKI 忍者页：https://wiki.biligame.com/nmd3/%E5%BF%8D%E8%80%85
- 忍者必须死3 BWIKI 武器图鉴：https://wiki.biligame.com/nmd3/%E6%AD%A6%E5%99%A8%E5%9B%BE%E9%89%B4
- 忍者必须死3 BWIKI 武器 opensearch 接口：https://wiki.biligame.com/nmd3/api.php?action=opensearch&search=%E6%AD%A6%E5%99%A8&limit=20&namespace=0&format=json
- 《Skul: The Hero Slayer》Steam 页面：https://store.steampowered.com/app/1147560/Skul_The_Hero_Slayer/
- Skul Wiki Skulls：https://skul.fandom.com/wiki/Skulls
- Skul Wiki Items：https://skul.fandom.com/wiki/Items

## 忍三可迁移结构

忍三适合承接肉鸽结构的原因：

- 局内是 2D 横版战斗跑酷，角色在单条跑道内通过上下切位、跳跃、冲刺处理障碍和攻击窗口，而不是双跑道分线。
- 角色本身已有差异化身份，适合做局内角色槽。
- 武器本身已有收集和释放记忆点，适合做局内装备槽。
- 跑酷小地图天然有起点、过程压力和终点结算。
- 活动模式可以标准化局内数值，降低长期养成对肉鸽体验的干扰。

## Skul 可借鉴结构

Skul 的核心不是“随机”本身，而是“随机给出的东西能改变身份、动作和构筑方向”。本项目借鉴的不是具体怪物、地图和技能，而是：

- 双身份槽位。
- 每房间结束后的门奖励选择。
- 装备/道具的标签化构筑。
- 章节式难度验证。
- 局内构筑与局外成长区分。

## 差异化处理

忍三不是横版动作肉鸽，因此不能直接照搬 Skul 的战斗节奏。迁移时做了三点变化：

- 将房间战斗改为短跑酷段 + 单跑道上下切位障碍压力。
- 将头骨动作组改为角色入场技能和基础手感差异。
- 将装备被动堆叠改为武器槽、主动释放和元素标签协同。

## 版权说明

公开 wiki、官网、商店页和视频只用于文字层面的竞品研究与条目结构参考。demo 不下载、不内嵌、不再分发任何忍三或 Skul 的商业图像、模型、音效、动画或字体资源。当前 Unity demo 主视觉使用原创 2D 水墨占位资源，并局部引入相近忍者题材第三方占位素材做角色/武器图标衍生；来源和授权边界见 `Docs/08_Asset_Sources.md`。正式商业项目需要使用公司内部资产库、授权包或重新制作资源。
