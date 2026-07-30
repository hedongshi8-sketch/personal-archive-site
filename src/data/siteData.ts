import {
  Archive,
  BookOpenText,
  Gamepad2,
  Headphones,
  Images,
  ListChecks,
  MessageCircle,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export type DesignDoc = {
  title: string;
  subtitle: string;
  date: string;
  tags: string[];
  tone: "paper" | "grid" | "dark" | "sketch";
};

export type GameDemo = {
  title: string;
  description: string;
  platform: string;
  duration: string;
  tile: number;
  thumbnailUrl?: string;
  prototypeUrl?: string;
  downloadUrl?: string;
  downloadLabel?: string;
  portfolioTargetId?: string;
  status?: string;
};

export type Playlist = {
  title: string;
  count: number;
  tile: number;
};

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  mood: string;
  duration: string;
  tile?: number;
  audioUrl?: string;
  coverUrl?: string;
  isBackground?: boolean;
  createdAt?: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  category: string;
  tile?: number;
  description?: string;
  imageUrl?: string;
  isCover?: boolean;
  createdAt?: string;
};

export type ReadingNote = {
  id: string;
  kind: "book" | "video";
  title: string;
  creator: string;
  sourceUrl?: string;
  coverUrl?: string;
  quote: string;
  reflection: string;
  tags: string[];
  createdAt: string;
};

export type SiteSettings = {
  brandName: string;
  brandSubtitle: string;
  heroTitle: string;
  heroDescription: string;
  siteLogoUrl?: string;
  siteAvatarUrl?: string;
  heroCoverUrl?: string;
  backgroundMusicUrl?: string;
  backgroundMusicTitle?: string;
  backgroundMusicEnabled: boolean;
  updatedAt?: string;
};

export type Comment = {
  id: string;
  author: string;
  avatar: string;
  time: string;
  body: string;
  likes: number;
};

export type OwnerPost = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  visibility: "public" | "draft";
};

export const navItems: NavItem[] = [
  { id: "home", label: "首页", icon: Sparkles },
  { id: "docs", label: "我的策划档案", icon: Archive },
  { id: "demos", label: "游戏 Demo", icon: Gamepad2 },
  { id: "music", label: "音乐雷达", icon: Headphones },
  { id: "gallery", label: "灵感图库", icon: Images },
  { id: "notes", label: "书摘心得", icon: BookOpenText },
  { id: "private", label: "站主动态", icon: Send },
  { id: "comments", label: "留言墙", icon: MessageCircle },
  { id: "contact", label: "合作与联系", icon: UserRound },
];

export const designDocs: DesignDoc[] = [
  {
    title: "《代号：碑谷之外》",
    subtitle: "世界观与核心循环",
    date: "2026-05-20",
    tags: ["世界观", "核心循环"],
    tone: "paper",
  },
  {
    title: "开放世界关卡规划手册",
    subtitle: "探索节奏与引导设计",
    date: "2026-04-11",
    tags: ["关卡设计", "开放世界"],
    tone: "grid",
  },
  {
    title: "战斗系统原型 v0.3",
    subtitle: "风险与反馈验证",
    date: "2026-04-28",
    tags: ["战斗设计", "原型"],
    tone: "dark",
  },
  {
    title: "叙事分支结构图谱",
    subtitle: "多结局与因果链",
    date: "2026-02-19",
    tags: ["叙事设计", "分支结构"],
    tone: "sketch",
  },
  {
    title: "经济系统与成长曲线",
    subtitle: "资源投放与价值感",
    date: "2026-01-30",
    tags: ["数值设计", "经济系统"],
    tone: "paper",
  },
];

export const gameDemos: GameDemo[] = [
  {
    title: "忍三 Rogue 模式",
    description: "《忍者必须死3》限时肉鸽活动 Unity demo，包含单跑道切位、分支奖励门、角色/武器构筑和可下载工程包。",
    platform: "Unity 2022.3",
    duration: "Demo 工程下载",
    tile: 0,
    thumbnailUrl: `${import.meta.env.BASE_URL}portfolio-assets/ninja-rogue/images/NinjaRogue_DemoScreenshot.png`,
    downloadUrl: `${import.meta.env.BASE_URL}portfolio-assets/ninja-rogue/archive/NinjaRogueModePrototype_UnityProject.zip`,
    downloadLabel: "下载 Unity 工程",
    portfolioTargetId: "ninja-rogue-unity-demo",
    status: "当前唯一 Demo",
  },
];

export const playlists: Playlist[] = [
  { title: "Game OST 精选", count: 24, tile: 3 },
  { title: "氛围 / 电子 / 概念", count: 31, tile: 4 },
  { title: "战斗时刻", count: 18, tile: 2 },
  { title: "故检与坍塌", count: 27, tile: 7 },
];

