import {
  Archive,
  Gamepad2,
  Headphones,
  Images,
  LockKeyhole,
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
};

export type Playlist = {
  title: string;
  count: number;
  tile: number;
};

export type GalleryItem = {
  title: string;
  category: string;
  tile: number;
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
  visibility: "private" | "draft";
};

export const navItems: NavItem[] = [
  { id: "home", label: "首页", icon: Sparkles },
  { id: "docs", label: "我的策划档案", icon: Archive },
  { id: "demos", label: "游戏 Demo", icon: Gamepad2 },
  { id: "music", label: "音乐雷达", icon: Headphones },
  { id: "gallery", label: "灵感图库", icon: Images },
  { id: "private", label: "私密发帖", icon: LockKeyhole },
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
    title: "《遗落回声》",
    description: "叙事解谜 Demo",
    platform: "PC",
    duration: "18:24",
    tile: 0,
  },
  {
    title: "《小镇奇谭》",
    description: "模拟经营原型",
    platform: "Web",
    duration: "12:07",
    tile: 1,
  },
  {
    title: "《超载协议》",
    description: "战术动作原型",
    platform: "PC",
    duration: "09:31",
    tile: 2,
  },
];

export const playlists: Playlist[] = [
  { title: "Game OST 精选", count: 24, tile: 3 },
  { title: "氛围 / 电子 / 概念", count: 31, tile: 4 },
  { title: "战斗时刻", count: 18, tile: 2 },
  { title: "故检与坍塌", count: 27, tile: 7 },
];

export const galleryItems: GalleryItem[] = [
  { title: "水城废墟", category: "场景", tile: 4 },
  { title: "峡谷机关", category: "场景", tile: 0 },
  { title: "旅者草图", category: "角色", tile: 5 },
  { title: "雨巷灯火", category: "氛围", tile: 6 },
  { title: "边境山脉", category: "概念", tile: 7 },
  { title: "模块化建筑", category: "UI/界面", tile: 8 },
];

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
    id: "private-seed",
    title: "下一轮更新清单",
    body: "整理 Demo 下载入口、补充 3 份策划 PDF、把留言墙接到真实数据库。",
    createdAt: "2026-06-16 12:00",
    visibility: "private",
  },
];

export const backendRoadmap = [
  "Supabase Auth：只允许站主进入私密发帖区",
  "Postgres + RLS：公开评论可读写，私密帖子仅 owner 可见",
  "对象存储：上传策划 PDF、Demo 包、图片收藏原图",
  "Edge Functions：评论审核、邮件通知、Webhook 自动发布",
];

export const ownerActions = [
  { label: "发布想法", icon: Send },
  { label: "上传图片", icon: Images },
  { label: "嵌入代码", icon: Archive },
  { label: "待办清单", icon: LockKeyhole },
];
