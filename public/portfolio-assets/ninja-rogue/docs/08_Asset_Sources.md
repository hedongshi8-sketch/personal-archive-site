# 08 第三方占位素材来源与授权边界

## 使用目的

当前 demo 的主视觉仍然是原创 2D 水墨占位图：宣纸底、山雾、墨痕地面、门、祭坛、障碍和大部分角色/武器图标均由 Unity 生成器程序化生成。

为了解决“角色和武器完全不像游戏资产”的问题，demo 局部引入了相近忍者题材第三方素材作为图标衍生来源，只用于作品集原型的视觉占位，不作为《忍者必须死3》正式资源，不冒充官方资产。

## 已引入素材

| 来源 | 本地路径 | 用途 | 处理方式 |
|---|---|---|---|
| pixel-boy / NinjaAdventure GitHub 镜像 | `Assets/External/NinjaAdventure/ninja_blue_sheet.png` | 角色图标衍生 | 裁切单帧、缩放、元素色染色、叠加原创水墨剪影 |
| pixel-boy / NinjaAdventure GitHub 镜像 | `Assets/External/NinjaAdventure/samurai_blue_sheet.png` | 角色图标衍生 | 裁切单帧、缩放、元素色染色、叠加原创水墨剪影 |
| pixel-boy / NinjaAdventure GitHub 镜像 | `Assets/External/NinjaAdventure/samurai_green_sheet.png` | 角色图标衍生 | 裁切单帧、缩放、元素色染色、叠加原创水墨剪影 |
| pixel-boy / NinjaAdventure GitHub 镜像 | `Assets/External/NinjaAdventure/weapon_*.png` | 武器图标衍生 | 放入原创圆形图标底，元素色染色，仅作试放图标 |

## 来源链接

- Itch 页面：`https://pixel-boy.itch.io/ninja-adventure-asset-pack`
- GitHub 镜像：`https://github.com/pixel-boy/NinjaAdventure`
- Creative Commons CC0 说明：`https://creativecommons.org/publicdomain/zero/1.0/`

## 授权核验口径

素材选择时以 Itch 页面标识的开放授权为依据；但当前 GitHub 镜像本地克隆后未发现独立 `LICENSE` 文件，因此正式投递前建议保留 Itch 页面授权截图或直接替换为 100% 自制图标。

本项目不会使用以下资源：

- 《忍者必须死3》客户端拆包资源。
- 《忍者必须死3》官方商用角色图、武器图、UI、字体、特效、音频。
- 《Skul: The Hero Slayer》商用美术、音频、字体或素材。
- 未能确认授权的 fan rip、资源站重传包、商店截图直接裁切图。

## 面试说明建议

如果面试官问到素材，可以这样说：

“这个作品集的重点是系统策划和可落地原型。我没有使用忍三或 Skul 的商业素材。为了让 demo 比纯几何占位更接近游戏感，我使用了相近忍者题材的第三方占位素材做图标衍生，并在文档里保留来源和授权边界。正式公司项目会接入内部授权资产库，当前配表里的 `source_mapping` 字段就是为这个替换流程预留的。”