export const musicTracks: MusicTrack[] = [
  {
    id: "seed-sable-drift",
    title: "Sable Drift",
    artist: "Floating Points",
    mood: "氛围 / 电子 / 夜间工作",
    duration: "06:41",
    tile: 3,
    isBackground: true,
  },
  {
    id: "seed-quiet-loop",
    title: "Quiet Loop",
    artist: "Archive Radio",
    mood: "系统策划 / 专注",
    duration: "04:18",
    tile: 4,
  },
  {
    id: "seed-boss-room",
    title: "Boss Room Sketch",
    artist: "Combat Notes",
    mood: "战斗节奏 / 压迫感",
    duration: "03:52",
    tile: 2,
  },
];

export const galleryItems: GalleryItem[] = [
  { id: "seed-water-ruins", title: "水城废墟", category: "场景", tile: 4, description: "废墟、水路和探索动线参考。" },
  { id: "seed-canyon-device", title: "峡谷机关", category: "场景", tile: 0, description: "峡谷垂直空间与机关节奏。" },
  { id: "seed-traveler-sketch", title: "旅者草图", category: "角色", tile: 5, description: "角色剪影与装备层次。" },
  { id: "seed-rain-lane", title: "雨巷灯火", category: "氛围", tile: 6, description: "湿润夜景和引导光源。" },
  { id: "seed-border-range", title: "边境山脉", category: "概念", tile: 7, description: "远景地标与区域边界。" },
  { id: "seed-modular-building", title: "模块化建筑", category: "UI/界面", tile: 8, description: "组件化空间与建造反馈。" },
];

export const readingNotes: ReadingNote[] = [
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a201",
    kind: "book",
    title: "体验引擎：游戏设计全景探秘",
    creator: "Tynan Sylvester",
    quote: "要点摘记：体验不是只由机制产生，目录把事件、情感触发器、虚构层、心流、沉浸放在同一条体验链上。",
    reflection: "策划用法：做活动或关卡时，把每个机制节点拆成「事件 -> 情绪 -> 反馈」，先判断它想触发什么感受，再决定数值和表现。",
    tags: ["体验设计", "情感触发", "系统拆解"],
    createdAt: "2026-07-30",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a202",
    kind: "book",
    title: "体验引擎：游戏设计全景探秘",
    creator: "Tynan Sylvester",
    quote: "要点摘记：技巧章节把深度、无障碍、弹性挑战、训练、失败处理放在一起看，难度曲线要服务情感维持。",
    reflection: "策划用法：忍三肉鸽可以把前几房作为训练和低压试错，中段用构筑分歧拉开深度，失败后保留明确复盘线索。",
    tags: ["关卡节奏", "难度曲线", "失败反馈"],
    createdAt: "2026-07-30",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a203",
    kind: "book",
    title: "大师谈游戏设计：创意与节奏",
    creator: "吉泽秀雄",
    quote: "要点摘记：核心创意拆成主题、概念、系统，并反复追问这个创意是否让概念更好玩。",
    reflection: "策划用法：写方案时先用一句话钉住主题，再列概念卖点和系统动作；不能强化核心体验的功能先降级或删除。",
    tags: ["核心创意", "玩法表达", "方案取舍"],
    createdAt: "2026-07-30",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a204",
    kind: "book",
    title: "大师谈游戏设计：创意与节奏",
    creator: "吉泽秀雄",
    quote: "要点摘记：过关和失败画面也有节奏；过关要承接成就感，失败要推动再尝试，时长和信息量都不能拖。",
    reflection: "策划用法：Demo 里结算页不只展示分数，还要给下一局目标、构筑问题和可调整方向，让玩家愿意再跑一局。",
    tags: ["关卡节奏", "结算反馈", "再挑战"],
    createdAt: "2026-07-30",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a205",
    kind: "book",
    title: "平衡掌控者：游戏数值战斗设计",
    creator: "似水无痕",
    quote: "要点摘记：数值策划不是解数学题，而是用规则维护战斗、经济、奖励投放的整体顺畅与平衡。",
    reflection: "策划用法：配表不能只填强度，还要说明产出、消耗、成长速度和玩家感受之间的约束关系。",
    tags: ["数值设计", "经济循环", "奖励投放"],
    createdAt: "2026-07-30",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a206",
    kind: "book",
    title: "平衡掌控者：游戏数值战斗设计",
    creator: "似水无痕",
    quote: "要点摘记：Excel、公式、技能、装备、随机、战斗数据结构和模拟验证，是从设计层走到实现层的一条链路。",
    reflection: "策划用法：作品集里的配置表要让 HR 看出字段为什么存在、程序怎么读、QA 怎么验，而不是只摆一张表。",
    tags: ["Excel", "战斗公式", "配置落地"],
    createdAt: "2026-07-30",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a207",
    kind: "book",
    title: "凭什么让你充值：一个游戏策划的自我修养",
    creator: "氪老师",
    quote: "要点摘记：先制造「想要」，再讲清用途、价值参照和获取路径，装备或资源需求才会从看见变成追求。",
    reflection: "策划用法：活动奖励页要同时回答三件事：它能解决什么问题、比当前拥有的强在哪、玩家下一步去哪拿。",
    tags: ["玩家需求", "奖励展示", "商业化"],
    createdAt: "2026-07-30",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a208",
    kind: "book",
    title: "凭什么让你充值：一个游戏策划的自我修养",
    creator: "氪老师",
    quote: "要点摘记：N+1、套装属性、质变成长和保值问题，本质是在延长需求，而不是简单把数值继续抬高。",
    reflection: "策划用法：做肉鸽奖励时要避免单一最优解，用套装、流派关键件和局内质变制造多条追求线。",
    tags: ["需求延长", "构筑成长", "价值保值"],
    createdAt: "2026-07-30",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a209",
    kind: "book",
    title: "游戏改变世界：游戏化如何让现实变得更美好",
    creator: "Jane McGonigal",
    quote: "要点摘记：好游戏给玩家明确任务、主动选择的挑战和及时反馈，所以辛苦也会变成愿意投入的工作。",
    reflection: "策划用法：任务设计要让目标、当前进度、下一步反馈同时可见，玩家才会把重复行为理解成有效推进。",
    tags: ["任务设计", "即时反馈", "心流"],
    createdAt: "2026-07-30",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a210",
    kind: "book",
    title: "游戏改变世界：游戏化如何让现实变得更美好",
    creator: "Jane McGonigal",
    quote: "要点摘记：失败如果被设计得有趣，玩家会继续尝试；成功的希望本身就能成为驱动力。",
    reflection: "策划用法：失败页应给出可理解的原因、可执行的调整和下一局更接近成功的信号，别只做惩罚。",
    tags: ["失败反馈", "再挑战", "玩家动机"],
    createdAt: "2026-07-30",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a211",
    kind: "book",
    title: "Unity游戏开发（原书第3版）",
    creator: "Mike Geig",
    quote: "要点摘记：Unity 学习路径强调编辑器视图、场景导航、Game 视图测试和案例工程，原型要能运行而不只停在文档。",
    reflection: "策划用法：忍三肉鸽 Demo 放下载工程比放静态原型图更有说服力，HR 至少能看到可运行资产、脚本和配置结构。",
    tags: ["Unity", "原型验证", "Demo工程"],
    createdAt: "2026-07-30",
  },
];

