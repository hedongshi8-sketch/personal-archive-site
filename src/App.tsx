import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import {
  Archive,
  ArrowRight,
  Bell,
  BookOpenText,
  Camera,
  CalendarDays,
  Check,
  Code2,
  Copy,
  Download,
  Edit3,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Heart,
  ImageIcon,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  Pause,
  PenLine,
  Play,
  Quote,
  Search,
  Send,
  ShieldCheck,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Tags,
  Trash2,
  Upload,
  Volume2,
  X,
} from "lucide-react";
import {
  contactHighlights,
  defaultSiteSettings,
  galleryItems,
  gameDemos,
  musicTracks,
  navItems,
  ownerActions,
  playlists,
  readingNotes,
  seedComments,
  seedOwnerPosts,
  type Comment,
  type GalleryItem,
  type MusicTrack,
  type OwnerPost,
  type ReadingNote,
  type SiteSettings,
} from "./data/siteData";
import {
  portfolioFilters,
  portfolioItems,
  portfolioKindLabels,
  portfolioProjectLabels,
  type PortfolioItem,
  type PortfolioKind,
  type PortfolioProject,
} from "./data/portfolioItems";
import {
  siteBackend,
  type AuthUser,
  type GalleryItemInput,
  type MusicTrackInput,
  type PortfolioItemInput,
  type ReadingNoteInput,
} from "./lib/backendContract";
import { useLocalStorage } from "./hooks/useLocalStorage";
import mediaSheet from "./assets/media-sheet.png";

const galleryFilters = ["全部", "角色", "场景", "物件", "UI/界面", "概念"];
const readingQuickTags = ["体验设计", "关卡节奏", "系统拆解", "叙事反馈", "用户心理", "经济循环"];
const githubCommentsRepo = import.meta.env.VITE_GITHUB_COMMENTS_REPO || "hedongshi8-sketch/personal-archive-site";
const localPreviewLabel = "Local Preview · 不会写入线上";

