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
  prototypeUrl?: string;
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
    title: "游戏小镇交互原型",
    description: "模拟经营长地图原型，覆盖小镇、世界地图、地域探索、背包、战斗和招募链路。",
    platform: "Web",
    duration: "可交互",
    tile: 1,
    prototypeUrl: `${import.meta.env.BASE_URL}portfolio-assets/game-town/prototype/index.html`,
    portfolioTargetId: "game-town-prototype",
    status: "真实 HTML 原型",
  },
  {
    title: "3D 战争界面原型",
    description: "系统策划投递补充原型，用于展示战斗界面信息层级、部队状态和交互排布。",
    platform: "Web",
    duration: "可交互",
    tile: 2,
    prototypeUrl: `${import.meta.env.BASE_URL}portfolio-assets/system-planner/prototypes/war-ui/index.html`,
    portfolioTargetId: "war-ui-prototype",
    status: "面试补充原型",
  },
  {
    title: "菇霸争夺战策划案",
    description: "野蛮人大作战玩法模式文档与配置表展示，适合 HR 快速查看规则、目标、节奏和配置能力。",
    platform: "PDF / Excel",
    duration: "站内预览",
    tile: 0,
    portfolioTargetId: "barbarq-design-doc",
    status: "作品集核心条目",
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
    title: "通关！游戏设计之道（第2版）",
    creator: "Scott Rogers",
    quote: "短摘：游戏玩法应该是你要一直琢磨的。",
    reflection: "",
    tags: ["玩法", "玩家体验", "设计文档"],
    createdAt: "2026-06-26",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a202",
    kind: "book",
    title: "通关！游戏设计之道（第2版）",
    creator: "Scott Rogers",
    quote: "短摘：把游戏的流程、玩法以及细节都写出来。",
    reflection: "",
    tags: ["设计文档", "表达", "卖点"],
    createdAt: "2026-06-26",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a203",
    kind: "book",
    title: "游戏设计艺术（第2版）",
    creator: "Jesse Schell",
    quote: "短摘：玩游戏的场景对游戏会产生巨大的影响。",
    reflection: "",
    tags: ["体验设计", "设计透镜", "复盘"],
    createdAt: "2026-06-26",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a204",
    kind: "book",
    title: "游戏设计艺术（第2版）",
    creator: "Jesse Schell",
    quote: "短摘：想出创意，尝试制作，不断测试和改进。",
    reflection: "",
    tags: ["玩家体验", "系统拆解", "验证"],
    createdAt: "2026-06-26",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a205",
    kind: "book",
    title: "游戏设计基础",
    creator: "Ernest Adams",
    quote: "短摘：玩家做出的决定会反映他的游戏风格。",
    reflection: "",
    tags: ["核心循环", "规则", "系统设计"],
    createdAt: "2026-06-26",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a206",
    kind: "book",
    title: "游戏设计基础",
    creator: "Ernest Adams",
    quote: "短摘：玩家非常喜欢定义自己。",
    reflection: "",
    tags: ["平衡", "数值", "选择"],
    createdAt: "2026-06-26",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a207",
    kind: "book",
    title: "体验引擎：游戏设计全景探秘",
    creator: "Tynan Sylvester",
    quote: "目录摘记：情感触发器、虚构层、心流和沉浸共同构成体验引擎。",
    reflection: "",
    tags: ["体验引擎", "事件", "叙事反馈"],
    createdAt: "2026-06-26",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a208",
    kind: "book",
    title: "游戏机制：高级游戏设计技术",
    creator: "Ernest Adams / Joris Dormans",
    quote: "短摘：你必须在长远目标和短期需求之间找到一个平衡点。",
    reflection: "",
    tags: ["机制", "反馈循环", "经济系统"],
    createdAt: "2026-06-26",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a209",
    kind: "book",
    title: "游戏设计入门：理解玩家思维",
    creator: "Zack Hiwiller",
    quote: "短摘：在游戏一开始就设计一些小回报。",
    reflection: "",
    tags: ["玩家心理", "教学", "奖励"],
    createdAt: "2026-06-26",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a210",
    kind: "book",
    title: "游戏设计入门：理解玩家思维",
    creator: "Zack Hiwiller",
    quote: "短摘：更多地赋予玩家能动性，并不一定意味着会产生更好的效果。",
    reflection: "",
    tags: ["玩家心理", "动机", "用户分层"],
    createdAt: "2026-06-26",
  },
  {
    id: "0d3fbbe3-7b0d-4b3a-9bf1-2e16e927a211",
    kind: "book",
    title: "游戏情感设计：如何触动玩家的心灵",
    creator: "Katherine Isbister",
    quote: "短摘：玩家通过游戏角色把自己和虚拟形象联系起来。",
    reflection: "",
    tags: ["游戏心理", "情感设计", "反馈"],
    createdAt: "2026-06-26",
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
  "游戏 Demo：游戏小镇和战争界面原型可以直接打开体验",
  "书摘心得：喜欢的段落、书名、心得和标签会沉淀成公开阅读档案",
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