export const defaultSiteSettings: SiteSettings = {
  brandName: "LinX",
  brandSubtitle: "游戏策划 / 关卡设计",
  heroTitle: "这里不只是一座策划档案馆。",
  heroDescription: "这是我的个人网站：作品、Demo、音乐、图片、书摘、灵感和阶段性更新都会慢慢放进来。HR 可以快速看作品，朋友也可以登录留言。",
  siteLogoUrl: undefined,
  siteAvatarUrl: undefined,
  heroCoverUrl: undefined,
  backgroundMusicTitle: "Sable Drift",
  backgroundMusicEnabled: false,
  updatedAt: "2026-06-19",
};

export const seedComments: Comment[] = [
  {
    id: "seed-echo",
    author: "Echo_7",
    avatar: "E",
    time: "昨天 23:14",
    body: "《遗落回声》的氛围和叙事节奏很棒，避难与环境的结合自然又克制，期待完整版！",
    likes: 3,
  },
  {
    id: "seed-walker",
    author: "GameWalker",
    avatar: "G",
    time: "前天 18:02",
    body: "关卡规划手册里的节奏曲线图太实用了，能否分享一下开放世界的引导设计思路？",
    likes: 2,
  },
  {
    id: "seed-star",
    author: "星海计划",
    avatar: "星",
    time: "3 天前",
    body: "音乐品味很对味！特别喜欢你歌单里的氛围电子，求推荐更多类似曲目～",
    likes: 1,
  },
];

export const seedOwnerPosts: OwnerPost[] = [
  {
    id: "owner-update-seed",
    title: "下一轮更新清单",
    body: "整理 Demo 下载入口、补充 3 份策划 PDF、把留言墙接到真实数据库。",
    createdAt: "2026-06-16 12:00",
    visibility: "public",
  },
];

export const contactHighlights = [
  "作品集：策划案、Excel 配置、PDF、图文说明都支持站内预览",
  "游戏 Demo：当前只展示忍三 Rogue 模式，提供 Unity 工程下载和作品档案入口",
  "书摘心得：来自本地真实书籍的要点摘记、策划用法和标签会沉淀成公开阅读档案",
  "站主动态：阶段更新、想法和作品调整会保留在公开时间线",
  "留言墙：登录后可以评论、回复和点赞，我会定期查看反馈",
  "编辑权限：公开页面可浏览，内容维护入口只对站主账号开放",
];

export const ownerActions = [
  { label: "发布想法", icon: Send },
  { label: "上传图片", icon: Images },
  { label: "嵌入代码", icon: Archive },
  { label: "待办清单", icon: ListChecks },
];