function MediaTile({
  tile,
  imageUrl,
  className,
  children,
}: {
  tile: number;
  imageUrl?: string;
  className?: string;
  children?: ReactNode;
}) {
  const x = tile % 3;
  const y = Math.floor(tile / 3);

  return (
    <div
      className={clsx("media-tile", className)}
      style={
        {
          "--media-image": `url(${imageUrl || mediaSheet})`,
          "--media-size": imageUrl ? "cover" : "300% 300%",
          "--media-x": `${x * 50}%`,
          "--media-y": `${y * 50}%`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

const sectionIds = ["home", "docs", "demos", "music", "gallery", "notes", "private", "comments", "contact"] as const;
type SectionId = (typeof sectionIds)[number];
type LoadState = "idle" | "loading" | "ready" | "error";
type HumanGateState = {
  left: number;
  right: number;
  answer: string;
  honeypot: string;
  createdAt: number;
};
type AccountDraft = {
  email: string;
  password: string;
  recoveryPassword: string;
  recoveryPasswordConfirm: string;
  username: string;
  mode: "signin" | "signup";
};

type GlobalSearchItem = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  section: SectionId;
  targetId?: string;
  query?: string;
  tokens: string;
  actionLabel: string;
};

const defaultMusicDraft: MusicTrackInput = {
  title: "",
  artist: "",
  mood: "",
  duration: "",
  audioUrl: "",
  coverUrl: "",
  isBackground: false,
};

const defaultGalleryDraft: GalleryItemInput = {
  title: "",
  category: "概念",
  description: "",
  imageUrl: "",
  isCover: false,
};

const defaultReadingDraft: ReadingNoteInput = {
  kind: "book",
  title: "",
  creator: "",
  sourceUrl: "",
  coverUrl: "",
  quote: "",
  reflection: "",
  tags: [],
};
const readingDraftStorageKey = "linx_reading_note_draft";
const readingTagDraftStorageKey = "linx_reading_note_tags";

const defaultAccountDraft: AccountDraft = {
  email: "",
  password: "",
  recoveryPassword: "",
  recoveryPasswordConfirm: "",
  username: "",
  mode: "signin",
};

type ExcelPreviewSheet = {
  id: string;
  workbookName: string;
  sheetName: string;
  rowCount: number;
  columnCount: number;
  truncatedRows: boolean;
  truncatedColumns: boolean;
  cells: string[][];
};

type ExcelPreviewData = {
  kind: "excel";
  title: string;
  sourceFiles: string[];
  sheetCount: number;
  rowLimit: number;
  columnLimit: number;
  sheets: ExcelPreviewSheet[];
};

type DocumentPreviewBlock =
  | {
      type: "heading";
      level: number;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "table";
      rowCount: number;
      columnCount: number;
      truncatedRows: boolean;
      truncatedColumns: boolean;
      rows: string[][];
    };

type DocumentPreviewData = {
  kind: "document";
  title: string;
  sourceFile: string;
  blockLimit: number;
  truncatedBlocks: boolean;
  blocks: DocumentPreviewBlock[];
};

type TextPreviewData = {
  kind: "markdown" | "text";
  title: string;
  sourceFile: string;
  content: string;
};

type StructuredPreviewData = ExcelPreviewData | DocumentPreviewData | TextPreviewData;

const portfolioProjectOptions = Object.entries(portfolioProjectLabels).map(([id, label]) => ({
  id: id as Exclude<PortfolioProject, "all">,
  label,
}));

const portfolioKindOptions = Object.entries(portfolioKindLabels).map(([id, label]) => ({
  id: id as PortfolioKind,
  label,
}));

const defaultPortfolioDraft: PortfolioItemInput = {
  project: "system-planner",
  kind: "pdf",
  title: "",
  summary: "",
  tags: [],
  publicUrl: "",
  previewUrl: "",
  sourcePath: "",
  featured: false,
};

function createHumanGate(): HumanGateState {
  return {
    left: 2 + Math.floor(Math.random() * 7),
    right: 3 + Math.floor(Math.random() * 6),
    answer: "",
    honeypot: "",
    createdAt: Date.now(),
  };
}

function checkHumanGate(gate: HumanGateState) {
  const answer = Number(gate.answer.trim());
  const spentEnoughTime = Date.now() - gate.createdAt >= 2200;
  return gate.honeypot.trim() === "" && spentEnoughTime && answer === gate.left + gate.right;
}

function parseTags(value: string) {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeSearchText(value: string) {
  return value.normalize("NFKC").trim().toLowerCase();
}

function createGlobalSearchIndex(): GlobalSearchItem[] {
  return [
    ...portfolioItems.map((item) => ({
      id: `portfolio-${item.id}`,
      title: item.title,
      eyebrow: `${item.projectLabel} · ${item.kindLabel}`,
      summary: item.summary,
      section: "docs" as const,
      targetId: item.id,
      actionLabel: "打开档案",
      tokens: [
        item.title,
        item.projectLabel,
        item.kindLabel,
        item.summary,
        item.tags.join(" "),
        item.sourcePath,
        "作品集 策划档案 文档 excel pdf demo",
      ].join(" "),
    })),
    ...gameDemos.map((demo) => ({
      id: `demo-${demo.title}`,
      title: demo.title,
      eyebrow: `${demo.platform} · ${demo.duration}`,
      summary: demo.description,
      section: "demos" as const,
      targetId: demo.title,
      actionLabel: "查看 Demo",
      tokens: [demo.title, demo.description, demo.platform, "游戏 demo 原型"].join(" "),
    })),
    ...musicTracks.map((track) => ({
      id: `music-${track.id}`,
      title: track.title,
      eyebrow: track.artist,
      summary: track.mood,
      section: "music" as const,
      targetId: track.id,
      actionLabel: "听音乐",
      tokens: [track.title, track.artist, track.mood, "音乐 歌单 背景音乐"].join(" "),
    })),
    ...galleryItems.map((item) => ({
      id: `gallery-${item.id}`,
      title: item.title,
      eyebrow: item.category,
      summary: item.description ?? "收藏图片与视觉参考。",
      section: "gallery" as const,
      query: item.category,
      actionLabel: "看图片",
      tokens: [item.title, item.category, item.description ?? "", "图片 灵感 图库 视觉参考"].join(" "),
    })),
    ...readingNotes.map((note) => ({
      id: `reading-${note.id}`,
      title: note.title,
      eyebrow: `${note.kind === "book" ? "书籍摘录" : "视频笔记"} · ${note.creator}`,
      summary: note.reflection || note.quote,
      section: "notes" as const,
      targetId: note.id,
      query: note.title,
      actionLabel: "读书摘",
      tokens: [note.title, note.creator, note.quote, note.reflection, note.tags.join(" "), "书摘 心得 阅读 笔记"].join(" "),
    })),
    ...seedOwnerPosts.map((post) => ({
      id: `post-${post.id}`,
      title: post.title,
      eyebrow: post.visibility === "public" ? "站主动态" : "站主草稿",
      summary: post.body,
      section: "private" as const,
      query: post.title,
      actionLabel: "看动态",
      tokens: [post.title, post.body, post.createdAt, "站主动态 更新 发帖"].join(" "),
    })),
  ];
}

function readingNoteToDraft(note: ReadingNote): ReadingNoteInput {
  return {
    kind: note.kind,
    title: note.title,
    creator: note.creator,
    sourceUrl: note.sourceUrl ?? "",
    coverUrl: note.coverUrl ?? "",
    quote: note.quote,
    reflection: note.reflection,
    tags: note.tags,
  };
}

function musicTrackToDraft(track: MusicTrack): MusicTrackInput {
  return {
    title: track.title,
    artist: track.artist,
    mood: track.mood,
    duration: track.duration,
    audioUrl: track.audioUrl ?? "",
    coverUrl: track.coverUrl ?? "",
    isBackground: track.isBackground ?? false,
  };
}

function galleryItemToDraft(item: GalleryItem): GalleryItemInput {
  return {
    title: item.title,
    category: item.category,
    description: item.description ?? "",
    imageUrl: item.imageUrl ?? "",
    isCover: item.isCover ?? false,
  };
}

function portfolioItemToDraft(item: PortfolioItem): PortfolioItemInput {
  return {
    project: item.project,
    kind: item.kind,
    title: item.title,
    summary: item.summary,
    tags: item.tags,
    publicUrl: item.publicUrl,
    previewUrl: item.previewUrl ?? "",
    thumbnailUrl: item.thumbnailUrl ?? "",
    sourcePath: item.sourcePath ?? "",
    featured: item.featured,
  };
}

function makeFileTitle(file: File) {
  return file.name.replace(/\.[^.]+$/, "");
}

function isLocalRuntimeHost() {
  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function getSectionFromLocation(): SectionId {
  if (typeof window === "undefined") {
    return "home";
  }

  const params = new URLSearchParams(window.location.search);
  const requested = window.location.hash.slice(1) || params.get("start");
  return sectionIds.includes(requested as SectionId) ? (requested as SectionId) : "home";
}

function getSearchNavigationTarget(section: SectionId) {
  if (typeof window === "undefined" || window.location.hash.slice(1) !== section) {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get("fromSearch") !== "1") {
    return null;
  }

  return {
    query: params.get("search") ?? "",
    targetId: params.get("target") ?? "",
  };
}

function useSearchNavigationTarget(section: SectionId) {
  const [target, setTarget] = useState(() => getSearchNavigationTarget(section));

  useEffect(() => {
    function syncTarget() {
      setTarget(getSearchNavigationTarget(section));
    }

    window.addEventListener("hashchange", syncTarget);
    window.addEventListener("popstate", syncTarget);
    return () => {
      window.removeEventListener("hashchange", syncTarget);
      window.removeEventListener("popstate", syncTarget);
    };
  }, [section]);

  return target;
}

function isPasswordRecoveryUrl() {
  if (typeof window === "undefined") {
    return false;
  }

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  return hashParams.get("type") === "recovery" || searchParams.get("type") === "recovery";
}

function clearPasswordRecoveryUrl() {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl = new URL(window.location.href);
  nextUrl.hash = "";
  nextUrl.searchParams.delete("type");
  window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}`);
}

function Sidebar({
  activeSection,
  settings,
  onToggleTheme,
}: {
  activeSection: SectionId;
  settings: SiteSettings;
  onToggleTheme: () => void;
}) {
  return (
    <aside className="sidebar" aria-label="主导航">
      <a className="brand" href="#home">
        <div className="brand-mark" aria-hidden="true">
          <span />
        </div>
        <div>
          <strong>{settings.brandName}</strong>
          <small>{settings.brandSubtitle}</small>
        </div>
      </a>

      <nav className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <a
              className={clsx("nav-link", activeSection === item.id && "active")}
              href={`#${item.id}`}
              key={item.id}
              aria-current={activeSection === item.id ? "page" : undefined}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="focus-state">
          <span className="pulse-dot" />
          <span>专注模式</span>
        </div>
        <div className="clock-copy">深夜 01:37</div>
        <div className="utility-row">
          <button onClick={onToggleTheme} type="button" aria-label="切换夜间模式">
            <Moon size={18} />
          </button>
          <a href="#home" aria-label="回到首页">
            <Code2 size={18} />
          </a>
          <a href="#docs" aria-label="上传内容">
            <Upload size={18} />
          </a>
        </div>
      </div>
    </aside>
  );
}

function MobileNav({ activeSection, settings }: { activeSection: SectionId; settings: SiteSettings }) {
  return (
    <div className="mobile-nav-strip" aria-label="移动端导航">
      <a className="mobile-brand" href="#home">
        <Menu size={18} />
        <span>{settings.brandName}</span>
      </a>
      <nav>
        {navItems.slice(1, 8).map((item) => (
          <a
            className={clsx(activeSection === item.id && "active")}
            href={`#${item.id}`}
            key={item.id}
            aria-current={activeSection === item.id ? "page" : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

function ScreenIntro({
  title,
  description,
  action,
  actionHref,
}: {
  title: string;
  description: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="screen-intro">
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? (
        <a className="text-action" href={actionHref ?? "#home"}>
          {action}
          <ArrowRight size={17} />
        </a>
      ) : null}
    </div>
  );
}

function BackendModeNotice({ isSupabase, children }: { isSupabase: boolean; children?: ReactNode }) {
  return (
    <p className="backend-mode-notice">
      {isSupabase
        ? "Supabase 已接入：站主登录后上传会持久保存。"
        : "当前是静态/本地预览：可以试表单，但上传内容不会永久保存到线上。"}
      {children ? <span>{children}</span> : null}
    </p>
  );
}

function useAuthSession() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authState, setAuthState] = useState<LoadState>("idle");
  const [authMessage, setAuthMessage] = useState("");
  const [passwordRecoveryReady, setPasswordRecoveryReady] = useState(() => isPasswordRecoveryUrl());

  useEffect(() => {
    let active = true;

    async function loadUser() {
      setAuthState("loading");
      try {
        const currentUser = await siteBackend.getCurrentUser();
        if (!active) {
          return;
        }
        setUser(currentUser);
        if (isPasswordRecoveryUrl()) {
          setPasswordRecoveryReady(true);
          setAuthMessage("已进入密码重置模式。请输入新密码并保存。");
        }
        setAuthState("ready");
      } catch (error) {
        if (!active) {
          return;
        }
        setAuthState("error");
        setAuthMessage(error instanceof Error ? error.message : "账号状态读取失败。");
      }
    }

    void loadUser();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = siteBackend.onAuthStateChange?.((nextUser, event) => {
      setUser(nextUser);
      setAuthState("ready");

      if (event === "PASSWORD_RECOVERY" || isPasswordRecoveryUrl()) {
        setPasswordRecoveryReady(true);
        setAuthMessage("已进入密码重置模式。请输入新密码并保存。");
        return;
      }

      if (event === "SIGNED_OUT") {
        setPasswordRecoveryReady(false);
      }
    });

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    function syncRecoveryState() {
      setPasswordRecoveryReady(isPasswordRecoveryUrl());
    }

    window.addEventListener("hashchange", syncRecoveryState);
    window.addEventListener("popstate", syncRecoveryState);
    return () => {
      window.removeEventListener("hashchange", syncRecoveryState);
      window.removeEventListener("popstate", syncRecoveryState);
    };
  }, []);

  async function signIn(input: AccountDraft) {
    const email = input.email.trim();
    const password = input.password;
    if (!email || !password) {
      setAuthMessage("请填写邮箱和密码。");
      return;
    }

    setAuthState("loading");
    try {
      if (input.mode === "signup") {
        const result = await siteBackend.signUpWithPassword({
          email,
          password,
          username: input.username.trim() || email.split("@")[0],
        });
        setUser(result.user);
        setAuthState("ready");
        setAuthMessage(
          result.needsEmailConfirmation
            ? "账号已创建，但还需要邮箱确认。请打开邮箱里的确认邮件，点确认链接后再回来登录。"
            : "账号已创建并登录。以后会自动保持登录。",
        );
        return;
      }

      const nextUser = await siteBackend.signInWithPassword({ email, password });
      setUser(nextUser);
      setAuthState("ready");
      setAuthMessage("登录成功。以后会自动保持登录。");
    } catch (error) {
      setAuthState("error");
      setAuthMessage(error instanceof Error ? error.message : "登录失败。");
    }
  }

  async function resendConfirmation(email: string) {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setAuthMessage("请先填写邮箱。");
      return;
    }

    setAuthState("loading");
    try {
      await siteBackend.resendConfirmationEmail(normalizedEmail);
      setAuthState("ready");
      setAuthMessage("确认邮件已重新发送。请打开邮箱，点确认链接后再回来登录。");
    } catch (error) {
      setAuthState("error");
      setAuthMessage(error instanceof Error ? error.message : "确认邮件发送失败。");
    }
  }

  async function sendPasswordReset(email: string) {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setAuthMessage("请先填写邮箱。");
      return;
    }

    setAuthState("loading");
    try {
      await siteBackend.sendPasswordResetEmail(normalizedEmail);
      setAuthState("ready");
      setAuthMessage("密码重置邮件已发送。请打开邮箱里的链接完成新密码设置。");
    } catch (error) {
      setAuthState("error");
      setAuthMessage(error instanceof Error ? error.message : "密码重置邮件发送失败。");
    }
  }

  async function updatePassword(password: string) {
    if (password.trim().length < 6) {
      setAuthMessage("新密码至少需要 6 位。");
      return;
    }

    setAuthState("loading");
    try {
      await siteBackend.updatePassword(password);
      setPasswordRecoveryReady(false);
      setAuthState("ready");
      setAuthMessage("新密码已保存。你现在可以用新密码登录。");
      if (typeof window !== "undefined" && isPasswordRecoveryUrl()) {
        clearPasswordRecoveryUrl();
      }
    } catch (error) {
      setAuthState("error");
      setAuthMessage(error instanceof Error ? error.message : "新密码保存失败。");
    }
  }

  async function signOut() {
    setAuthState("loading");
    try {
      await siteBackend.signOut();
      setUser(null);
      setAuthState("ready");
      setAuthMessage("已退出登录。");
    } catch (error) {
      setAuthState("error");
      setAuthMessage(error instanceof Error ? error.message : "退出失败。");
    }
  }

  async function updateUserProfile(input: { username: string; avatarUrl?: string }) {
    if (!input.username.trim()) {
      setAuthMessage("用户名不能为空。");
      throw new Error("用户名不能为空。");
    }

    const nextUser = await siteBackend.updateProfile(input);
    setUser(nextUser);
    setAuthMessage("资料已更新。");
    return nextUser;
  }

  async function uploadProfileAvatar(file: File) {
    return siteBackend.uploadProfileAvatar(file);
  }

  return {
    user,
    setUser,
    authState,
    authMessage,
    passwordRecoveryReady,
    setAuthMessage,
    signIn,
    signOut,
    updateUserProfile,
    uploadProfileAvatar,
    resendConfirmation,
    sendPasswordReset,
    updatePassword,
  };
}

function AccountPanel({
  user,
  authState,
  authMessage,
  passwordRecoveryReady,
  onSubmit,
  onSignOut,
  onProfileUpdate,
  onAvatarUpload,
  onResendConfirmation,
  onPasswordReset,
  onUpdatePassword,
}: {
  user: AuthUser | null;
  authState: LoadState;
  authMessage: string;
  passwordRecoveryReady: boolean;
  onSubmit: (input: AccountDraft) => Promise<void>;
  onSignOut: () => Promise<void>;
  onProfileUpdate: (input: { username: string; avatarUrl?: string }) => Promise<AuthUser>;
  onAvatarUpload: (file: File) => Promise<{ publicUrl: string; storagePath: string }>;
  onResendConfirmation: (email: string) => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  onUpdatePassword: (password: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<AccountDraft>(defaultAccountDraft);
  const [profileName, setProfileName] = useState(user?.username ?? "");
  const [profileBusy, setProfileBusy] = useState(false);
  const [showPasswordEditor, setShowPasswordEditor] = useState(false);
  const busy = authState === "loading";
  const canRequestEmailHelp = Boolean(draft.email.trim()) && !busy;
  const canSaveRecoveryPassword =
    draft.recoveryPassword.trim().length >= 6 && draft.recoveryPassword === draft.recoveryPasswordConfirm && !busy;

  useEffect(() => {
    setProfileName(user?.username ?? "");
  }, [user?.username]);

  useEffect(() => {
    if (!user) {
      setShowPasswordEditor(false);
    }
  }, [user]);

  async function saveProfile(nextAvatarUrl = user?.avatarUrl) {
    if (!user) {
      return;
    }

    setProfileBusy(true);
    try {
      await onProfileUpdate({
        username: profileName.trim() || user.username || user.email.split("@")[0],
        avatarUrl: nextAvatarUrl,
      });
    } finally {
      setProfileBusy(false);
    }
  }

  async function handleAvatarFile(file: File | null) {
    if (!file || !user) {
      return;
    }

    setProfileBusy(true);
    try {
      const uploaded = await onAvatarUpload(file);
      await onProfileUpdate({
        username: profileName.trim() || user.username || user.email.split("@")[0],
        avatarUrl: uploaded.publicUrl,
      });
    } finally {
      setProfileBusy(false);
    }
  }

  async function saveRecoveryPassword() {
    await onUpdatePassword(draft.recoveryPassword);
  }

  if (passwordRecoveryReady) {
    return (
      <div className="account-panel account-panel-form account-recovery-panel">
        <div>
          <span>密码重置</span>
          <strong>设置新的登录密码</strong>
        </div>
        <input
          value={draft.recoveryPassword}
          onChange={(event) => setDraft((current) => ({ ...current, recoveryPassword: event.target.value }))}
          placeholder="新密码，至少 6 位"
          type="password"
        />
        <input
          value={draft.recoveryPasswordConfirm}
          onChange={(event) => setDraft((current) => ({ ...current, recoveryPasswordConfirm: event.target.value }))}
          placeholder="再次输入新密码"
          type="password"
        />
        <button
          className="cyan-button"
          disabled={!canSaveRecoveryPassword}
          onClick={() => void saveRecoveryPassword()}
          type="button"
        >
          <LockKeyhole size={16} />
          保存新密码
        </button>
        <p className="account-recovery-hint">
          密码重置链接只在当前登录恢复会话里有效。保存成功后，就可以用新密码重新登录。
        </p>
        {draft.recoveryPasswordConfirm && draft.recoveryPassword !== draft.recoveryPasswordConfirm ? (
          <p className="backend-status">两次输入的新密码不一致。</p>
        ) : null}
        {authMessage ? <p className="backend-status">{authMessage}</p> : null}
      </div>
    );
  }

  if (user) {
    return (
      <div className="account-panel">
        <label className="account-avatar-picker" title="更换头像">
          <span className="comment-avatar">
            {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : (user.username || user.email).slice(0, 1)}
          </span>
          <Camera size={14} />
          <input accept="image/*" disabled={profileBusy} onChange={(event) => void handleAvatarFile(event.target.files?.[0] ?? null)} type="file" />
        </label>
        <div className="account-profile-fields">
          <span>{user.role === "owner" ? "站主账号" : "访客账号"}</span>
          <input
            value={profileName}
            onBlur={() => void saveProfile()}
            onChange={(event) => setProfileName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.currentTarget.blur();
              }
            }}
            disabled={profileBusy}
            aria-label="用户名"
          />
          <small>{user.email}</small>
        </div>
        <button className="ghost-icon-button" disabled={profileBusy} onClick={() => void saveProfile()} type="button" aria-label="保存资料">
          <Check size={16} />
        </button>
        <button className="ghost-button" disabled={busy} onClick={() => setShowPasswordEditor((visible) => !visible)} type="button">
          <LockKeyhole size={16} />
          {showPasswordEditor ? "收起密码" : "设置密码"}
        </button>
        <button className="ghost-button" disabled={busy} onClick={() => void onSignOut()} type="button">
          <LogOut size={16} />
          退出
        </button>
        {showPasswordEditor ? (
          <div className="account-inline-password">
            <input
              value={draft.recoveryPassword}
              onChange={(event) => setDraft((current) => ({ ...current, recoveryPassword: event.target.value }))}
              placeholder="新密码，至少 6 位"
              type="password"
            />
            <input
              value={draft.recoveryPasswordConfirm}
              onChange={(event) => setDraft((current) => ({ ...current, recoveryPasswordConfirm: event.target.value }))}
              placeholder="再次输入新密码"
              type="password"
            />
            <button className="cyan-button" disabled={!canSaveRecoveryPassword} onClick={() => void saveRecoveryPassword()} type="button">
              <Check size={16} />
              保存新密码
            </button>
            {draft.recoveryPasswordConfirm && draft.recoveryPassword !== draft.recoveryPasswordConfirm ? (
              <p className="backend-status">两次输入的新密码不一致。</p>
            ) : null}
          </div>
        ) : null}
        {!showPasswordEditor ? (
          <div className="account-password-nudge">
            <span>
              <LockKeyhole size={13} />
              如果你是点邮箱确认或重置链接进来的，先点“设置密码”保存新密码，再退出测试密码登录。
            </span>
          </div>
        ) : null}
        {authMessage ? <p className="backend-status">{authMessage}</p> : null}
      </div>
    );
  }

  return (
    <div className="account-panel account-panel-form">
      <div>
        <span>账号登录</span>
        <strong>{draft.mode === "signup" ? "创建账号后才能留言" : "登录后自动保持在线"}</strong>
      </div>
      <input
        value={draft.email}
        onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))}
        placeholder="邮箱"
        type="email"
      />
      <input
        value={draft.password}
        onChange={(event) => setDraft((current) => ({ ...current, password: event.target.value }))}
        placeholder="密码"
        type="password"
      />
      {draft.mode === "signup" ? (
        <input
          value={draft.username}
          onChange={(event) => setDraft((current) => ({ ...current, username: event.target.value }))}
          placeholder="用户名"
        />
      ) : null}
      <button className="cyan-button" disabled={busy} onClick={() => void onSubmit(draft)} type="button">
        {draft.mode === "signup" ? "注册" : "登录"}
      </button>
      <button
        className="ghost-button"
        type="button"
        onClick={() => setDraft((current) => ({ ...current, mode: current.mode === "signup" ? "signin" : "signup" }))}
      >
        {draft.mode === "signup" ? "已有账号" : "注册账号"}
      </button>
      <div className="account-email-help">
        <span>
          <Mail size={13} />
          没收到确认邮件时，先检查垃圾箱；确认后再回来登录。
        </span>
        <div>
          <button className="ghost-button" disabled={!canRequestEmailHelp} onClick={() => void onResendConfirmation(draft.email)} type="button">
            重发确认邮件
          </button>
          <button className="ghost-button" disabled={!canRequestEmailHelp} onClick={() => void onPasswordReset(draft.email)} type="button">
            忘记密码
          </button>
        </div>
      </div>
      {authMessage ? <p className="backend-status">{authMessage}</p> : null}
    </div>
  );
}

function avatarContent(value: string | undefined, fallback = "访") {
  if (value && /^(https?:|blob:|data:)/.test(value)) {
    return <img src={value} alt="" />;
  }

  return (value || fallback).trim().slice(0, 1) || fallback;
}

function isDisplayableComment(comment: Comment) {
  const author = comment.author.trim().toLowerCase();
  const body = comment.body.trim().toLowerCase();

  return !(
    author === "anonymous visitor" ||
    author === "验收访客" ||
    body.includes("this comment should be blocked because comments require auth") ||
    body.startsWith("supabase smoke test ")
  );
}

function EditableText({
  as,
  value,
  editMode,
  multiline = false,
  className,
  label,
  onSave,
}: {
  as: "h1" | "p" | "strong" | "span";
  value: string;
  editMode: boolean;
  multiline?: boolean;
  className?: string;
  label: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  async function commit() {
    const nextValue = draft.trim();
    if (!nextValue || nextValue === value) {
      setDraft(value);
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onSave(nextValue);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const Tag = as;

  if (!editMode) {
    return <Tag className={className}>{value}</Tag>;
  }

  if (editing) {
    const editor = multiline ? (
      <textarea
        autoFocus
        className="editable-field editable-field-textarea"
        value={draft}
        disabled={saving}
        aria-label={label}
        onBlur={() => void commit()}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    ) : (
      <input
        autoFocus
        className="editable-field"
        value={draft}
        disabled={saving}
        aria-label={label}
        onBlur={() => void commit()}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
      />
    );

    return <div className={clsx("editable-shell", className)}>{editor}</div>;
  }

  return (
    <Tag
      className={clsx(className, "editable-display")}
      role="button"
      tabIndex={0}
      title={`点击编辑${label}`}
      onClick={() => setEditing(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setEditing(true);
        }
      }}
    >
      {value}
      <Edit3 size={16} aria-hidden="true" />
    </Tag>
  );
}

function PortfolioIcon({ item }: { item: PortfolioItem }) {
  if (item.kind === "excel") {
    return <FileSpreadsheet size={18} />;
  }

  if (item.kind === "image") {
    return <ImageIcon size={18} />;
  }

  if (item.kind === "html-prototype") {
    return <Code2 size={18} />;
  }

  return <FileText size={18} />;
}

function isJsonPreview(item: PortfolioItem) {
  return Boolean(item.previewUrl?.endsWith(".json"));
}

function getColumnLabel(index: number) {
  let value = index + 1;
  let label = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }

  return label;
}

function ExcelSheetPreview({ data }: { data: ExcelPreviewData }) {
  const [activeSheetId, setActiveSheetId] = useState(data.sheets[0]?.id ?? "");

  useEffect(() => {
    setActiveSheetId(data.sheets[0]?.id ?? "");
  }, [data]);

  const activeSheet = data.sheets.find((sheet) => sheet.id === activeSheetId) ?? data.sheets[0];

  if (!activeSheet) {
    return (
      <div className="structured-empty">
        <FileSpreadsheet size={22} />
        <strong>这个 Excel 暂时没有可显示的数据</strong>
      </div>
    );
  }

  const columnCount = Math.max(...activeSheet.cells.map((row) => row.length), 1);
  const columnLabels = Array.from({ length: columnCount }, (_, index) => getColumnLabel(index));

  return (
    <div className="excel-reader">
      <div className="excel-reader-head">
        <div>
          <span>站内 Excel 预览</span>
          <strong>{activeSheet.workbookName}</strong>
        </div>
        <div className="excel-stats">
          <span>{data.sheetCount} 张表</span>
          <span>{activeSheet.rowCount} 行</span>
          <span>{activeSheet.columnCount} 列</span>
        </div>
      </div>

      <div className="excel-sheet-tabs" aria-label="Excel 工作表">
        {data.sheets.map((sheet) => (
          <button
            className={clsx(activeSheet.id === sheet.id && "active")}
            key={sheet.id}
            onClick={() => setActiveSheetId(sheet.id)}
            type="button"
          >
            {data.sheetCount > 1 ? `${sheet.workbookName.replace(/\.xlsx$/i, "")} / ` : null}
            {sheet.sheetName}
          </button>
        ))}
      </div>

      <div className="excel-table-shell">
        <table className="excel-table">
          <thead>
            <tr>
              <th aria-label="行号" />
              {columnLabels.map((label) => (
                <th key={label}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeSheet.cells.map((row, rowIndex) => (
              <tr key={`${activeSheet.id}-${rowIndex}`}>
                <th>{rowIndex + 1}</th>
                {columnLabels.map((label, columnIndex) => (
                  <td key={`${label}-${columnIndex}`}>{row[columnIndex] || ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeSheet.truncatedRows || activeSheet.truncatedColumns ? (
        <p className="preview-note">
          为了保证网页打开速度，当前只展示前 {data.rowLimit} 行 / {data.columnLimit} 列；完整版本可通过下载文件查看。
        </p>
      ) : null}

      {data.sourceFiles.length > 1 ? (
        <div className="source-file-links" aria-label="配置表源文件">
          {data.sourceFiles.map((file) => (
            <a href={file} key={file} download>
              {file.split("/").pop()}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PreviewTable({ rows }: { rows: string[][] }) {
  const columnCount = Math.max(...rows.map((row) => row.length), 1);

  return (
    <div className="doc-table-shell">
      <table className="doc-table">
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columnCount }, (_, columnIndex) => {
                const content = row[columnIndex] || "";
                const Cell = rowIndex === 0 ? "th" : "td";

                return <Cell key={columnIndex}>{content}</Cell>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentReader({ data }: { data: DocumentPreviewData }) {
  return (
    <article className="document-reader">
      <div className="document-reader-head">
        <span>站内文档预览</span>
        <strong>{data.title}</strong>
      </div>

      <div className="document-blocks">
        {data.blocks.map((block, index) => {
          if (block.type === "heading") {
            const Heading = block.level <= 2 ? "h3" : "h4";
            return <Heading key={index}>{block.text}</Heading>;
          }

          if (block.type === "table") {
            return (
              <div className="document-table-block" key={index}>
                <PreviewTable rows={block.rows} />
                {block.truncatedRows || block.truncatedColumns ? (
                  <p className="preview-note">表格较大，这里展示压缩后的前段内容。</p>
                ) : null}
              </div>
            );
          }

          return <p key={index}>{block.text}</p>;
        })}
      </div>

      {data.truncatedBlocks ? <p className="preview-note">文档很长，这里展示前 {data.blockLimit} 段内容。</p> : null}
    </article>
  );
}

function renderMarkdownLine(line: string, index: number) {
  const trimmed = line.trim();

  if (!trimmed) {
    return <span className="markdown-gap" key={index} />;
  }

  const heading = /^(#{1,4})\s+(.+)$/.exec(trimmed);
  if (heading) {
    const Heading = heading[1].length <= 2 ? "h3" : "h4";
    return <Heading key={index}>{heading[2]}</Heading>;
  }

  if (/^[-*]\s+/.test(trimmed)) {
    return (
      <p className="markdown-list-line" key={index}>
        <span aria-hidden="true">•</span>
        {trimmed.replace(/^[-*]\s+/, "")}
      </p>
    );
  }

  if (/^\d+[.)]\s+/.test(trimmed)) {
    return (
      <p className="markdown-list-line" key={index}>
        {trimmed}
      </p>
    );
  }

  return <p key={index}>{trimmed.replace(/\*\*/g, "")}</p>;
}

function TextReader({ data }: { data: TextPreviewData }) {
  return (
    <article className={clsx("document-reader", data.kind === "text" && "plain-text-reader")}>
      <div className="document-reader-head">
        <span>{data.kind === "markdown" ? "站内 Markdown 预览" : "站内文本预览"}</span>
        <strong>{data.title}</strong>
      </div>

      {data.kind === "markdown" ? (
        <div className="document-blocks markdown-reader">
          {data.content.split("\n").map((line, index) => renderMarkdownLine(line, index))}
        </div>
      ) : (
        <pre>{data.content}</pre>
      )}
    </article>
  );
}

function StructuredPortfolioPreview({ item }: { item: PortfolioItem }) {
  const [state, setState] = useState<LoadState>("loading");
  const [data, setData] = useState<StructuredPreviewData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPreview() {
      if (!item.previewUrl) {
        setState("error");
        setErrorMessage("缺少预览文件。");
        return;
      }

      setState("loading");
      setErrorMessage("");

      try {
        const response = await fetch(item.previewUrl);
        if (!response.ok) {
          throw new Error(`预览文件加载失败：${response.status}`);
        }

        const payload = (await response.json()) as StructuredPreviewData;
        if (!active) {
          return;
        }

        setData(payload);
        setState("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setState("error");
        setErrorMessage(error instanceof Error ? error.message : "预览文件加载失败。");
      }
    }

    void loadPreview();
    return () => {
      active = false;
    };
  }, [item.previewUrl]);

  if (state === "loading") {
    return (
      <div className="structured-empty">
        <PortfolioIcon item={item} />
        <strong>正在载入站内预览...</strong>
      </div>
    );
  }

  if (state === "error" || !data) {
    return (
      <div className="structured-empty">
        <PortfolioIcon item={item} />
        <strong>站内预览暂时没有加载出来</strong>
        <span>{errorMessage || "可以先打开原文件或下载查看。"}</span>
      </div>
    );
  }

  if (data.kind === "excel") {
    return <ExcelSheetPreview data={data} />;
  }

  if (data.kind === "document") {
    return <DocumentReader data={data} />;
  }

  return <TextReader data={data} />;
}

function PortfolioFallbackPreview({ item }: { item: PortfolioItem }) {
  const previewSignals = [
    { label: "项目", value: item.projectLabel },
    { label: "类型", value: item.kindLabel },
    { label: "更新", value: item.updatedAt },
    { label: "状态", value: item.downloadable ? "可下载留档" : "公开展示" },
  ];

  return (
    <article className="portfolio-fallback-preview">
      <div className="fallback-orb">
        <PortfolioIcon item={item} />
      </div>
      <span className="fallback-kicker">Archive Brief</span>
      <strong>{item.title}</strong>
      <p>{item.summary}</p>
      <div className="fallback-signal-grid" aria-label={`${item.title} 文件信息`}>
        {previewSignals.map((signal) => (
          <span key={signal.label}>
            <small>{signal.label}</small>
            {signal.value}
          </span>
        ))}
      </div>
      {item.tags.length > 0 ? (
        <div className="tag-row fallback-tags">
          {item.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
      <div className="fallback-source-line">
        <span>源文件</span>
        <code>{item.sourcePath}</code>
      </div>
      <div className="fallback-action-hint">
        <Download size={15} />
        <span>这类归档文件不适合嵌入浏览器渲染，已保留清晰下载入口和项目说明，HR 可以先看摘要再决定是否下载完整包。</span>
      </div>
    </article>
  );
}

function PortfolioPreview({ item }: { item: PortfolioItem }) {
  if (item.previewUrl && item.kind === "image") {
    return <img src={item.previewUrl} alt={item.title} />;
  }

  if (item.previewUrl && isJsonPreview(item)) {
    return <StructuredPortfolioPreview item={item} />;
  }

  if (item.previewUrl && (item.kind === "pdf" || item.kind === "html-prototype")) {
    return <iframe title={item.title} src={item.previewUrl} loading="lazy" />;
  }

  return <PortfolioFallbackPreview item={item} />;
}

function HeroSection({
  settings,
  currentUser,
  editMode,
  onEditModeChange,
  onSettingsChange,
}: {
  settings: SiteSettings;
  currentUser: AuthUser | null;
  editMode: boolean;
  onEditModeChange: (enabled: boolean) => void;
  onSettingsChange: (settings: SiteSettings) => void;
}) {
  const [statusMessage, setStatusMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isOwner = currentUser?.role === "owner";
  const globalSearchIndex = useMemo(() => createGlobalSearchIndex(), []);
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const globalSearchTerms = useMemo(() => normalizedSearchQuery.split(/\s+/).filter(Boolean), [normalizedSearchQuery]);
  const searchResults = useMemo(() => {
    if (globalSearchTerms.length === 0) {
      return globalSearchIndex.slice(0, 5);
    }

    return globalSearchIndex
      .map((item) => {
        const normalizedTokens = normalizeSearchText(item.tokens);
        const matchedTerms = globalSearchTerms.filter((term) => normalizedTokens.includes(term));
        const titleHit = globalSearchTerms.some((term) => normalizeSearchText(item.title).includes(term));
        return {
          item,
          score: matchedTerms.length * 2 + (titleHit ? 3 : 0),
        };
      })
      .filter((result) => result.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 6)
      .map((result) => result.item);
  }, [globalSearchIndex, globalSearchTerms]);
  const showSearchPanel = searchActive || normalizedSearchQuery.length > 0;

  async function saveSettings(patch: Partial<SiteSettings>) {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以编辑首页。");
      return;
    }

    try {
      const nextSettings = await siteBackend.updateSiteSettings({
        ...settings,
        ...patch,
      });
      onSettingsChange(nextSettings);
      setStatusMessage("首页设置已保存。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "首页设置保存失败。");
    }
  }

  async function uploadHeroImage(file: File | null, kind: "site-cover" | "site-avatar") {
    if (!file) {
      return;
    }

    if (!isOwner) {
      setStatusMessage("只有站主账号可以上传首页图片。");
      return;
    }

    try {
      const uploaded = await siteBackend.uploadAsset(file, kind);
      await saveSettings(kind === "site-cover" ? { heroCoverUrl: uploaded.url } : { siteAvatarUrl: uploaded.url });
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "图片上传失败。");
    }
  }

  function openSearchItem(item: GlobalSearchItem) {
    const params = new URLSearchParams(window.location.search);
    params.set("fromSearch", "1");
    if (item.targetId) {
      params.set("target", item.targetId);
    } else {
      params.delete("target");
    }
    if (item.query) {
      params.set("search", item.query);
    } else {
      params.delete("search");
    }
    const nextQuery = params.toString();
    window.history.pushState(null, "", `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}#${item.section}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    setSearchQuery("");
    setSearchActive(false);
    searchInputRef.current?.blur();
  }

  useEffect(() => {
    function handleGlobalSearchShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchActive(true);
        searchInputRef.current?.focus();
      }

      if (event.key === "Escape") {
        setSearchActive(false);
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    }

    window.addEventListener("keydown", handleGlobalSearchShortcut);
    return () => window.removeEventListener("keydown", handleGlobalSearchShortcut);
  }, []);

  return (
    <section className={clsx("screen-section hero-section", editMode && "is-editing")} id="home">
      <div className="hero-copy">
        <EditableText
          as="h1"
          value={settings.heroTitle}
          editMode={editMode}
          label="首页标题"
          onSave={(value) => saveSettings({ heroTitle: value })}
        />
        <EditableText
          as="p"
          value={settings.heroDescription}
          editMode={editMode}
          multiline
          label="首页介绍"
          onSave={(value) => saveSettings({ heroDescription: value })}
        />
        <div className="hero-actions">
          <a className="cyan-button" href="#docs">
            进入档案
          </a>
          <a className="ghost-button" href="#comments">
            去留言墙
          </a>
        </div>
        {isOwner ? (
          <div className="edit-mode-toolbar">
            <button
              className={clsx("ghost-button", editMode && "active")}
              onClick={() => onEditModeChange(!editMode)}
              type="button"
            >
              <Edit3 size={16} />
              {editMode ? "退出编辑模式" : "进入编辑模式"}
            </button>
            {statusMessage ? <p className="backend-status">{statusMessage}</p> : null}
          </div>
        ) : null}
      </div>

      <div className="hero-console">
        <div className="hero-search-wrap" role="search">
          <label className={clsx("search-box", showSearchPanel && "is-active")}>
            <Search size={17} aria-hidden="true" />
            <input
              aria-expanded={showSearchPanel}
              aria-label="全站搜索"
              onBlur={() => window.setTimeout(() => setSearchActive(false), 120)}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => setSearchActive(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && searchResults[0]) {
                  event.preventDefault();
                  openSearchItem(searchResults[0]);
                }
              }}
              placeholder="搜索档案 / Demo / 音乐 / 灵感..."
              ref={searchInputRef}
              type="search"
              value={searchQuery}
            />
            <kbd>⌘K</kbd>
          </label>
          <div className={clsx("global-search-panel", showSearchPanel && "is-open")} aria-label="全站搜索结果">
            <div className="global-search-panel-head">
              <span>{normalizedSearchQuery ? "搜索结果" : "快速入口"}</span>
              <strong>{normalizedSearchQuery ? `${searchResults.length} 条命中` : "常用档案"}</strong>
            </div>
            {searchResults.length > 0 ? (
              searchResults.map((item) => (
                <button className="global-search-result" key={item.id} onMouseDown={() => openSearchItem(item)} type="button">
                  <span>{item.eyebrow}</span>
                  <strong>{item.title}</strong>
                  <small>{item.summary}</small>
                  <em>
                    {item.actionLabel}
                    <ArrowRight size={13} />
                  </em>
                </button>
              ))
            ) : (
              <div className="global-search-empty">
                <strong>没有搜到匹配内容</strong>
                <span>换个关键词，比如“野蛮人”“Excel”“书摘”“Demo”。</span>
              </div>
            )}
          </div>
        </div>
        <div className="hero-toolbar">
          <button onClick={() => { window.location.hash = "private"; }} type="button" aria-label="查看站主动态">
            <Bell size={21} />
          </button>
          <button onClick={() => { window.location.hash = "contact"; }} type="button" aria-label="联系">
            <Mail size={21} />
          </button>
          {editMode ? (
            <label className="avatar editable-media" aria-label="上传站主头像" title="点击更换头像">
              {avatarContent(settings.siteAvatarUrl, settings.brandName)}
              <Camera size={16} />
              <input accept="image/*" onChange={(event) => void uploadHeroImage(event.target.files?.[0] ?? null, "site-avatar")} type="file" />
            </label>
          ) : (
            <div className="avatar" aria-label="站主头像">
              {avatarContent(settings.siteAvatarUrl, settings.brandName)}
            </div>
          )}
        </div>
        <MediaTile tile={0} imageUrl={settings.heroCoverUrl} className="hero-media">
          {editMode ? (
            <label className="cover-edit-button">
              <Camera size={16} />
              <span>更换封面</span>
              <input accept="image/*" onChange={(event) => void uploadHeroImage(event.target.files?.[0] ?? null, "site-cover")} type="file" />
            </label>
          ) : null}
          <div className="hero-media-caption">
            <EditableText
              as="span"
              value={settings.brandName}
              editMode={editMode}
              label="网站名称"
              onSave={(value) => saveSettings({ brandName: value })}
            />
            <EditableText
              as="strong"
              value={settings.brandSubtitle}
              editMode={editMode}
              label="网站副标题"
              onSave={(value) => saveSettings({ brandSubtitle: value })}
            />
          </div>
        </MediaTile>
      </div>
    </section>
  );
}

function BackgroundMusicDock({ settings }: { settings: SiteSettings }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (!settings.backgroundMusicEnabled || !settings.backgroundMusicUrl) {
      audio.pause();
      setPlaying(false);
    }
  }, [settings.backgroundMusicEnabled, settings.backgroundMusicUrl]);

  async function toggleBackgroundMusic() {
    const audio = audioRef.current;
    if (!audio || !settings.backgroundMusicUrl) {
      return;
    }

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  if (!settings.backgroundMusicEnabled || !settings.backgroundMusicUrl) {
    return null;
  }

  return (
    <div className="background-music-dock" aria-label="网站背景音乐">
      <audio ref={audioRef} src={settings.backgroundMusicUrl} loop preload="none" />
      <button onClick={toggleBackgroundMusic} type="button" aria-label={playing ? "暂停背景音乐" : "播放背景音乐"}>
        {playing ? <Pause size={16} fill="currentColor" /> : <Volume2 size={16} />}
      </button>
      <span>{settings.backgroundMusicTitle || "背景音乐"}</span>
    </div>
  );
}

function DocsSection({ currentUser }: { currentUser: AuthUser | null }) {
  const [activeFilter, setActiveFilter] = useState<(typeof portfolioFilters)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PortfolioItem[]>(portfolioItems);
  const [activeId, setActiveId] = useState(portfolioItems.find((item) => item.featured)?.id ?? portfolioItems[0].id);
  const [draft, setDraft] = useState<PortfolioItemInput>(defaultPortfolioDraft);
  const [tagInput, setTagInput] = useState("");
  const [editingPortfolioItemId, setEditingPortfolioItemId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const [deletingPortfolioItemId, setDeletingPortfolioItemId] = useState<string | null>(null);
  const [docsState, setDocsState] = useState<LoadState>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const isOwner = currentUser?.role === "owner";
  const isSupabase = siteBackend.mode === "supabase";
  const docsNavigationTarget = useSearchNavigationTarget("docs");

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter =
        activeFilter === "all" ||
        item.project === activeFilter ||
        item.kind === activeFilter;
      const searchable = `${item.title} ${item.projectLabel} ${item.kindLabel} ${item.summary} ${item.tags.join(" ")}`.toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, items, query]);

  const activeItem = filteredItems.find((item) => item.id === activeId) ?? filteredItems[0] ?? portfolioItems[0];
  const editingPortfolioItem = editingPortfolioItemId ? items.find((item) => item.id === editingPortfolioItemId) : null;

  useEffect(() => {
    if (!docsNavigationTarget) {
      return;
    }

    if (docsNavigationTarget.targetId && items.some((item) => item.id === docsNavigationTarget.targetId)) {
      setActiveId(docsNavigationTarget.targetId);
      setQuery("");
      setActiveFilter("all");
      return;
    }

    if (docsNavigationTarget.query) {
      setQuery(docsNavigationTarget.query);
      setActiveFilter("all");
    }
  }, [docsNavigationTarget, items]);

  useEffect(() => {
    if (!filteredItems.some((item) => item.id === activeId)) {
      setActiveId(filteredItems[0]?.id ?? portfolioItems[0].id);
    }
  }, [activeId, filteredItems]);

  useEffect(() => {
    let active = true;

    async function loadPortfolioWorkbench() {
      setDocsState("loading");
      setStatusMessage("");

      try {
        const remoteItems = await siteBackend.listPortfolioItems();

        if (!active) {
          return;
        }

        if (remoteItems.length > 0) {
          setItems(remoteItems);
        }
        setDocsState("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setDocsState("error");
        setStatusMessage(error instanceof Error ? error.message : "作品集加载失败，已使用本地静态数据。");
      }
    }

    void loadPortfolioWorkbench();
    return () => {
      active = false;
    };
  }, []);

  async function handlePortfolioFile(file: File | null) {
    if (!file) {
      return;
    }

    if (!isOwner) {
      setStatusMessage("只有站主账号可以上传作品集文件。");
      return;
    }

    setUploading(true);
    setStatusMessage("");

    try {
      const uploaded = await siteBackend.uploadPortfolioFile(file, draft.kind);
      setDraft((current) => ({
        ...current,
        title: current.title || file.name.replace(/\.[^.]+$/, ""),
        publicUrl: uploaded.publicUrl,
        previewUrl: ["pdf", "html-prototype", "image"].includes(current.kind) ? uploaded.publicUrl : current.previewUrl,
        sourcePath: uploaded.storagePath,
      }));
      setStatusMessage(isSupabase ? "文件已上传到 Supabase Storage。" : "本地预览已读取文件。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "上传失败。");
    } finally {
      setUploading(false);
    }
  }

  function resetPortfolioDraft() {
    setDraft(defaultPortfolioDraft);
    setTagInput("");
    setEditingPortfolioItemId(null);
  }

  function startEditingPortfolioItem(item: PortfolioItem = activeItem) {
    setDraft(portfolioItemToDraft(item));
    setTagInput(item.tags.join(", "));
    setEditingPortfolioItemId(item.id);
    setStatusMessage(`正在编辑「${item.title}」，改完后点保存修改。`);
  }

  async function savePortfolioEntry() {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以编辑作品集。");
      return;
    }

    const title = draft.title.trim();
    const summary = draft.summary.trim();
    const publicUrl = draft.publicUrl.trim();

    if (!title || !summary || !publicUrl) {
      setStatusMessage("标题、简介和文件链接都需要填写。");
      return;
    }

    try {
      setSavingPortfolio(true);
      const payload: PortfolioItemInput = {
        ...draft,
        title,
        summary,
        publicUrl,
        previewUrl: draft.previewUrl?.trim() || undefined,
        thumbnailUrl: draft.thumbnailUrl?.trim() || undefined,
        sourcePath: draft.sourcePath?.trim() || undefined,
        tags: tagInput
          .split(/[,，]/)
          .map((tag) => tag.trim())
          .filter(Boolean),
      };
      const nextItem = editingPortfolioItemId
        ? await siteBackend.updatePortfolioItem(editingPortfolioItemId, payload)
        : await siteBackend.createPortfolioItem(payload);
      setItems((current) =>
        editingPortfolioItemId
          ? current.map((item) => (item.id === editingPortfolioItemId ? nextItem : item))
          : [nextItem, ...current],
      );
      setActiveId(nextItem.id);
      resetPortfolioDraft();
      setStatusMessage(
        editingPortfolioItemId
          ? "作品集条目已更新。"
          : isSupabase
            ? "作品集条目已写入 Supabase。"
            : "本地预览已新增作品条目。",
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "保存作品失败。");
    } finally {
      setSavingPortfolio(false);
    }
  }

  async function deletePortfolioItem(item: PortfolioItem = activeItem) {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以删除作品集条目。");
      return;
    }

    if (!window.confirm(`确定删除「${item.title}」这个作品条目吗？`)) {
      return;
    }

    try {
      setDeletingPortfolioItemId(item.id);
      await siteBackend.deletePortfolioItem(item.id);
      setItems((current) => {
        const nextItems = current.filter((candidate) => candidate.id !== item.id);
        setActiveId(nextItems[0]?.id ?? portfolioItems[0].id);
        return nextItems;
      });
      if (editingPortfolioItemId === item.id) {
        resetPortfolioDraft();
      }
      setStatusMessage("作品集条目已删除。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "删除作品失败。");
    } finally {
      setDeletingPortfolioItemId(null);
    }
  }

  return (
    <section className="screen-section docs-section" id="docs">
      <div className="portfolio-command">
        <ScreenIntro
          title="我的策划档案"
          description="真实作品已经进入档案库：野蛮人大作战、系统策划投递包、游戏小镇原型与配置表都可以在这一屏筛选、预览和下载。"
        />
        <div className="owner-badge">
          <LockKeyhole size={16} />
          <span>{isOwner ? "站主模式：可以上传和登记新作品" : "访客可浏览，编辑入口只给站主登录"}</span>
        </div>
        <div className="portfolio-admin">
          <div className="portfolio-admin-head">
            <span>{isSupabase ? "Supabase 权限" : localPreviewLabel}</span>
            <strong>{editingPortfolioItem ? "编辑作品集条目" : isOwner ? "站主编辑入口已开启" : "公开浏览模式"}</strong>
          </div>
          <BackendModeNotice isSupabase={isSupabase} />
          {!isOwner ? <p className="backend-status">登录站主账号后，这里会自动出现上传和登记入口。</p> : null}
          {isOwner ? (
            <div className="portfolio-editor">
              <div className="portfolio-editor-grid">
                <label>
                  <span>项目</span>
                  <select
                    value={draft.project}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        project: event.target.value as PortfolioItemInput["project"],
                      }))
                    }
                  >
                    {portfolioProjectOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>类型</span>
                  <select
                    value={draft.kind}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        kind: event.target.value as PortfolioKind,
                      }))
                    }
                  >
                    {portfolioKindOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <span>标题</span>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="作品标题"
                />
              </label>
              <label>
                <span>简介</span>
                <textarea
                  value={draft.summary}
                  onChange={(event) => setDraft((current) => ({ ...current, summary: event.target.value }))}
                  placeholder="一句话说明作品亮点"
                />
              </label>
              <label>
                <span>标签</span>
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="用逗号分隔，例如 系统策划, Excel"
                />
              </label>
              <label>
                <span>文件链接</span>
                <input
                  value={draft.publicUrl}
                  onChange={(event) => setDraft((current) => ({ ...current, publicUrl: event.target.value }))}
                  placeholder="上传后自动填入，或粘贴公开 URL"
                />
              </label>
              <div className="portfolio-upload-row">
                <label className="portfolio-file-picker">
                  <Upload size={16} />
                  <span>{uploading ? "上传中..." : "选择文件"}</span>
                  <input
                    disabled={uploading}
                    onChange={(event) => void handlePortfolioFile(event.target.files?.[0] ?? null)}
                    type="file"
                  />
                </label>
                <button className="ghost-button" disabled={uploading || savingPortfolio} onClick={resetPortfolioDraft} type="button">
                  <X size={15} />
                  {editingPortfolioItem ? "取消编辑" : "清空"}
                </button>
                <button className="cyan-button" disabled={uploading || savingPortfolio} onClick={savePortfolioEntry} type="button">
                  <Check size={16} />
                  {savingPortfolio ? "保存中..." : editingPortfolioItem ? "保存修改" : "登记作品"}
                </button>
              </div>
            </div>
          ) : null}
          {statusMessage ? <p className="backend-status">{statusMessage}</p> : null}
          {docsState === "loading" ? <p className="backend-status">正在同步作品集...</p> : null}
        </div>
      </div>

      <div className="portfolio-workbench">
        <div className="portfolio-toolbar">
          <label className="portfolio-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索项目、表格、原型、标签..."
            />
          </label>
          <div className="portfolio-filters" aria-label="作品筛选">
            {portfolioFilters.map((filter) => (
              <button
                className={clsx(activeFilter === filter.id && "active")}
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="portfolio-content">
          <div className="portfolio-list" aria-label="作品列表">
            {filteredItems.map((item) => (
              <button
                className={clsx("portfolio-card", activeItem.id === item.id && "selected")}
                key={item.id}
                onClick={() => setActiveId(item.id)}
                type="button"
              >
                <span className="portfolio-card-icon">
                  <PortfolioIcon item={item} />
                </span>
                <span className="portfolio-card-copy">
                  <span>
                    <strong>{item.title}</strong>
                    {item.featured ? <em>Featured</em> : null}
                  </span>
                  <small>{item.projectLabel} / {item.kindLabel}</small>
                  <p>{item.summary}</p>
                  <span className="tag-row">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <aside className="portfolio-detail" aria-label="作品详情">
            <div className="portfolio-detail-head">
              <span>{activeItem.projectLabel}</span>
              <strong>{activeItem.title}</strong>
              <p>{activeItem.summary}</p>
              <div className="portfolio-meta">
                <span>{activeItem.kindLabel}</span>
                <time>{activeItem.updatedAt}</time>
              </div>
              {isOwner ? (
                <div className="portfolio-owner-actions">
                  <button
                    className="ghost-button"
                    disabled={savingPortfolio}
                    onClick={() => startEditingPortfolioItem(activeItem)}
                    type="button"
                  >
                    <Edit3 size={15} />
                    编辑当前
                  </button>
                  <button
                    className="ghost-button danger"
                    disabled={deletingPortfolioItemId === activeItem.id}
                    onClick={() => void deletePortfolioItem(activeItem)}
                    type="button"
                  >
                    <Trash2 size={15} />
                    删除当前
                  </button>
                </div>
              ) : null}
            </div>
            <div className="portfolio-preview">
              <PortfolioPreview item={activeItem} />
            </div>
            <div className="portfolio-detail-actions">
              {activeItem.previewUrl && !isJsonPreview(activeItem) ? (
                <a className="ghost-button" href={activeItem.previewUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} />
                  打开预览
                </a>
              ) : null}
              {isJsonPreview(activeItem) ? (
                <a className="ghost-button" href={activeItem.publicUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} />
                  打开原文件
                </a>
              ) : null}
              <a className="cyan-button" href={activeItem.publicUrl} download>
                <Download size={16} />
                下载文件
              </a>
            </div>
            <div className="portfolio-source">
              <span>来源</span>
              <code>{activeItem.sourcePath}</code>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function DemosSection() {
  const [activeTitle, setActiveTitle] = useState(gameDemos[0].title);
  const [playMessage, setPlayMessage] = useState("");
  const activeDemo = gameDemos.find((demo) => demo.title === activeTitle) ?? gameDemos[0];
  const demosNavigationTarget = useSearchNavigationTarget("demos");

  useEffect(() => {
    if (demosNavigationTarget?.targetId && gameDemos.some((demo) => demo.title === demosNavigationTarget.targetId)) {
      setActiveTitle(demosNavigationTarget.targetId);
    }
  }, [demosNavigationTarget]);

  function playActiveDemo() {
    if (activeDemo.prototypeUrl) {
      window.open(activeDemo.prototypeUrl, "_blank", "noopener,noreferrer");
      setPlayMessage(`已打开 ${activeDemo.title} 的可交互原型。`);
      return;
    }

    if (activeDemo.portfolioTargetId) {
      const params = new URLSearchParams({
        fromSearch: "1",
        target: activeDemo.portfolioTargetId,
      });
      window.location.hash = "docs";
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}#docs`);
      setPlayMessage(`已跳转到 ${activeDemo.title} 的作品集条目。`);
      return;
    }

    setPlayMessage(`已切到 ${activeDemo.title} 演示位。`);
  }

  const activePortfolioHref = activeDemo.portfolioTargetId
    ? `?fromSearch=1&target=${encodeURIComponent(activeDemo.portfolioTargetId)}#docs`
    : "#docs";

  return (
    <section className="screen-section demos-section" id="demos">
      <ScreenIntro
        title="游戏 Demo"
        description="Demo 区独占一屏，主舞台放当前选中的原型，其它 Demo 作为可切换的播放队列。"
        action="打开 Demo 库"
        actionHref="#demos"
      />
      <div className="demo-stage">
        <MediaTile tile={activeDemo.tile} className="demo-feature">
          <button className="play-orb" type="button" aria-label={`播放 ${activeDemo.title}`} onClick={playActiveDemo}>
            <Play size={34} fill="currentColor" />
          </button>
        </MediaTile>
        <div className="demo-feature-copy">
          <span className="demo-status">{activeDemo.status ?? "Demo 展台"}</span>
          <h3>{activeDemo.title}</h3>
          <p>{activeDemo.description}</p>
          {playMessage ? <p className="demo-play-message">{playMessage}</p> : null}
          <div className="meta-row">
            <span>{activeDemo.platform}</span>
            <time>{activeDemo.duration}</time>
          </div>
          <div className="demo-action-strip">
            {activeDemo.prototypeUrl ? (
              <a className="cyan-button" href={activeDemo.prototypeUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={16} />
                打开可交互原型
              </a>
            ) : null}
            <a className="ghost-button" href={activePortfolioHref}>
              <Archive size={16} />
              查看作品档案
            </a>
          </div>
        </div>
      </div>
      <div className="demo-shelf">
        {gameDemos.map((demo) => (
          <button
            className={clsx("demo-card", activeTitle === demo.title && "selected")}
            key={demo.title}
            onClick={() => setActiveTitle(demo.title)}
            type="button"
          >
            <MediaTile tile={demo.tile} />
            <span>
              <strong>{demo.title}</strong>
              <small>{demo.description}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function MusicSection({
  settings,
  onSettingsChange,
  currentUser,
}: {
  settings: SiteSettings;
  onSettingsChange: (settings: SiteSettings) => void;
  currentUser: AuthUser | null;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorite, setFavorite] = useLocalStorage("linx_music_favorite", true);
  const [tracks, setTracks] = useState<MusicTrack[]>(musicTracks);
  const [activeTrackId, setActiveTrackId] = useState(musicTracks[0].id);
  const [draft, setDraft] = useState<MusicTrackInput>(defaultMusicDraft);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving">("idle");
  const [deletingTrackId, setDeletingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isOwner = currentUser?.role === "owner";
  const isSupabase = siteBackend.mode === "supabase";
  const activeTrack = tracks.find((track) => track.id === activeTrackId) ?? tracks[0];
  const editingTrack = editingTrackId ? tracks.find((track) => track.id === editingTrackId) : null;
  const musicNavigationTarget = useSearchNavigationTarget("music");

  useEffect(() => {
    let active = true;

    async function loadMusicWorkbench() {
      setLoadState("loading");
      setStatusMessage("");

      try {
        const [remoteTracks, remoteSettings] = await Promise.all([
          siteBackend.listMusicTracks(),
          siteBackend.getSiteSettings(),
        ]);

        if (!active) {
          return;
        }

        if (remoteTracks.length > 0) {
          setTracks(remoteTracks);
          setActiveTrackId(
            musicNavigationTarget?.targetId && remoteTracks.some((track) => track.id === musicNavigationTarget.targetId)
              ? musicNavigationTarget.targetId
              : remoteTracks[0].id,
          );
        }
        onSettingsChange(remoteSettings);
        setLoadState("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadState("error");
        setStatusMessage(error instanceof Error ? error.message : "音乐数据加载失败，已使用本地歌单。");
      }
    }

    void loadMusicWorkbench();
    return () => {
      active = false;
    };
  }, [musicNavigationTarget?.targetId, onSettingsChange]);

  useEffect(() => {
    if (musicNavigationTarget?.targetId && tracks.some((track) => track.id === musicNavigationTarget.targetId)) {
      setActiveTrackId(musicNavigationTarget.targetId);
    }
  }, [musicNavigationTarget?.targetId, tracks]);

  useEffect(() => {
    setIsPlaying(false);
    audioRef.current?.pause();
  }, [activeTrackId]);

  async function handleMusicFile(file: File | null) {
    if (!file) {
      return;
    }

    if (!isOwner) {
      setStatusMessage("只有站主账号可以上传音乐。");
      return;
    }

    try {
      const uploaded = await siteBackend.uploadAsset(file, "music-audio");
      setDraft((current) => ({
        ...current,
        title: current.title || makeFileTitle(file),
        audioUrl: uploaded.url,
      }));
      setStatusMessage(isSupabase ? "音乐文件已上传。" : "本地音乐预览已准备好。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "音乐上传失败。");
    }
  }

  async function handleMusicCover(file: File | null) {
    if (!file) {
      return;
    }

    if (!isOwner) {
      setStatusMessage("只有站主账号可以上传封面。");
      return;
    }

    try {
      const uploaded = await siteBackend.uploadAsset(file, "music-cover");
      setDraft((current) => ({ ...current, coverUrl: uploaded.url }));
      setStatusMessage(isSupabase ? "音乐封面已上传。" : "本地封面预览已准备好。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "封面上传失败。");
    }
  }

  function resetMusicDraft() {
    setDraft(defaultMusicDraft);
    setEditingTrackId(null);
  }

  function startEditingTrack(track: MusicTrack = activeTrack) {
    if (!track) {
      return;
    }

    setDraft(musicTrackToDraft(track));
    setEditingTrackId(track.id);
    setStatusMessage(`正在编辑《${track.title}》，改完后点保存修改。`);
  }

  async function saveTrack() {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以登记音乐。");
      return;
    }

    const title = draft.title.trim();
    const artist = draft.artist.trim() || "私人歌单";
    const mood = draft.mood.trim() || "未分类";
    const audioUrl = draft.audioUrl.trim();

    if (!title || !audioUrl) {
      setStatusMessage("至少需要标题和音频文件。");
      return;
    }

    try {
      setSaveState("saving");
      const payload: MusicTrackInput = {
        ...draft,
        title,
        artist,
        mood,
        audioUrl,
        coverUrl: draft.coverUrl?.trim() || undefined,
        duration: draft.duration?.trim() || undefined,
      };

      const nextTrack = editingTrackId
        ? await siteBackend.updateMusicTrack(editingTrackId, payload)
        : await siteBackend.createMusicTrack(payload);

      setTracks((current) =>
        editingTrackId
          ? current.map((track) => (track.id === editingTrackId ? nextTrack : track))
          : [nextTrack, ...current],
      );
      setActiveTrackId(nextTrack.id);

      if (draft.isBackground && nextTrack.audioUrl) {
        const nextSettings = await siteBackend.updateSiteSettings({
          ...settings,
          backgroundMusicUrl: nextTrack.audioUrl,
          backgroundMusicTitle: nextTrack.title,
          backgroundMusicEnabled: true,
        });
        onSettingsChange(nextSettings);
      }

      resetMusicDraft();
      setStatusMessage(
        editingTrackId
          ? "音乐信息已更新。"
          : draft.isBackground
            ? "音乐已保存，并更新为全站背景音乐。"
            : isSupabase
              ? "音乐已写入 Supabase。"
              : "本地预览已新增音乐。",
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "保存音乐失败。");
    } finally {
      setSaveState("idle");
    }
  }

  async function deleteTrack(track: MusicTrack = activeTrack) {
    if (!isOwner || !track) {
      setStatusMessage("只有站主账号可以删除音乐。");
      return;
    }

    if (!window.confirm(`确定删除《${track.title}》这首音乐吗？`)) {
      return;
    }

    try {
      setDeletingTrackId(track.id);
      await siteBackend.deleteMusicTrack(track.id);
      setTracks((current) => {
        const nextTracks = current.filter((item) => item.id !== track.id);
        setActiveTrackId(nextTracks[0]?.id ?? "");
        return nextTracks;
      });
      if (editingTrackId === track.id) {
        resetMusicDraft();
      }
      setStatusMessage("音乐已删除。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "删除音乐失败。");
    } finally {
      setDeletingTrackId(null);
    }
  }

  async function saveBackgroundMusic(track: MusicTrack = activeTrack) {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以设置背景音乐。");
      return;
    }

    if (!track.audioUrl) {
      setStatusMessage("这首歌没有音频文件，不能设为背景音乐。");
      return;
    }

    try {
      const nextSettings = await siteBackend.updateSiteSettings({
        ...settings,
        backgroundMusicUrl: track.audioUrl,
        backgroundMusicTitle: track.title,
        backgroundMusicEnabled: true,
      });
      onSettingsChange(nextSettings);
      setStatusMessage("全站背景音乐已更新。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "背景音乐设置失败。");
    }
  }

  async function toggleTrackPlayback() {
    const audio = audioRef.current;
    if (!audio || !activeTrack?.audioUrl) {
      setIsPlaying((current) => !current);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      setIsPlaying(false);
      setStatusMessage(error instanceof Error ? error.message : "浏览器阻止了自动播放，请再点一次播放。");
    }
  }

  function selectTrackByOffset(offset: number) {
    if (tracks.length === 0) {
      return;
    }

    const currentIndex = Math.max(0, tracks.findIndex((track) => track.id === activeTrack?.id));
    const nextIndex = (currentIndex + offset + tracks.length) % tracks.length;
    setActiveTrackId(tracks[nextIndex].id);
  }

  function shuffleTrack() {
    if (tracks.length <= 1) {
      return;
    }

    const candidates = tracks.filter((track) => track.id !== activeTrack?.id);
    const nextTrack = candidates[Math.floor(Math.random() * candidates.length)];
    setActiveTrackId(nextTrack.id);
  }

  return (
    <section className="screen-section music-section" id="music">
      <ScreenIntro
        title="音乐雷达"
        description="这里可以公开展示歌单；站主登录后可以上传音乐、封面，并把任意一首设为全站背景音乐。"
      />
      <div className="player-surface">
        <audio ref={audioRef} src={activeTrack?.audioUrl} onEnded={() => setIsPlaying(false)} preload="metadata" />
        <MediaTile tile={activeTrack?.tile ?? 3} imageUrl={activeTrack?.coverUrl} className="album-art" />
        <div className="track-copy">
          <span>Now Playing</span>
          <h3>{activeTrack?.title ?? "Sable Drift"}</h3>
          <p>{activeTrack?.artist ?? "Floating Points"} · {activeTrack?.mood ?? "氛围"}</p>
        </div>
        <button
          className={clsx("heart-button", favorite && "liked")}
          onClick={() => setFavorite((current) => !current)}
          type="button"
          aria-label="收藏当前音乐"
        >
          <Heart size={20} fill={favorite ? "currentColor" : "none"} />
        </button>
        <div className="waveform" aria-hidden="true">
          {Array.from({ length: 42 }).map((_, index) => (
            <span
              key={index}
              style={{ "--bar": `${18 + ((index * 17) % 44)}%` } as CSSProperties}
            />
          ))}
        </div>
        <div className="progress-row">
          <span>{activeTrack?.audioUrl ? "在线" : "示例"}</span>
          <div className="progress-track">
            <span />
          </div>
          <span>{activeTrack?.duration ?? "06:41"}</span>
        </div>
        <div className="player-controls">
          <button onClick={shuffleTrack} type="button" aria-label="随机播放">
            <Shuffle size={18} />
          </button>
          <button onClick={() => selectTrackByOffset(-1)} type="button" aria-label="上一首">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            className="primary-play"
            onClick={() => void toggleTrackPlayback()}
            type="button"
            aria-label={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <button onClick={() => selectTrackByOffset(1)} type="button" aria-label="下一首">
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button
            className="ghost-icon-button"
            onClick={() => void saveBackgroundMusic()}
            disabled={!isOwner || !activeTrack?.audioUrl}
            type="button"
            aria-label="设为全站背景音乐"
          >
            <Volume2 size={18} />
          </button>
        </div>
      </div>
      <div className="playlist-panel">
        {tracks.map((track) => (
          <button
            className={clsx("playlist-row", activeTrack?.id === track.id && "selected")}
            type="button"
            key={track.id}
            onClick={() => setActiveTrackId(track.id)}
          >
            <MediaTile tile={track.tile ?? 3} imageUrl={track.coverUrl} />
            <span>
              <strong>{track.title}</strong>
              <small>{track.artist} · {track.duration}</small>
            </span>
            <Play size={16} fill="currentColor" />
          </button>
        ))}
        <div className="playlist-mini-row">
          {playlists.map((playlist) => (
            <span key={playlist.title}>{playlist.title} · {playlist.count} 首</span>
          ))}
        </div>
      </div>
      <div className="owner-upload-panel music-upload-panel">
        <div className="portfolio-admin-head">
          <span>{isSupabase ? "Supabase Storage" : localPreviewLabel}</span>
          <strong>{editingTrack ? "编辑当前音乐" : isOwner ? "站主音乐上传入口" : "访客只能试听公开歌单"}</strong>
        </div>
        <BackendModeNotice isSupabase={isSupabase} />
        {isOwner ? (
          <>
            <div className="owner-management-strip">
              <span>{activeTrack ? `当前：${activeTrack.title}` : "当前没有音乐"}</span>
              <button className="ghost-button" disabled={!activeTrack || saveState === "saving"} onClick={() => startEditingTrack()} type="button">
                <Edit3 size={15} />
                编辑当前
              </button>
              <button
                className="ghost-button danger"
                disabled={!activeTrack || deletingTrackId === activeTrack?.id}
                onClick={() => void deleteTrack()}
                type="button"
              >
                <Trash2 size={15} />
                删除当前
              </button>
            </div>
            <div className="owner-upload-grid">
              <label>
                <span>歌名</span>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="音乐标题"
                />
              </label>
              <label>
                <span>作者 / 来源</span>
                <input
                  value={draft.artist}
                  onChange={(event) => setDraft((current) => ({ ...current, artist: event.target.value }))}
                  placeholder="作者、OST 或歌单来源"
                />
              </label>
              <label>
                <span>氛围标签</span>
                <input
                  value={draft.mood}
                  onChange={(event) => setDraft((current) => ({ ...current, mood: event.target.value }))}
                  placeholder="战斗 / 氛围 / 专注"
                />
              </label>
              <label>
                <span>时长</span>
                <input
                  value={draft.duration}
                  onChange={(event) => setDraft((current) => ({ ...current, duration: event.target.value }))}
                  placeholder="03:45"
                />
              </label>
            </div>
            <div className="portfolio-upload-row">
              <label className="portfolio-file-picker">
                <Upload size={16} />
                <span>上传音频</span>
                <input accept="audio/*" onChange={(event) => void handleMusicFile(event.target.files?.[0] ?? null)} type="file" />
              </label>
              <label className="portfolio-file-picker">
                <ImageIcon size={16} />
                <span>上传封面</span>
                <input accept="image/*" onChange={(event) => void handleMusicCover(event.target.files?.[0] ?? null)} type="file" />
              </label>
              <button className="ghost-button" disabled={saveState === "saving"} onClick={resetMusicDraft} type="button">
                <X size={15} />
                {editingTrack ? "取消编辑" : "清空"}
              </button>
              <button className="cyan-button" disabled={saveState === "saving"} onClick={saveTrack} type="button">
                <Check size={16} />
                {saveState === "saving" ? "保存中..." : editingTrack ? "保存修改" : "保存音乐"}
              </button>
            </div>
            <label className="owner-toggle-row">
              <input
                checked={draft.isBackground}
                onChange={(event) => setDraft((current) => ({ ...current, isBackground: event.target.checked }))}
                type="checkbox"
              />
              <span>保存后也作为背景音乐候选</span>
            </label>
          </>
        ) : null}
        {loadState === "loading" ? <p className="backend-status">正在同步音乐...</p> : null}
        {statusMessage ? <p className="backend-status">{statusMessage}</p> : null}
      </div>
    </section>
  );
}

function GallerySection({
  settings,
  onSettingsChange,
  currentUser,
}: {
  settings: SiteSettings;
  onSettingsChange: (settings: SiteSettings) => void;
  currentUser: AuthUser | null;
}) {
  const [filter, setFilter] = useState("全部");
  const [items, setItems] = useState<GalleryItem[]>(galleryItems);
  const [draft, setDraft] = useState<GalleryItemInput>(defaultGalleryDraft);
  const [editingGalleryItemId, setEditingGalleryItemId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving">("idle");
  const [deletingGalleryItemId, setDeletingGalleryItemId] = useState<string | null>(null);

  const isOwner = currentUser?.role === "owner";
  const isSupabase = siteBackend.mode === "supabase";
  const galleryNavigationTarget = useSearchNavigationTarget("gallery");
  const editingGalleryItem = editingGalleryItemId ? items.find((item) => item.id === editingGalleryItemId) : null;

  const filteredItems = useMemo(() => {
    if (filter === "全部") {
      return items;
    }

    return items.filter((item) => item.category === filter);
  }, [filter, items]);

  useEffect(() => {
    if (!galleryNavigationTarget?.query) {
      return;
    }

    if (galleryFilters.includes(galleryNavigationTarget.query)) {
      setFilter(galleryNavigationTarget.query);
    }
  }, [galleryNavigationTarget]);

  useEffect(() => {
    let active = true;

    async function loadGalleryWorkbench() {
      setLoadState("loading");
      setStatusMessage("");

      try {
        const [remoteItems, remoteSettings] = await Promise.all([
          siteBackend.listGalleryItems(),
          siteBackend.getSiteSettings(),
        ]);

        if (!active) {
          return;
        }

        if (remoteItems.length > 0) {
          setItems(remoteItems);
        }
        onSettingsChange(remoteSettings);
        setLoadState("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadState("error");
        setStatusMessage(error instanceof Error ? error.message : "图库加载失败，已使用本地图片。");
      }
    }

    void loadGalleryWorkbench();
    return () => {
      active = false;
    };
  }, [onSettingsChange]);

  async function handleGalleryImage(file: File | null) {
    if (!file) {
      return;
    }

    if (!isOwner) {
      setStatusMessage("只有站主账号可以上传图片。");
      return;
    }

    try {
      const uploaded = await siteBackend.uploadAsset(file, draft.isCover ? "site-cover" : "gallery-image");
      setDraft((current) => ({
        ...current,
        title: current.title || makeFileTitle(file),
        imageUrl: uploaded.url,
      }));
      setStatusMessage(isSupabase ? "图片已上传。" : "本地图片预览已准备好。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "图片上传失败。");
    }
  }

  function resetGalleryDraft() {
    setDraft(defaultGalleryDraft);
    setEditingGalleryItemId(null);
  }

  function startEditingGalleryItem(item: GalleryItem) {
    setDraft(galleryItemToDraft(item));
    setEditingGalleryItemId(item.id);
    setStatusMessage(`正在编辑「${item.title}」，改完后点保存修改。`);
  }

  async function saveGalleryEntry() {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以登记图片。");
      return;
    }

    const title = draft.title.trim();
    const imageUrl = draft.imageUrl.trim();
    if (!title || !imageUrl) {
      setStatusMessage("至少需要标题和图片文件。");
      return;
    }

    try {
      setSaveState("saving");
      const payload: GalleryItemInput = {
        title,
        category: draft.category.trim() || "概念",
        description: draft.description?.trim() || undefined,
        imageUrl,
        isCover: draft.isCover,
      };
      const nextItem = editingGalleryItemId
        ? await siteBackend.updateGalleryItem(editingGalleryItemId, payload)
        : await siteBackend.createGalleryItem(payload);
      setItems((current) =>
        editingGalleryItemId
          ? current.map((item) => (item.id === editingGalleryItemId ? nextItem : item))
          : [nextItem, ...current],
      );
      resetGalleryDraft();

      if (nextItem.isCover && nextItem.imageUrl) {
        const nextSettings = await siteBackend.updateSiteSettings({
          ...settings,
          heroCoverUrl: nextItem.imageUrl,
        });
        onSettingsChange(nextSettings);
      }

      setStatusMessage(
        editingGalleryItemId
          ? "图片信息已更新。"
          : nextItem.isCover
            ? "图片已保存，并更新为首页封面。"
            : "图片已加入图库。",
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "保存图片失败。");
    } finally {
      setSaveState("idle");
    }
  }

  async function deleteGalleryItem(item: GalleryItem) {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以删除图片。");
      return;
    }

    if (!window.confirm(`确定删除「${item.title}」这张图片吗？`)) {
      return;
    }

    try {
      setDeletingGalleryItemId(item.id);
      await siteBackend.deleteGalleryItem(item.id);
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      if (editingGalleryItemId === item.id) {
        resetGalleryDraft();
      }
      setStatusMessage("图片已删除。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "删除图片失败。");
    } finally {
      setDeletingGalleryItemId(null);
    }
  }

  return (
    <section className="screen-section gallery-section" id="gallery">
      <ScreenIntro
        title="灵感图库"
        description="图片收藏拥有完整画廊空间；站主可以上传图片、分类整理，并把任意图片设为首页封面。"
      />
      <div className="filter-row" role="tablist" aria-label="图库筛选">
        {galleryFilters.map((item) => (
          <button
            className={clsx(filter === item && "active")}
            key={item}
            onClick={() => setFilter(item)}
            type="button"
            role="tab"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="gallery-grid">
        {filteredItems.map((item) => (
          <article key={item.id} className={clsx("gallery-card", item.isCover && "cover-selected", editingGalleryItemId === item.id && "is-editing")}>
            <MediaTile tile={item.tile ?? 4} imageUrl={item.imageUrl} />
            {isOwner ? (
              <div className="gallery-admin-actions" aria-label={`${item.title} 管理`}>
                <button aria-label={`编辑 ${item.title}`} disabled={saveState === "saving"} onClick={() => startEditingGalleryItem(item)} type="button">
                  <Edit3 size={14} />
                </button>
                <button
                  aria-label={`删除 ${item.title}`}
                  className="danger"
                  disabled={deletingGalleryItemId === item.id}
                  onClick={() => void deleteGalleryItem(item)}
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : null}
            <span>{item.title}</span>
            {item.description ? <p>{item.description}</p> : null}
            {item.isCover || (Boolean(settings.heroCoverUrl) && settings.heroCoverUrl === item.imageUrl) ? (
              <small>首页封面</small>
            ) : null}
          </article>
        ))}
      </div>
      <div className="owner-upload-panel gallery-upload-panel">
        <div className="portfolio-admin-head">
          <span>{isSupabase ? "Supabase Storage" : localPreviewLabel}</span>
          <strong>{editingGalleryItem ? "编辑图库图片" : isOwner ? "站主图片上传入口" : "访客只能浏览公开图库"}</strong>
        </div>
        <BackendModeNotice isSupabase={isSupabase} />
        {isOwner ? (
          <>
            <div className="owner-upload-grid">
              <label>
                <span>标题</span>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="图片标题"
                />
              </label>
              <label>
                <span>分类</span>
                <select
                  value={draft.category}
                  onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                >
                  {galleryFilters.filter((item) => item !== "全部").map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <span>描述</span>
              <textarea
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="这张图为什么值得收藏"
              />
            </label>
            <div className="portfolio-upload-row">
              <label className="portfolio-file-picker">
                <ImageIcon size={16} />
                <span>上传图片</span>
                <input accept="image/*" onChange={(event) => void handleGalleryImage(event.target.files?.[0] ?? null)} type="file" />
              </label>
              <button className="ghost-button" disabled={saveState === "saving"} onClick={resetGalleryDraft} type="button">
                <X size={15} />
                {editingGalleryItem ? "取消编辑" : "清空"}
              </button>
              <button className="cyan-button" disabled={saveState === "saving"} onClick={saveGalleryEntry} type="button">
                <Check size={16} />
                {saveState === "saving" ? "保存中..." : editingGalleryItem ? "保存修改" : "保存图片"}
              </button>
            </div>
            <label className="owner-toggle-row">
              <input
                checked={draft.isCover}
                onChange={(event) => setDraft((current) => ({ ...current, isCover: event.target.checked }))}
                type="checkbox"
              />
              <span>同时设置为网站首页封面</span>
            </label>
          </>
        ) : null}
        {loadState === "loading" ? <p className="backend-status">正在同步图库...</p> : null}
        {statusMessage ? <p className="backend-status">{statusMessage}</p> : null}
      </div>
    </section>
  );
}

function NotesSection({ currentUser }: { currentUser: AuthUser | null }) {
  const [notes, setNotes] = useState<ReadingNote[]>(() => (siteBackend.mode === "supabase" ? [] : readingNotes));
  const [activeKind, setActiveKind] = useState<"all" | ReadingNote["kind"]>("all");
  const [activeTag, setActiveTag] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [draft, setDraft] = useLocalStorage<ReadingNoteInput>(readingDraftStorageKey, defaultReadingDraft);
  const [tagInput, setTagInput] = useLocalStorage(readingTagDraftStorageKey, "");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving">("idle");
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);
  const [readerMessage, setReaderMessage] = useState("");
  const composerRef = useRef<HTMLDivElement | null>(null);

  const isOwner = currentUser?.role === "owner";
  const isSupabase = siteBackend.mode === "supabase";
  const notesNavigationTarget = useSearchNavigationTarget("notes");
  const draftTags = useMemo(() => parseTags(tagInput), [tagInput]);
  const availableTags = useMemo(() => [...new Set(notes.flatMap((note) => note.tags))].slice(0, 12), [notes]);
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const searchTerms = useMemo(() => normalizedSearchQuery.split(/\s+/).filter(Boolean), [normalizedSearchQuery]);
  const noteStats = useMemo(() => {
    const bookCount = notes.filter((note) => note.kind === "book").length;
    const videoCount = notes.length - bookCount;
    const tagCount = new Set(notes.flatMap((note) => note.tags)).size;
    const quoteTotal = notes.reduce((total, note) => total + note.quote.trim().length, 0);
    const averageQuoteLength = notes.length > 0 ? Math.round(quoteTotal / notes.length) : 0;

    return { bookCount, videoCount, tagCount, averageQuoteLength };
  }, [notes]);
  const sourceMix = useMemo(() => {
    const total = Math.max(notes.length, 1);

    return [
      { label: "书籍", count: noteStats.bookCount, ratio: `${Math.round((noteStats.bookCount / total) * 100)}%` },
      { label: "视频", count: noteStats.videoCount, ratio: `${Math.round((noteStats.videoCount / total) * 100)}%` },
    ];
  }, [noteStats.bookCount, noteStats.videoCount, notes.length]);
  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    notes.forEach((note) => {
      note.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });

    return [...counts.entries()]
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 4);
  }, [notes]);
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const kindMatches = activeKind === "all" || note.kind === activeKind;
      const tagMatches = activeTag === "all" || note.tags.includes(activeTag);
      const searchContent = normalizeSearchText(
        [note.title, note.creator, note.quote, note.reflection, note.tags.join(" "), note.kind === "book" ? "书籍 书摘" : "视频 笔记"]
          .filter(Boolean)
          .join(" "),
      );
      const searchMatches = searchTerms.length === 0 || searchTerms.every((term) => searchContent.includes(term));
      return kindMatches && tagMatches && searchMatches;
    });
  }, [activeKind, activeTag, notes, searchTerms]);
  const editingNote = editingNoteId ? notes.find((note) => note.id === editingNoteId) : null;
  const canPublish = Boolean(draft.title.trim() && draft.creator.trim() && draft.quote.trim());
  const quoteLength = draft.quote.trim().length;
  const latestNote = notes[0];
  const featuredNote = filteredNotes[0];
  const readerNote = (expandedNoteId ? filteredNotes.find((note) => note.id === expandedNoteId) : null) ?? featuredNote;
  const readerNoteIndex = readerNote ? filteredNotes.findIndex((note) => note.id === readerNote.id) : -1;
  const canMoveReader = filteredNotes.length > 1 && readerNoteIndex >= 0;
  const filteredQuoteTotal = filteredNotes.reduce((total, note) => total + note.quote.trim().length, 0);
  const filteredAverageQuoteLength = filteredNotes.length > 0 ? Math.round(filteredQuoteTotal / filteredNotes.length) : 0;
  const filteredLongestNote = filteredNotes.reduce<ReadingNote | null>(
    (longest, note) => (!longest || note.quote.trim().length > longest.quote.trim().length ? note : longest),
    null,
  );
  const readingIndexNotes = filteredNotes.slice(0, 8);
  const readerProgress =
    readerNote && filteredNotes.length > 0 && readerNoteIndex >= 0 ? Math.round(((readerNoteIndex + 1) / filteredNotes.length) * 100) : 0;
  const readerMinutes = readerNote ? Math.max(1, Math.ceil(readerNote.quote.trim().length / 420)) : 0;
  const hasAnyNotes = notes.length > 0;
  const hasReadingFilters = activeKind !== "all" || activeTag !== "all" || normalizedSearchQuery.length > 0;
  const publishChecks = [
    { label: "名称", ready: Boolean(draft.title.trim()) },
    { label: "来源", ready: Boolean(draft.creator.trim()) },
    { label: "摘录", ready: Boolean(draft.quote.trim()) },
    { label: "标签", ready: draftTags.length > 0, optional: true },
  ];
  const requiredPublishChecks = publishChecks.filter((item) => !item.optional);
  const publishProgress = Math.round(
    (requiredPublishChecks.filter((item) => item.ready).length / requiredPublishChecks.length) * 100,
  );
  const filterSummary =
    activeKind === "all"
      ? "全部来源"
      : activeKind === "book"
        ? "只看书籍摘录"
        : "只看视频笔记";
  const activeTagLabel = activeTag === "all" ? "全标签" : `#${activeTag}`;
  const noteSignal =
    activeKind === "video"
      ? "视频方法复盘"
      : activeKind === "book"
        ? "书籍段落拆解"
        : "策划阅读索引";
  const draftQuality = canPublish ? "可发布" : "待补全";
  const emptyStateTitle = hasAnyNotes
    ? normalizedSearchQuery
      ? "没有找到匹配的书摘"
      : "这个筛选下还没有书摘"
    : "书摘档案正在整理";
  const emptyStateCopy = hasAnyNotes
    ? normalizedSearchQuery
      ? "换个关键词，或者清空搜索后再按来源和标签筛选。"
      : "当前筛选暂时没有命中，换一个来源或标签就能继续浏览已有摘录。"
    : isOwner
      ? "线上库已连接，发布后会立即进入公开书摘档案。"
      : "站主还没有发布公开书摘；这一区会留给后续阅读笔记。";
  const emptyStateMeta = hasAnyNotes
    ? `${filterSummary} · ${activeTagLabel}`
    : isSupabase
      ? "Supabase Archive Ready"
      : "Local Reading Archive";
  const reflectionLength = draft.reflection.trim().length;
  const draftReadingMinutes = quoteLength > 0 ? Math.max(1, Math.ceil(quoteLength / 420)) : 0;
  const missingRequiredFields = requiredPublishChecks.filter((item) => !item.ready).map((item) => item.label);
  const draftSignal = canPublish ? "公开阅读字段已齐全" : `还差 ${missingRequiredFields.join(" / ") || "必填项"}`;
  const readerLabel = readerNote?.kind === "book" ? "书籍摘录" : "视频笔记";
  const readerSource = readerNote ? `${readerNote.creator} · ${readerNote.createdAt}` : "";
  const readerTagLine = readerNote && readerNote.tags.length > 0 ? readerNote.tags.join(" / ") : "未标标签";
  const readerReviewState = readerNote?.reflection.trim() ? "有策划心得" : "待补心得";
  const hasSavedReadingDraft = Boolean(
    draft.title.trim() || draft.creator.trim() || draft.quote.trim() || draft.reflection.trim() || tagInput.trim() || draft.coverUrl?.trim(),
  );
  const readerDigestItems = readerNote
    ? [
        { label: "来源", value: readerNote.creator },
        { label: "字数", value: `${readerNote.quote.trim().length} 字` },
        { label: "标签", value: `${readerNote.tags.length || 0} 个` },
        { label: "状态", value: readerReviewState },
      ]
    : [];

  function resetReadingFilters() {
    setActiveKind("all");
    setActiveTag("all");
    setSearchQuery("");
    setExpandedNoteId(null);
    setReaderMessage("");
  }

  useEffect(() => {
    let active = true;

    async function loadNotesWorkbench() {
      setLoadState("loading");
      setStatusMessage("");

      try {
        const remoteNotes = await siteBackend.listReadingNotes();

        if (!active) {
          return;
        }

        if (remoteNotes.length > 0 || siteBackend.mode === "supabase") {
          setNotes(remoteNotes);
        }
        setLoadState("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadState("error");
        setNotes(readingNotes);
        setStatusMessage(error instanceof Error ? error.message : "书摘心得加载失败，已使用本地数据。");
      }
    }

    void loadNotesWorkbench();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (activeTag !== "all" && !availableTags.includes(activeTag)) {
      setActiveTag("all");
    }
  }, [activeTag, availableTags]);

  useEffect(() => {
    if (!notesNavigationTarget) {
      return;
    }

    setActiveKind("all");
    setActiveTag("all");
    if (notesNavigationTarget.query) {
      setSearchQuery(notesNavigationTarget.query);
    }
    if (notesNavigationTarget.targetId) {
      setExpandedNoteId(notesNavigationTarget.targetId);
    }
  }, [notesNavigationTarget]);

  useEffect(() => {
    if (expandedNoteId && !filteredNotes.some((note) => note.id === expandedNoteId)) {
      setExpandedNoteId(null);
    }
  }, [expandedNoteId, filteredNotes]);

  async function handleReadingCover(file: File | null) {
    if (!file) {
      return;
    }

    if (!isOwner) {
      setStatusMessage("只有站主账号可以上传书摘封面。");
      return;
    }

    try {
      const uploaded = await siteBackend.uploadAsset(file, "reading-cover");
      setDraft((current) => ({ ...current, coverUrl: uploaded.url }));
      setStatusMessage(isSupabase ? "封面已上传。" : "本地封面预览已准备好。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "封面上传失败。");
    }
  }

  function toggleQuickTag(tag: string) {
    const tags = new Set(parseTags(tagInput));
    if (tags.has(tag)) {
      tags.delete(tag);
    } else {
      tags.add(tag);
    }
    setTagInput([...tags].join(", "));
  }

  function resetReadingDraft() {
    setDraft(defaultReadingDraft);
    setTagInput("");
    setEditingNoteId(null);
    setStatusMessage("");
  }

  function startEditingNote(note: ReadingNote) {
    setDraft(readingNoteToDraft(note));
    setTagInput(note.tags.join(", "));
    setEditingNoteId(note.id);
    setExpandedNoteId(note.id);
    setReaderMessage("");
    setStatusMessage(`正在编辑《${note.title}》，改完后点保存修改。`);
    window.requestAnimationFrame(() => composerRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
  }

  async function pasteQuoteFromClipboard() {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以导入书摘草稿。");
      return;
    }

    try {
      if (!navigator.clipboard?.readText || !window.isSecureContext) {
        throw new Error("clipboard unavailable");
      }

      const clipboardText = (await navigator.clipboard.readText()).trim();
      if (!clipboardText) {
        setStatusMessage("剪贴板里没有可导入的文字。");
        return;
      }

      setDraft((current) => ({
        ...current,
        quote: current.quote.trim() ? `${current.quote.trim()}\n\n${clipboardText}` : clipboardText,
      }));
      setStatusMessage("已把剪贴板文字导入喜欢的段落，发布前还可以继续修改。");
    } catch {
      setStatusMessage("浏览器没有开放剪贴板读取权限，可以直接 Ctrl+V 粘贴到段落输入框。");
    }
  }

  function selectReaderNote(noteId: string | null) {
    setExpandedNoteId(noteId);
    setReaderMessage("");
  }

  function moveReaderNote(direction: -1 | 1) {
    if (!canMoveReader) {
      return;
    }

    const nextIndex = (readerNoteIndex + direction + filteredNotes.length) % filteredNotes.length;
    selectReaderNote(filteredNotes[nextIndex].id);
  }

  async function copyReaderQuote() {
    if (!readerNote) {
      return;
    }

    const copyText = [
      `《${readerNote.title}》 - ${readerNote.creator}`,
      "",
      readerNote.quote,
      readerNote.reflection ? `\n心得：${readerNote.reflection}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const copyWithSelection = () => {
      const textarea = document.createElement("textarea");
      textarea.value = copyText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    };

    const selectVisibleQuote = () => {
      const quoteElement = document.querySelector(".note-reader-copy blockquote span");
      const selection = window.getSelection();
      if (!quoteElement || !selection) {
        return false;
      }

      const range = document.createRange();
      range.selectNodeContents(quoteElement);
      selection.removeAllRanges();
      selection.addRange(range);
      return true;
    };

    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(copyText);
      } else if (!copyWithSelection()) {
        throw new Error("copy blocked");
      }
      setReaderMessage("摘录已复制，可以直接贴到聊天或文档里。");
    } catch {
      setReaderMessage(selectVisibleQuote() ? "已帮你选中摘录，可以按 Ctrl+C 手动复制。" : "浏览器拦截了复制，可以手动选中摘录复制。");
    }
  }

  async function saveReadingNote() {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以发布书摘心得。");
      return;
    }

    const title = draft.title.trim();
    const creator = draft.creator.trim();
    const quote = draft.quote.trim();
    const reflection = draft.reflection.trim();

    if (!title || !creator || !quote) {
      setStatusMessage("书籍名称、作者/来源和喜欢的段落都需要填写。");
      return;
    }

    const payload: ReadingNoteInput = {
      ...draft,
      title,
      creator,
      quote,
      reflection: reflection || "",
      sourceUrl: draft.sourceUrl?.trim() || undefined,
      coverUrl: draft.coverUrl?.trim() || undefined,
      tags: draftTags,
    };

    try {
      setSaveState("saving");

      if (editingNoteId) {
        const updatedNote = await siteBackend.updateReadingNote(editingNoteId, payload);
        setNotes((current) => current.map((note) => (note.id === editingNoteId ? updatedNote : note)));
        resetReadingDraft();
        setExpandedNoteId(updatedNote.id);
        setReaderMessage("已切到刚保存的书摘。");
        setStatusMessage(isSupabase ? "书摘修改已同步到线上。" : "本地预览已更新书摘。");
        return;
      }

      const nextNote = await siteBackend.createReadingNote(payload);
      setNotes((current) => [nextNote, ...current]);
      resetReadingDraft();
      setExpandedNoteId(nextNote.id);
      setReaderMessage("已切到刚发布的书摘。");
      setStatusMessage(isSupabase ? "书摘心得已写入 Supabase。" : "本地预览已新增书摘心得。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "保存书摘心得失败。");
    } finally {
      setSaveState("idle");
    }
  }

  async function deleteReadingNote(note: ReadingNote) {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以删除书摘心得。");
      return;
    }

    if (!window.confirm(`确定删除《${note.title}》这条书摘吗？`)) {
      return;
    }

    try {
      setDeletingNoteId(note.id);
      await siteBackend.deleteReadingNote(note.id);
      setNotes((current) => current.filter((item) => item.id !== note.id));
      if (editingNoteId === note.id) {
        resetReadingDraft();
      }
      if (expandedNoteId === note.id) {
        setExpandedNoteId(null);
      }
      setStatusMessage(isSupabase ? "书摘已从线上删除。" : "本地预览已删除书摘。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "删除书摘心得失败。");
    } finally {
      setDeletingNoteId(null);
    }
  }

  return (
    <section className="screen-section notes-section" id="notes">
      <aside className="notes-rail">
        <ScreenIntro
          title="书摘心得"
          description="把读到的好段落沉淀成可检索的策划方法库：书名、来源、摘录、心得和标签都能被稳定保存。"
        />
        <div className="notes-stat-grid" aria-label="书摘统计">
          <span>
            <strong>{notes.length}</strong>
            全部摘录
          </span>
          <span>
            <strong>{noteStats.bookCount}</strong>
            书籍
          </span>
          <span>
            <strong>{noteStats.videoCount}</strong>
            视频
          </span>
          <span>
            <strong>{noteStats.tagCount}</strong>
            标签
          </span>
        </div>
        <div className="notes-reading-lens">
          <span>当前视图</span>
          <strong>{filterSummary}</strong>
          <p>
            {activeTagLabel} · {filteredNotes.length} 条命中 · 平均 {filteredAverageQuoteLength} 字
          </p>
          {readerNote ? (
            <small>
              正在读：{readerNote.title} · {readerMinutes} 分钟
            </small>
          ) : null}
        </div>
        <div className="notes-source-map" aria-label="书摘来源分布">
          <span className="notes-source-kicker">来源分布</span>
          {sourceMix.map((item) => (
            <div className="notes-source-row" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.count}</strong>
              <div className="notes-source-meter" aria-hidden="true">
                <span style={{ "--source-ratio": item.ratio } as CSSProperties} />
              </div>
            </div>
          ))}
          {topTags.length > 0 ? (
            <div className="notes-top-tags" aria-label="高频标签">
              {topTags.map(([tag, count]) => (
                <button className={clsx(activeTag === tag && "active")} key={tag} onClick={() => setActiveTag(tag)} type="button">
                  #{tag}
                  <small>{count}</small>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {featuredNote ? (
          <div className="notes-featured-note">
            <span>
              <Sparkles size={14} />
              本组重点
            </span>
            <strong>{featuredNote.title}</strong>
            <p>{featuredNote.reflection || featuredNote.quote}</p>
          </div>
        ) : null}
        <div className="notes-archive-mark">
          <BookOpenText size={18} />
          <span>{isOwner ? "站主发布通道已开启" : "公开阅读模式"}</span>
          {latestNote ? <small>最新：{latestNote.title}</small> : null}
        </div>
      </aside>
      <div className="notes-workbench">
        <div className="notes-command">
          <div className="notes-command-title">
            <span>Reading Archive</span>
            <strong>{filterSummary}</strong>
            <small>{noteSignal} · {activeTagLabel}</small>
          </div>
          <div className="notes-filter-stack">
            <div className="filter-row" role="tablist" aria-label="书摘筛选">
              {[
                { id: "all", label: "全部" },
                { id: "book", label: "书籍" },
                { id: "video", label: "视频" },
              ].map((item) => (
                <button
                  className={clsx(activeKind === item.id && "active")}
                  key={item.id}
                  onClick={() => setActiveKind(item.id as "all" | ReadingNote["kind"])}
                  type="button"
                  role="tab"
                  aria-selected={activeKind === item.id}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {availableTags.length > 0 ? (
              <div className="notes-tag-filter" aria-label="书摘标签筛选">
                <button className={clsx(activeTag === "all" && "active")} onClick={() => setActiveTag("all")} type="button">
                  全部标签
                </button>
                {availableTags.map((tag) => (
                  <button className={clsx(activeTag === tag && "active")} key={tag} onClick={() => setActiveTag(tag)} type="button">
                    {tag}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="notes-command-tools">
            <label className="notes-search-box" aria-label="搜索书摘">
              <Search size={16} aria-hidden="true" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="搜书名、作者、摘录、心得..."
                type="search"
              />
            </label>
            {hasReadingFilters ? (
              <button className="ghost-button notes-clear-button" onClick={resetReadingFilters} type="button">
                <X size={15} />
                清空筛选
              </button>
            ) : null}
          </div>
          {loadState === "loading" ? <span className="notes-sync-state">正在同步书摘...</span> : null}
          {!isOwner && statusMessage ? <span className="notes-sync-state">{statusMessage}</span> : null}
          <div className="notes-active-summary" aria-label="当前书摘摘要">
            <span>
              <BookOpenText size={14} />
              {filteredNotes.length} 条命中
            </span>
            <span>
              <Quote size={14} />
              均值 {filteredAverageQuoteLength} 字
            </span>
            {filteredLongestNote ? (
              <span>
                <Sparkles size={14} />
                最长：{filteredLongestNote.title}
              </span>
            ) : null}
          </div>
        </div>

        <div className={clsx("notes-layout", isOwner && "has-composer")}>
          <div className="notes-grid">
            {readerNote ? (
              <article className="note-reader-panel" aria-label="当前选读书摘">
                <div className="note-reader-media">
                  {readerNote.coverUrl ? (
                    <img src={readerNote.coverUrl} alt={readerNote.title} />
                  ) : (
                    <MediaTile tile={readerNote.kind === "book" ? 1 : 2} />
                  )}
                </div>
                <div className="note-reader-copy">
                  <span className="note-reader-kicker">
                    <Sparkles size={14} />
                    当前选读 · {readerLabel}
                  </span>
                  <h3>{readerNote.title}</h3>
                  <p className="note-reader-brief">{readerNote.reflection || "这条摘录还没有补充心得，适合先作为素材入口保留。"}</p>
                  <div className="note-meta-line">
                    <span>
                      <BookOpenText size={13} />
                      {readerNote.creator}
                    </span>
                    <time dateTime={readerNote.createdAt}>
                      <CalendarDays size={13} />
                      {readerNote.createdAt}
                    </time>
                  </div>
                  <div className="note-reader-document" aria-label={`${readerNote.title} 摘录正文`}>
                    <div className="note-reader-document-head">
                      <span>{readerLabel}</span>
                      <strong>{readerSource}</strong>
                    </div>
                    <div className="note-reader-digest" aria-label={`${readerNote.title} 速读摘要`}>
                      {readerDigestItems.map((item) => (
                        <span key={item.label}>
                          <small>{item.label}</small>
                          <strong>{item.value}</strong>
                        </span>
                      ))}
                    </div>
                    <blockquote>
                      <Quote size={18} />
                      <span>{readerNote.quote}</span>
                    </blockquote>
                    {readerNote.reflection.trim() ? (
                      <div className="note-reader-reflection">
                        <span>策划心得</span>
                        <p>{readerNote.reflection}</p>
                      </div>
                    ) : null}
                  </div>
                  <div className="note-reader-toolbar" aria-label="选读控制">
                    <span>
                      {readerNoteIndex >= 0 ? `${readerNoteIndex + 1} / ${filteredNotes.length}` : "0 / 0"}
                      <small>{readerNote.quote.trim().length} 字摘录</small>
                    </span>
                    <div className="note-reader-nav">
                      <button
                        aria-label="上一条书摘"
                        disabled={!canMoveReader}
                        onClick={() => moveReaderNote(-1)}
                        type="button"
                      >
                        <SkipBack size={14} />
                      </button>
                      <button
                        aria-label="下一条书摘"
                        disabled={!canMoveReader}
                        onClick={() => moveReaderNote(1)}
                        type="button"
                      >
                        <SkipForward size={14} />
                      </button>
                      <button className="note-copy-button" onClick={() => void copyReaderQuote()} type="button">
                        <Copy size={14} />
                        复制摘录
                      </button>
                    </div>
                  </div>
                  <div className="note-reader-progress" aria-label={`阅读进度 ${readerProgress}%`}>
                    <span style={{ "--reader-progress": `${readerProgress}%` } as CSSProperties} />
                  </div>
                  <div className="note-reader-signals" aria-label={`${readerNote.title} 阅读节奏`}>
                    <span>
                      <strong>{readerMinutes}</strong>
                      分钟阅读
                    </span>
                    <span>
                      <strong>{readerNote.tags.length || 0}</strong>
                      个标签
                    </span>
                    <span>
                      <strong>{readerNote.reflection.trim() ? "有" : "无"}</strong>
                      心得
                    </span>
                  </div>
                  <div className="note-reader-context" aria-label={`${readerNote.title} 阅读信息`}>
                    <span>
                      <BookOpenText size={13} />
                      {readerLabel}
                    </span>
                    <span>
                      <Tags size={13} />
                      {readerTagLine}
                    </span>
                    <span>
                      <Quote size={13} />
                      {readerNote.reflection.trim() ? "含心得" : "纯摘录"}
                    </span>
                  </div>
                  <div className="note-reader-actions">
                    {readerNote.tags.map((tag) => (
                      <button className={clsx(activeTag === tag && "active")} key={tag} onClick={() => setActiveTag(tag)} type="button">
                        {tag}
                      </button>
                    ))}
                    {readerNote.sourceUrl ? (
                      <a href={readerNote.sourceUrl} target="_blank" rel="noreferrer">
                        <ExternalLink size={14} />
                        打开来源
                      </a>
                    ) : null}
                  </div>
                  {readerMessage ? <span className="note-reader-feedback">{readerMessage}</span> : null}
                </div>
              </article>
            ) : null}
            {readingIndexNotes.length > 1 ? (
              <nav className="notes-mini-index" aria-label="书摘目录">
                <div className="notes-mini-index-head">
                  <span>阅读目录</span>
                  <strong>{filteredNotes.length} 条</strong>
                </div>
                <div className="notes-mini-index-list">
                  {readingIndexNotes.map((note, index) => (
                    <button
                      className={clsx(readerNote?.id === note.id && "active")}
                      key={note.id}
                      onClick={() => selectReaderNote(note.id)}
                      type="button"
                    >
                      <span>#{String(index + 1).padStart(2, "0")}</span>
                      <strong>{note.title}</strong>
                      <small>
                        {note.creator} · {note.quote.trim().length} 字
                      </small>
                    </button>
                  ))}
                </div>
              </nav>
            ) : null}
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note, index) => (
                <article
                  className={clsx(
                    "note-card",
                    editingNoteId === note.id && "is-editing",
                    expandedNoteId === note.id && "is-expanded",
                    readerNote?.id === note.id && "is-selected",
                  )}
                  key={note.id}
                >
                  <div className="note-cover-wrap">
                    {note.coverUrl ? (
                      <img src={note.coverUrl} alt={note.title} />
                    ) : (
                      <MediaTile tile={note.kind === "book" ? 1 : 2} />
                    )}
                    <span className="note-kind">{note.kind === "book" ? "书籍" : "视频"}</span>
                    <span className="note-index">#{String(index + 1).padStart(2, "0")}</span>
                    {isOwner ? (
                      <div className="note-admin-actions" aria-label={`${note.title} 管理`}>
                        <button
                          aria-label={`编辑 ${note.title}`}
                          disabled={saveState === "saving"}
                          onClick={() => startEditingNote(note)}
                          type="button"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          aria-label={`删除 ${note.title}`}
                          className="danger"
                          disabled={deletingNoteId === note.id}
                          onClick={() => void deleteReadingNote(note)}
                          type="button"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="note-card-body">
                    <header className="note-card-head">
                      <div className="note-meta-line">
                        <span>
                          <BookOpenText size={13} />
                          {note.creator}
                        </span>
                        <time dateTime={note.createdAt}>
                          <CalendarDays size={13} />
                          {note.createdAt}
                        </time>
                      </div>
                      <h3>{note.title}</h3>
                    </header>
                    <div className="note-card-reading-meta">
                      <span>{note.kind === "book" ? "书籍摘录" : "视频笔记"}</span>
                      <span>{Math.max(1, Math.ceil(note.quote.trim().length / 420))} 分钟</span>
                      {note.reflection.trim() ? <span>含心得</span> : null}
                    </div>
                    <blockquote>
                      <Quote size={18} />
                      <span>{note.quote}</span>
                    </blockquote>
                    {note.reflection.trim() ? (
                      <p className="note-reflection">
                        <BookOpenText size={13} />
                        <span>{note.reflection}</span>
                      </p>
                    ) : null}
                    {note.tags.length > 0 ? (
                      <div className="tag-row note-tags">
                        {note.tags.map((tag) => (
                          <button className={clsx(activeTag === tag && "active")} key={tag} onClick={() => setActiveTag(tag)} type="button">
                            {tag}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {note.sourceUrl ? (
                      <a className="note-source-link" href={note.sourceUrl} target="_blank" rel="noreferrer">
                        <ExternalLink size={15} />
                        打开来源
                      </a>
                    ) : null}
                    <div className="note-card-footer" aria-label={`${note.title} 摘录信息`}>
                      <span>{note.quote.trim().length} 字摘录</span>
                      <span>{note.tags.length || 0} 个标签</span>
                      <button
                        className="note-expand-button"
                        aria-pressed={expandedNoteId === note.id}
                        onClick={() => selectReaderNote(expandedNoteId === note.id ? null : note.id)}
                        type="button"
                      >
                        {expandedNoteId === note.id ? "收起" : "阅读全文"}
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="notes-empty-state">
                <div className="notes-empty-icon">
                  <BookOpenText size={28} />
                </div>
                <span className="notes-empty-kicker">{emptyStateMeta}</span>
                <strong>{emptyStateTitle}</strong>
                <p>{emptyStateCopy}</p>
                <div className="notes-empty-actions">
                  {hasReadingFilters ? (
                    <button className="ghost-button" onClick={resetReadingFilters} type="button">
                      <X size={15} />
                      清空筛选
                    </button>
                  ) : isOwner ? (
                    <button
                      className="cyan-button"
                      onClick={() => composerRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" })}
                      type="button"
                    >
                      <PenLine size={15} />
                      写第一条书摘
                    </button>
                  ) : (
                    <>
                      <a className="cyan-button" href="#docs">
                        <FileText size={15} />
                        先看策划档案
                      </a>
                      <a className="ghost-button" href="#comments">
                        <MessageCircle size={15} />
                        给我留言
                      </a>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {isOwner ? (
            <div className={clsx("owner-upload-panel notes-upload-panel reading-composer", editingNote && "is-editing")} ref={composerRef}>
              <div className="portfolio-admin-head">
                <span>{isSupabase ? "Supabase RLS · 线上保存" : localPreviewLabel}</span>
                <strong>{editingNote ? "编辑已发布书摘" : "站主书摘发布入口"}</strong>
              </div>
              <BackendModeNotice isSupabase={isSupabase} />
              <div className={clsx("reading-draft-state", hasSavedReadingDraft && "has-draft")}>
                <span>
                  <ShieldCheck size={14} />
                  {hasSavedReadingDraft ? "草稿已在本机自动保留" : "输入后会自动保存草稿"}
                </span>
                <button className="ghost-button" disabled={saveState === "saving"} onClick={() => void pasteQuoteFromClipboard()} type="button">
                  <Copy size={14} />
                  从剪贴板导入段落
                </button>
              </div>

              <div className="reading-draft-preview">
                <span>
                  {editingNote ? <Edit3 size={14} /> : <PenLine size={14} />}
                  {editingNote ? "正在编辑" : "即将发布"}
                </span>
                <strong>{draft.title.trim() || "未命名书摘"}</strong>
                <p>{draft.quote.trim() || "复制或输入你喜欢的一段书中内容，这里会实时预览。"}</p>
                <div className="reading-draft-meta">
                  <span>{draft.kind === "book" ? "书籍摘录" : "视频笔记"}</span>
                  <span>{quoteLength} 字</span>
                  <span>{draftTags.length} 标签</span>
                  <span>{draftQuality}</span>
                </div>
              </div>
              <div className="reading-publish-checks" aria-label="发布检查">
                {publishChecks.map((item) => (
                  <span className={clsx(item.ready && "is-ready", item.optional && "is-optional")} key={item.label}>
                    <Check size={13} />
                    {item.label}
                    {item.optional ? "可选" : ""}
                  </span>
                ))}
              </div>
              <div className="reading-publish-meter" aria-label={`必填项完成度 ${publishProgress}%`}>
                <span style={{ "--publish-progress": `${publishProgress}%` } as CSSProperties} />
              </div>
              <div className="reading-composer-helper" aria-label="书摘发布状态">
                <span>
                  <PenLine size={14} />
                  {draftSignal}
                </span>
                <span>
                  <BookOpenText size={14} />
                  {draftReadingMinutes || 0} 分钟阅读
                </span>
                <span>
                  <Quote size={14} />
                  心得 {reflectionLength} 字
                </span>
              </div>

              <div className="owner-upload-grid">
                <label>
                  <span>类型</span>
                  <select
                    value={draft.kind}
                    onChange={(event) =>
                      setDraft((current) => ({ ...current, kind: event.target.value as ReadingNote["kind"] }))
                    }
                  >
                    <option value="book">书籍</option>
                    <option value="video">视频</option>
                  </select>
                </label>
                <label>
                  <span>书籍 / 作品名称</span>
                  <input
                    value={draft.title}
                    onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                    placeholder="例如：体验引擎"
                  />
                </label>
                <label>
                  <span>作者 / 来源</span>
                  <input
                    value={draft.creator}
                    onChange={(event) => setDraft((current) => ({ ...current, creator: event.target.value }))}
                    placeholder="作者、频道或课程来源"
                  />
                </label>
                <label>
                  <span>来源链接</span>
                  <input
                    value={draft.sourceUrl}
                    onChange={(event) => setDraft((current) => ({ ...current, sourceUrl: event.target.value }))}
                    placeholder="可选"
                  />
                </label>
              </div>

              <label className="reading-wide-field">
                <span>喜欢的段落</span>
                <textarea
                  value={draft.quote}
                  onChange={(event) => setDraft((current) => ({ ...current, quote: event.target.value }))}
                  placeholder="把你看到的书中段落复制到这里"
                />
              </label>
              <label className="reading-wide-field">
                <span>心得评论（可选）</span>
                <textarea
                  value={draft.reflection}
                  onChange={(event) => setDraft((current) => ({ ...current, reflection: event.target.value }))}
                  placeholder="可选：这段话对你的策划方法有什么启发？"
                />
              </label>

              <label className="reading-wide-field">
                <span>标签</span>
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="体验设计, 关卡, 系统"
                />
              </label>
              <div className="reading-quick-tags" aria-label="快速标签">
                {readingQuickTags.map((tag) => (
                  <button className={clsx(draftTags.includes(tag) && "active")} key={tag} onClick={() => toggleQuickTag(tag)} type="button">
                    <Tags size={12} />
                    {tag}
                  </button>
                ))}
              </div>

              {draft.coverUrl ? (
                <div className="reading-cover-preview">
                  <img src={draft.coverUrl} alt="书摘封面预览" />
                  <div>
                    <strong>封面预览</strong>
                    <span>保存后会展示在公开书摘卡片上。</span>
                  </div>
                  <button className="ghost-button" onClick={() => setDraft((current) => ({ ...current, coverUrl: "" }))} type="button">
                    <X size={15} />
                    移除
                  </button>
                </div>
              ) : null}

              <div className="portfolio-upload-row reading-action-row">
                <label className="portfolio-file-picker">
                  <ImageIcon size={16} />
                  <span>{draft.coverUrl ? "封面已就绪" : "上传封面"}</span>
                  <input accept="image/*" onChange={(event) => void handleReadingCover(event.target.files?.[0] ?? null)} type="file" />
                </label>
                <div className="reading-count">
                  <strong>{quoteLength}</strong>
                  段落字数
                </div>
                <button className="ghost-button" disabled={saveState === "saving"} onClick={resetReadingDraft} type="button">
                  <X size={15} />
                  {editingNote ? "取消编辑" : "清空"}
                </button>
                <button className="cyan-button" disabled={!canPublish || loadState === "loading" || saveState === "saving"} onClick={saveReadingNote} type="button">
                  <Check size={16} />
                  {saveState === "saving" ? "保存中..." : editingNote ? "保存修改" : "发布到书摘"}
                </button>
              </div>
              {statusMessage ? <p className="backend-status">{statusMessage}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function PrivateSection({ currentUser }: { currentUser: AuthUser | null }) {
  const [posts, setPosts] = useLocalStorage<OwnerPost[]>("linx_owner_posts", seedOwnerPosts);
  const [titleDraft, setTitleDraft] = useState("");
  const [draft, setDraft] = useState("");
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [saveState, setSaveState] = useState<"idle" | "saving">("idle");
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const isOwner = currentUser?.role === "owner";
  const isSupabase = siteBackend.mode === "supabase";
  const editingPost = editingPostId ? posts.find((post) => post.id === editingPostId) : null;

  useEffect(() => {
    let active = true;

    async function loadPrivateState() {
      setLoadState("loading");
      setStatusMessage("");

      try {
        const remotePosts = await siteBackend.listOwnerPosts();

        if (!active) {
          return;
        }

        if (remotePosts.length > 0 || siteBackend.mode === "supabase") {
          setPosts(remotePosts);
        }
        setLoadState("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadState("error");
        setStatusMessage(error instanceof Error ? error.message : "站主动态加载失败。");
      }
    }

    void loadPrivateState();
    return () => {
      active = false;
    };
  }, [setPosts]);

  function resetPostDraft() {
    setTitleDraft("");
    setDraft("");
    setEditingPostId(null);
  }

  function startEditingPost(post: OwnerPost) {
    setTitleDraft(post.title);
    setDraft(post.body);
    setEditingPostId(post.id);
    setStatusMessage(`正在编辑「${post.title}」。`);
  }

  async function savePost() {
    const body = draft.trim();
    if (!body) {
      return;
    }

    if (!isOwner) {
      setStatusMessage("只有站主账号可以发布动态。");
      return;
    }

    try {
      setSaveState("saving");
      const payload = {
        title: titleDraft.trim() || "站主更新",
        body,
        visibility: "public",
      } as const;
      const nextPost = editingPostId
        ? await siteBackend.updateOwnerPost(editingPostId, payload)
        : await siteBackend.createOwnerPost(payload);
      setPosts((current) =>
        editingPostId
          ? current.map((post) => (post.id === editingPostId ? nextPost : post))
          : [nextPost, ...current],
      );
      resetPostDraft();
      setStatusMessage(editingPostId ? "动态已更新。" : isSupabase ? "已发布到站主动态。" : "本地预览已保存。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "保存动态失败。");
    } finally {
      setSaveState("idle");
    }
  }

  async function deletePost(post: OwnerPost) {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以删除动态。");
      return;
    }

    if (!window.confirm(`确定删除「${post.title}」这条动态吗？`)) {
      return;
    }

    try {
      setDeletingPostId(post.id);
      await siteBackend.deleteOwnerPost(post.id);
      setPosts((current) => current.filter((candidate) => candidate.id !== post.id));
      if (editingPostId === post.id) {
        resetPostDraft();
      }
      setStatusMessage("动态已删除。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "删除动态失败。");
    } finally {
      setDeletingPostId(null);
    }
  }

  function applyComposerAction(label: string) {
    const snippets: Record<string, string> = {
      发布想法: "",
      上传图片: "\n![图片说明](粘贴图片链接)\n",
      嵌入代码: "\n```text\n这里写代码或配置片段\n```\n",
      待办清单: "\n- [ ] 待办事项\n- [ ] 下一个更新点\n",
    };

    setDraft((current) => `${current}${snippets[label] ?? ""}`);
  }

  return (
    <section className="screen-section private-section" id="private">
      <ScreenIntro
        title="站主动态"
        description="这里放一些阶段更新、临时想法和有感而发的记录。所有人都能看，只有站主账号能发布。"
      />
      <div className="owner-login">
        <div>
          <span>{isSupabase ? "Supabase Auth + RLS" : localPreviewLabel}</span>
          <strong>{isOwner ? "站主发布权限已开启" : "公开阅读模式"}</strong>
        </div>
        {!isOwner ? <p>登录站主账号后，这里会自动出现发布入口。</p> : null}
      </div>
      {isOwner ? (
        <div className="private-composer">
        <div className="composer-lock">
          <LockKeyhole size={18} />
          <span>{editingPost ? "正在编辑已发布动态" : "站主可发布，访客可阅读"}</span>
        </div>
        <input
          className="post-title-input"
          value={titleDraft}
          onChange={(event) => setTitleDraft(event.target.value)}
          disabled={loadState === "loading"}
          maxLength={80}
          placeholder="动态标题，例如：本周作品集更新"
        />
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          disabled={!isOwner || loadState === "loading"}
          maxLength={2000}
          placeholder="记录想法、测试点子、待办、碎片..."
        />
        <div className="composer-bottom">
          <div className="owner-actions">
            {ownerActions.map((action) => {
              const Icon = action.icon;
              return (
                <button onClick={() => applyComposerAction(action.label)} type="button" key={action.label} aria-label={action.label}>
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
          <span>{draft.length} / 2000</span>
          <button className="ghost-button" disabled={saveState === "saving"} onClick={resetPostDraft} type="button">
            <X size={15} />
            {editingPost ? "取消编辑" : "清空"}
          </button>
          <button className="cyan-button" disabled={!isOwner || loadState === "loading" || saveState === "saving"} onClick={savePost} type="button">
            <Check size={16} />
            {saveState === "saving" ? "保存中..." : editingPost ? "保存修改" : "发布动态"}
          </button>
        </div>
        </div>
      ) : null}
      {statusMessage ? <p className="backend-status">{statusMessage}</p> : null}
      <div className="post-stack">
        {posts.length > 0 ? (
          posts.slice(0, 6).map((post) => (
            <article key={post.id} className={clsx("mini-post", editingPostId === post.id && "is-editing")}>
              <div>
                <strong>{post.title}</strong>
                <time>{post.createdAt}</time>
              </div>
              <p>{post.body}</p>
              {isOwner ? (
                <div className="mini-post-actions">
                  <button disabled={saveState === "saving"} onClick={() => startEditingPost(post)} type="button">
                    <Edit3 size={14} />
                    编辑
                  </button>
                  <button className="danger" disabled={deletingPostId === post.id} onClick={() => void deletePost(post)} type="button">
                    <Trash2 size={14} />
                    删除
                  </button>
                </div>
              ) : null}
            </article>
          ))
        ) : (
          <div className="archive-empty-state post-empty-state">
            <div className="archive-empty-icon">
              <Bell size={26} />
            </div>
            <span>{isSupabase ? "Supabase Updates Ready" : "Local Updates Ready"}</span>
            <strong>公开更新待发布</strong>
            <p>{isOwner ? "写下第一条阶段更新后，访客会在这里看到你的作品进度。" : "站主还没有发布公开动态；这里会用于同步作品集更新、测试记录和阶段想法。"}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function GitHubIssueComments() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadError, setLoadError] = useState(false);
  const localPreview = isLocalRuntimeHost();

  useEffect(() => {
    if (!containerRef.current || localPreview) {
      return;
    }

    containerRef.current.replaceChildren();
    setLoadError(false);

    const script = document.createElement("script");
    script.src = "https://utteranc.es/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("repo", githubCommentsRepo);
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("label", "site-comment");
    script.setAttribute("theme", "github-light");
    script.setAttribute("loading", "lazy");
    script.onerror = () => setLoadError(true);

    const timeoutId = window.setTimeout(() => {
      containerRef.current?.append(script);
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
      script.remove();
    };
  }, [localPreview]);

  return (
    <div className="github-comments-panel" aria-label="GitHub Issues 评论">
      <div>
        <span>静态站备用评论</span>
        <strong>GitHub Issues 兜底留言</strong>
      </div>
      <p>
        当前环境没有启用 Supabase 账号系统时，下面的备用面板会把公开留言保存到仓库 Issues；正式账号留言仍以 Supabase 为准。
      </p>
      {loadError ? <p className="backend-status">GitHub 评论面板加载失败，可以刷新页面后重试。</p> : null}
      {localPreview ? (
        <p className="backend-status">本地预览不加载外部 GitHub 评论脚本；线上 GitHub Pages 会自动加载。</p>
      ) : (
        <div ref={containerRef} className="github-comments-frame" />
      )}
    </div>
  );
}

function CommentsSection({
  currentUser,
  authState,
  authMessage,
  passwordRecoveryReady,
  onAuthSubmit,
  onSignOut,
  onProfileUpdate,
  onAvatarUpload,
  onResendConfirmation,
  onPasswordReset,
  onUpdatePassword,
}: {
  currentUser: AuthUser | null;
  authState: LoadState;
  authMessage: string;
  passwordRecoveryReady: boolean;
  onAuthSubmit: (input: AccountDraft) => Promise<void>;
  onSignOut: () => Promise<void>;
  onProfileUpdate: (input: { username: string; avatarUrl?: string }) => Promise<AuthUser>;
  onAvatarUpload: (file: File) => Promise<{ publicUrl: string; storagePath: string }>;
  onResendConfirmation: (email: string) => Promise<void>;
  onPasswordReset: (email: string) => Promise<void>;
  onUpdatePassword: (password: string) => Promise<void>;
}) {
  const [comments, setComments] = useLocalStorage<Comment[]>("linx_comments", seedComments);
  const [commentBody, setCommentBody] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [gate, setGate] = useState<HumanGateState>(() => createHumanGate());
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const isOwner = currentUser?.role === "owner";
  const visibleComments = useMemo(() => comments.filter(isDisplayableComment), [comments]);

  useEffect(() => {
    let active = true;

    async function loadComments() {
      setLoadState("loading");
      setStatusMessage("");

      try {
        const remoteComments = await siteBackend.listComments();

        if (!active) {
          return;
        }

        if (remoteComments.length > 0 || siteBackend.mode === "supabase") {
          setComments(remoteComments);
        }
        setLoadState("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadState("error");
        setStatusMessage(error instanceof Error ? error.message : "留言加载失败，已保留本地缓存。");
      }
    }

    void loadComments();
    return () => {
      active = false;
    };
  }, [setComments]);

  async function publishComment() {
    const body = commentBody.trim();
    if (!body) {
      return;
    }

    if (!currentUser) {
      setStatusMessage("请先登录账号，再留言。");
      return;
    }

    if (!checkHumanGate(gate)) {
      setStatusMessage("验证没有通过：请完成算术题，停留两秒后再提交。");
      return;
    }

    try {
      const nextComment = await siteBackend.createComment({
        author: currentUser.username || currentUser.email.split("@")[0],
        body,
        verificationElapsedMs: Date.now() - gate.createdAt,
        honeypot: gate.honeypot,
      });
      setComments((current) => [nextComment, ...current]);
      setCommentBody("");
      setGate(createHumanGate());
      setStatusMessage(siteBackend.mode === "supabase" ? "留言已发布。" : "本地预览留言已保存。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "留言发布失败。");
    }
  }

  function likeComment(id: string) {
    setComments((current) => {
      const target = current.find((comment) => comment.id === id);
      const nextLikes = (target?.likes ?? 0) + 1;

      if (target) {
        void siteBackend.likeComment(id, nextLikes).catch((error: unknown) => {
          setStatusMessage(error instanceof Error ? error.message : "点赞同步失败。");
        });
      }

      return current.map((comment) =>
        comment.id === id ? { ...comment, likes: nextLikes } : comment,
      );
    });
  }

  function replyTo(authorName: string) {
    setCommentBody((current) => current || `回复 @${authorName}：`);
  }

  async function deleteComment(comment: Comment) {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以删除留言。");
      return;
    }

    if (!window.confirm(`确定删除 ${comment.author} 的这条留言吗？`)) {
      return;
    }

    try {
      setDeletingCommentId(comment.id);
      await siteBackend.deleteComment(comment.id);
      setComments((current) => current.filter((item) => item.id !== comment.id));
      setStatusMessage(siteBackend.mode === "supabase" ? "留言已从线上删除。" : "本地预览已删除留言。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "删除留言失败。");
    } finally {
      setDeletingCommentId(null);
    }
  }

  return (
    <section className="screen-section comments-section" id="comments">
      <ScreenIntro
        title="留言墙"
        description="访客注册或登录后可以留言，也可以维护自己的用户名和头像。提交前会经过轻量验证，降低刷屏和脚本灌水风险。"
      />
      {!currentUser ? (
        <AccountPanel
          user={currentUser}
          authState={authState}
          authMessage={authMessage}
          passwordRecoveryReady={passwordRecoveryReady}
          onSubmit={onAuthSubmit}
          onSignOut={onSignOut}
          onProfileUpdate={onProfileUpdate}
          onAvatarUpload={onAvatarUpload}
          onResendConfirmation={onResendConfirmation}
          onPasswordReset={onPasswordReset}
          onUpdatePassword={onUpdatePassword}
        />
      ) : null}
      <div className="comment-form">
        <div className="comment-avatar">{avatarContent(currentUser?.avatarUrl, currentUser?.username || "你")}</div>
        <div className="comment-author-lock">
          <span>{currentUser ? "当前账号" : "未登录"}</span>
          <strong>{currentUser?.username || "登录后留言"}</strong>
        </div>
        <input
          value={commentBody}
          onChange={(event) => setCommentBody(event.target.value)}
          disabled={!currentUser || loadState === "loading"}
          placeholder="分享你的想法或反馈..."
        />
        <label className="human-gate">
          <ShieldCheck size={16} />
          <span>{gate.left} + {gate.right} =</span>
          <input
            value={gate.answer}
            onChange={(event) => setGate((current) => ({ ...current, answer: event.target.value }))}
            inputMode="numeric"
            placeholder="答案"
          />
          <input
            className="human-gate-trap"
            value={gate.honeypot}
            onChange={(event) => setGate((current) => ({ ...current, honeypot: event.target.value }))}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
        </label>
        <button className="cyan-button" disabled={!currentUser || loadState === "loading"} onClick={publishComment} type="button">
          <Send size={17} />
          发表评论
        </button>
      </div>
      {statusMessage ? <p className="backend-status">{statusMessage}</p> : null}
      {siteBackend.mode === "supabase" ? null : <GitHubIssueComments />}
      <div className="comment-list">
        {visibleComments.length > 0 ? (
          visibleComments.map((comment) => (
            <article className="comment-row" key={comment.id}>
              <div className="comment-avatar">{avatarContent(comment.avatar, comment.author)}</div>
              <div className="comment-body">
                <div className="comment-meta">
                  <strong>{comment.author}</strong>
                  <span>{comment.time}</span>
                </div>
                <p>{comment.body}</p>
                <div className="comment-actions">
                  <button onClick={() => replyTo(comment.author)} type="button">
                    <MessageCircle size={15} />
                    回复
                  </button>
                  <button onClick={() => likeComment(comment.id)} type="button">
                    <Heart size={15} fill="currentColor" />
                    {comment.likes}
                  </button>
                  {isOwner ? (
                    <button
                      className="danger"
                      disabled={deletingCommentId === comment.id}
                      onClick={() => void deleteComment(comment)}
                      type="button"
                    >
                      <Trash2 size={15} />
                      {deletingCommentId === comment.id ? "删除中" : "删除"}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="archive-empty-state comment-empty-state">
            <div className="archive-empty-icon">
              <MessageCircle size={26} />
            </div>
            <span>{currentUser ? "Comment Channel Ready" : "Login Required"}</span>
            <strong>第一条留言等待中</strong>
            <p>{currentUser ? "写下第一条反馈、建议或想法，这里会成为公开留言记录。" : "注册或登录后就可以留言；为了防刷，提交前需要完成一道简单算术题。"}</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="screen-section contact-section" id="contact">
      <ScreenIntro
        title="合作与联系"
        description="这里会保留我的作品、Demo、音乐、图片、书摘、更新记录和留言入口；站主账号负责维护，访客账号负责互动。"
      />
      <div className="roadmap-list">
        {contactHighlights.map((item) => (
          <div className="roadmap-item" key={item}>
            <Sparkles size={16} />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <footer className="site-footer">
        Personal Archive · 作品集 · Demo · 音乐 · 图片 · 站主动态 · 留言
      </footer>
    </section>
  );
}

export function App() {
  const [activeSection, setActiveSection] = useState<SectionId>(() => getSectionFromLocation());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [editMode, setEditMode] = useState(false);
  const [darkMode, setDarkMode] = useLocalStorage("linx_dark_mode", false);
  const auth = useAuthSession();
  const currentUser = auth.user;

  useEffect(() => {
    let active = true;

    async function loadSiteSettings() {
      try {
        const settings = await siteBackend.getSiteSettings();
        if (active) {
          setSiteSettings(settings);
        }
      } catch {
        if (active) {
          setSiteSettings(defaultSiteSettings);
        }
      }
    }

    void loadSiteSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (currentUser?.role !== "owner") {
      setEditMode(false);
    }
  }, [currentUser?.role]);

  useEffect(() => {
    const handleRouteChange = () => {
      setActiveSection(getSectionFromLocation());
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    handleRouteChange();
    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  useLayoutEffect(() => {
    const resetActiveScroll = () => {
      document.querySelector(".workspace")?.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.getElementById(activeSection)?.scrollTo({ top: 0, left: 0, behavior: "auto" });
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    resetActiveScroll();
    window.requestAnimationFrame(resetActiveScroll);
  }, [activeSection]);

  const activeScreen = {
    home: (
      <HeroSection
        settings={siteSettings}
        currentUser={currentUser}
        editMode={editMode}
        onEditModeChange={setEditMode}
        onSettingsChange={setSiteSettings}
      />
    ),
    docs: <DocsSection currentUser={currentUser} />,
    demos: <DemosSection />,
    music: <MusicSection settings={siteSettings} onSettingsChange={setSiteSettings} currentUser={currentUser} />,
    gallery: <GallerySection settings={siteSettings} onSettingsChange={setSiteSettings} currentUser={currentUser} />,
    notes: <NotesSection currentUser={currentUser} />,
    private: <PrivateSection currentUser={currentUser} />,
    comments: (
      <CommentsSection
        currentUser={currentUser}
        authState={auth.authState}
        authMessage={auth.authMessage}
        passwordRecoveryReady={auth.passwordRecoveryReady}
        onAuthSubmit={auth.signIn}
        onSignOut={auth.signOut}
        onProfileUpdate={auth.updateUserProfile}
        onAvatarUpload={auth.uploadProfileAvatar}
        onResendConfirmation={auth.resendConfirmation}
        onPasswordReset={auth.sendPasswordReset}
        onUpdatePassword={auth.updatePassword}
      />
    ),
    contact: <ContactSection />,
  }[activeSection];

  return (
    <div className={clsx("app-shell", darkMode && "dark-mode")}>
      <Sidebar activeSection={activeSection} settings={siteSettings} onToggleTheme={() => setDarkMode((current) => !current)} />
      <main className={clsx("workspace", `workspace-${activeSection}`)}>
        <MobileNav activeSection={activeSection} settings={siteSettings} />
        <div className="global-account-bar">
          <AccountPanel
            user={currentUser}
            authState={auth.authState}
            authMessage={auth.authMessage}
            passwordRecoveryReady={auth.passwordRecoveryReady}
            onSubmit={auth.signIn}
            onSignOut={auth.signOut}
            onProfileUpdate={auth.updateUserProfile}
            onAvatarUpload={auth.uploadProfileAvatar}
            onResendConfirmation={auth.resendConfirmation}
            onPasswordReset={auth.sendPasswordReset}
            onUpdatePassword={auth.updatePassword}
          />
          {currentUser?.role === "owner" ? (
            <button className={clsx("ghost-button", editMode && "active")} onClick={() => setEditMode((enabled) => !enabled)} type="button">
              <Edit3 size={16} />
              {editMode ? "退出编辑" : "编辑模式"}
            </button>
          ) : null}
        </div>
        {activeScreen}
      </main>
      <BackgroundMusicDock settings={siteSettings} />
    </div>
  );
}
