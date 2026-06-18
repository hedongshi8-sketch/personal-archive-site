import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";
import {
  ArrowRight,
  Bell,
  Code2,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Heart,
  ImageIcon,
  LockKeyhole,
  Mail,
  Menu,
  MessageCircle,
  Moon,
  Pause,
  Play,
  Search,
  Send,
  Shuffle,
  SkipBack,
  SkipForward,
  Upload,
} from "lucide-react";
import {
  backendRoadmap,
  galleryItems,
  gameDemos,
  navItems,
  ownerActions,
  playlists,
  seedComments,
  seedOwnerPosts,
  type Comment,
  type OwnerPost,
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
import { siteBackend, type AuthUser, type PortfolioItemInput } from "./lib/backendContract";
import { useLocalStorage } from "./hooks/useLocalStorage";
import mediaSheet from "./assets/media-sheet.png";

const galleryFilters = ["全部", "角色", "场景", "物件", "UI/界面", "概念"];
const githubCommentsRepo = import.meta.env.VITE_GITHUB_COMMENTS_REPO || "hedongshi8-sketch/personal-archive-site";

function MediaTile({
  tile,
  className,
  children,
}: {
  tile: number;
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
          "--media-image": `url(${mediaSheet})`,
          "--media-x": `${x * 50}%`,
          "--media-y": `${y * 50}%`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

const sectionIds = ["home", "docs", "demos", "music", "gallery", "private", "comments", "contact"] as const;
type SectionId = (typeof sectionIds)[number];
type LoadState = "idle" | "loading" | "ready" | "error";

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

function getSectionFromLocation(): SectionId {
  if (typeof window === "undefined") {
    return "home";
  }

  const params = new URLSearchParams(window.location.search);
  const requested = window.location.hash.slice(1) || params.get("start");
  return sectionIds.includes(requested as SectionId) ? (requested as SectionId) : "home";
}

function Sidebar({ activeSection }: { activeSection: SectionId }) {
  return (
    <aside className="sidebar" aria-label="主导航">
      <a className="brand" href="#home">
        <div className="brand-mark" aria-hidden="true">
          <span />
        </div>
        <div>
          <strong>LinX</strong>
          <small>游戏策划 / 关卡设计</small>
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
          <button type="button" aria-label="切换夜间模式">
            <Moon size={18} />
          </button>
          <button type="button" aria-label="打开命令面板">
            <Code2 size={18} />
          </button>
          <button type="button" aria-label="上传内容">
            <Upload size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function MobileNav({ activeSection }: { activeSection: SectionId }) {
  return (
    <div className="mobile-nav-strip" aria-label="移动端导航">
      <a className="mobile-brand" href="#home">
        <Menu size={18} />
        <span>LinX</span>
      </a>
      <nav>
        {navItems.slice(1, 7).map((item) => (
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
}: {
  title: string;
  description: string;
  action?: string;
}) {
  return (
    <div className="screen-intro">
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? (
        <button className="text-action" type="button">
          {action}
          <ArrowRight size={17} />
        </button>
      ) : null}
    </div>
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

function PortfolioPreview({ item }: { item: PortfolioItem }) {
  if (item.previewUrl && item.kind === "image") {
    return <img src={item.previewUrl} alt={item.title} />;
  }

  if (item.previewUrl && (item.kind === "pdf" || item.kind === "html-prototype")) {
    return <iframe title={item.title} src={item.previewUrl} loading="lazy" />;
  }

  return (
    <div className="portfolio-preview-empty">
      <PortfolioIcon item={item} />
      <strong>{item.kindLabel} 暂不做站内预览</strong>
      <span>当前先提供公开下载入口；后续可接 Excel 只读表格预览。</span>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="screen-section hero-section" id="home">
      <div className="hero-copy">
        <h1>夜深了，继续打磨好玩的世界。</h1>
        <p>这里是我的策划档案馆：每一屏只展开一个主题，文档、Demo、音乐、图片、私密记录和留言都各自拥有完整空间。</p>
        <div className="hero-actions">
          <a className="cyan-button" href="#docs">
            进入档案
          </a>
          <a className="ghost-button" href="#comments">
            去留言墙
          </a>
        </div>
      </div>

      <div className="hero-console">
        <label className="search-box">
          <Search size={17} aria-hidden="true" />
          <input placeholder="搜索档案 / Demo / 音乐 / 灵感..." />
          <kbd>⌘K</kbd>
        </label>
        <div className="hero-toolbar">
          <button type="button" aria-label="通知">
            <Bell size={21} />
          </button>
          <button type="button" aria-label="邮件">
            <Mail size={21} />
          </button>
          <div className="avatar" aria-label="站主头像">
            L
          </div>
        </div>
        <MediaTile tile={0} className="hero-media">
          <div className="hero-media-caption">
            <span>Archive OS</span>
            <strong>策划文档 · 原型记录 · 灵感索引</strong>
          </div>
        </MediaTile>
      </div>
    </section>
  );
}

function DocsSection() {
  const [activeFilter, setActiveFilter] = useState<(typeof portfolioFilters)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PortfolioItem[]>(portfolioItems);
  const [activeId, setActiveId] = useState(portfolioItems.find((item) => item.featured)?.id ?? portfolioItems[0].id);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [draft, setDraft] = useState<PortfolioItemInput>(defaultPortfolioDraft);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [docsState, setDocsState] = useState<LoadState>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const isOwner = user?.role === "owner";
  const isSupabase = siteBackend.mode === "supabase";

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
        const [currentUser, remoteItems] = await Promise.all([
          siteBackend.getCurrentUser(),
          siteBackend.listPortfolioItems(),
        ]);

        if (!active) {
          return;
        }

        setUser(currentUser);
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

  async function requestPortfolioLogin() {
    const email = ownerEmail.trim();
    if (!email) {
      setStatusMessage("先填写站主邮箱。");
      return;
    }

    try {
      await siteBackend.signInOwner(email);
      setStatusMessage("登录链接已发送，请在邮箱里完成验证。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "登录链接发送失败。");
    }
  }

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

  async function createPortfolioEntry() {
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
      const nextItem = await siteBackend.createPortfolioItem({
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
      });
      setItems((current) => [nextItem, ...current]);
      setActiveId(nextItem.id);
      setDraft(defaultPortfolioDraft);
      setTagInput("");
      setStatusMessage(isSupabase ? "作品集条目已写入 Supabase。" : "本地预览已新增作品条目。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "新增作品失败。");
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
            <span>{isSupabase ? "Supabase 权限" : "Local Preview"}</span>
            <strong>{isOwner ? "站主编辑入口已开启" : "公开浏览模式"}</strong>
          </div>
          {isSupabase && !isOwner ? (
            <div className="portfolio-login-row">
              <input
                value={ownerEmail}
                onChange={(event) => setOwnerEmail(event.target.value)}
                placeholder="站主邮箱"
                type="email"
              />
              <button className="ghost-button" onClick={requestPortfolioLogin} type="button">
                发送登录链接
              </button>
            </div>
          ) : null}
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
                <button className="cyan-button" disabled={uploading} onClick={createPortfolioEntry} type="button">
                  登记作品
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
            </div>
            <div className="portfolio-preview">
              <PortfolioPreview item={activeItem} />
            </div>
            <div className="portfolio-detail-actions">
              {activeItem.previewUrl ? (
                <a className="ghost-button" href={activeItem.previewUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} />
                  打开预览
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
  const activeDemo = gameDemos.find((demo) => demo.title === activeTitle) ?? gameDemos[0];

  return (
    <section className="screen-section demos-section" id="demos">
      <ScreenIntro
        title="游戏 Demo"
        description="Demo 区独占一屏，主舞台放当前选中的原型，其它 Demo 作为可切换的播放队列。"
        action="打开 Demo 库"
      />
      <div className="demo-stage">
        <MediaTile tile={activeDemo.tile} className="demo-feature">
          <button className="play-orb" type="button" aria-label={`播放 ${activeDemo.title}`}>
            <Play size={34} fill="currentColor" />
          </button>
        </MediaTile>
        <div className="demo-feature-copy">
          <h3>{activeDemo.title}</h3>
          <p>{activeDemo.description}</p>
          <div className="meta-row">
            <span>{activeDemo.platform}</span>
            <time>{activeDemo.duration}</time>
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

function MusicSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorite, setFavorite] = useLocalStorage("linx_music_favorite", true);

  return (
    <section className="screen-section music-section" id="music">
      <ScreenIntro
        title="音乐雷达"
        description="这一屏只负责音乐：当前播放、波形、收藏和歌单队列都围绕听感展开。"
        action="查看歌单"
      />
      <div className="player-surface">
        <MediaTile tile={3} className="album-art" />
        <div className="track-copy">
          <span>Now Playing</span>
          <h3>Sable Drift</h3>
          <p>Floating Points</p>
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
          <span>02:31</span>
          <div className="progress-track">
            <span />
          </div>
          <span>06:41</span>
        </div>
        <div className="player-controls">
          <button type="button" aria-label="随机播放">
            <Shuffle size={18} />
          </button>
          <button type="button" aria-label="上一首">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            className="primary-play"
            onClick={() => setIsPlaying((current) => !current)}
            type="button"
            aria-label={isPlaying ? "暂停" : "播放"}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <button type="button" aria-label="下一首">
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>
      </div>
      <div className="playlist-panel">
        {playlists.map((playlist) => (
          <button className="playlist-row" type="button" key={playlist.title}>
            <MediaTile tile={playlist.tile} />
            <span>
              <strong>{playlist.title}</strong>
              <small>{playlist.count} 首</small>
            </span>
            <Play size={16} fill="currentColor" />
          </button>
        ))}
      </div>
    </section>
  );
}

function GallerySection() {
  const [filter, setFilter] = useState("全部");
  const filteredItems = useMemo(() => {
    if (filter === "全部") {
      return galleryItems;
    }

    return galleryItems.filter((item) => item.category === filter);
  }, [filter]);

  return (
    <section className="screen-section gallery-section" id="gallery">
      <ScreenIntro
        title="灵感图库"
        description="图片收藏拥有完整画廊空间，按角色、场景、物件、UI 和概念快速筛选。"
        action="查看全部图片"
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
          <article key={item.title} className="gallery-card">
            <MediaTile tile={item.tile} />
            <span>{item.title}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function PrivateSection() {
  const [posts, setPosts] = useLocalStorage<OwnerPost[]>("linx_owner_posts", seedOwnerPosts);
  const [draft, setDraft] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const isOwner = user?.role === "owner";
  const isSupabase = siteBackend.mode === "supabase";

  useEffect(() => {
    let active = true;

    async function loadPrivateState() {
      setLoadState("loading");
      setStatusMessage("");

      try {
        const currentUser = await siteBackend.getCurrentUser();
        const remotePosts = currentUser?.role === "owner" ? await siteBackend.listOwnerPosts() : [];

        if (!active) {
          return;
        }

        setUser(currentUser);
        if (remotePosts.length > 0 || siteBackend.mode === "supabase") {
          setPosts(remotePosts);
        }
        setLoadState("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadState("error");
        setStatusMessage(error instanceof Error ? error.message : "私密区加载失败。");
      }
    }

    void loadPrivateState();
    return () => {
      active = false;
    };
  }, [setPosts]);

  async function requestOwnerLogin() {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setStatusMessage("先填写站主邮箱。");
      return;
    }

    try {
      await siteBackend.signInOwner(targetEmail);
      setStatusMessage("登录链接已发送，请在邮箱里完成验证。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "登录链接发送失败。");
    }
  }

  async function publishPost() {
    const body = draft.trim();
    if (!body) {
      return;
    }

    if (!isOwner) {
      setStatusMessage("只有站主账号可以发布私密内容。");
      return;
    }

    try {
      const nextPost = await siteBackend.createOwnerPost({
        title: "临时灵感",
        body,
        visibility: "private",
      });
      setPosts((current) => [nextPost, ...current]);
      setDraft("");
      setStatusMessage(isSupabase ? "已写入 Supabase 私密表。" : "本地预览已保存。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "发布失败。");
    }
  }

  return (
    <section className="screen-section private-section" id="private">
      <ScreenIntro
        title="私密发帖"
        description="这块只给站主使用；接入 Supabase 后由 Auth 和 RLS 判断 owner 权限，访客不会拿到发布入口。"
      />
      {isSupabase ? (
        <div className="owner-login">
          <div>
            <span>{user ? user.email : "Supabase Auth"}</span>
            <strong>{isOwner ? "站主权限已验证" : "等待站主邮箱登录"}</strong>
          </div>
          {!isOwner ? (
            <>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="站主邮箱"
                type="email"
              />
              <button className="ghost-button" onClick={requestOwnerLogin} type="button">
                发送登录链接
              </button>
            </>
          ) : null}
        </div>
      ) : (
        <div className="owner-login">
          <div>
            <span>Local Preview</span>
            <strong>本地预览模式，部署后填 Supabase 环境变量启用真实权限。</strong>
          </div>
        </div>
      )}
      <div className="private-composer">
        <div className="composer-lock">
          <LockKeyhole size={18} />
          <span>{isOwner ? "仅自己可见" : "需要站主权限"}</span>
        </div>
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
                <button type="button" key={action.label} aria-label={action.label}>
                  <Icon size={18} />
                </button>
              );
            })}
          </div>
          <span>{draft.length} / 2000</span>
          <button className="cyan-button" disabled={!isOwner || loadState === "loading"} onClick={publishPost} type="button">
            发布到私密区
          </button>
        </div>
      </div>
      {statusMessage ? <p className="backend-status">{statusMessage}</p> : null}
      <div className="post-stack">
        {(isOwner ? posts : []).slice(0, 3).map((post) => (
          <article key={post.id} className="mini-post">
            <div>
              <strong>{post.title}</strong>
              <time>{post.createdAt}</time>
            </div>
            <p>{post.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function GitHubIssueComments() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) {
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

    containerRef.current.append(script);

    return () => {
      script.remove();
    };
  }, []);

  return (
    <div className="github-comments-panel" aria-label="GitHub Issues 评论">
      <div>
        <span>公网评论桥</span>
        <strong>GitHub Issues 持久留言</strong>
      </div>
      <p>
        当前 GitHub Pages 版本还没接 Supabase，下面的评论面板会把公开留言保存到仓库 Issues；安装 Utterances App 后访客即可用 GitHub 账号评论。
      </p>
      {loadError ? <p className="backend-status">GitHub 评论面板加载失败，可以刷新页面后重试。</p> : null}
      <div ref={containerRef} className="github-comments-frame" />
    </div>
  );
}

function CommentsSection() {
  const [comments, setComments] = useLocalStorage<Comment[]>("linx_comments", seedComments);
  const [commentBody, setCommentBody] = useState("");
  const [author, setAuthor] = useLocalStorage("linx_comment_author", "访客");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [statusMessage, setStatusMessage] = useState("");

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
    const authorName = author.trim() || "访客";
    if (!body) {
      return;
    }

    try {
      const nextComment = await siteBackend.createComment({
        author: authorName,
        body,
      });
      setComments((current) => [nextComment, ...current]);
      setCommentBody("");
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

  return (
    <section className="screen-section comments-section" id="comments">
      <ScreenIntro
        title="留言墙"
        description="访客评论也独占一屏，输入、历史评论、点赞和回复入口都留在同一个交流场里。"
        action="查看全部留言"
      />
      <div className="comment-form">
        <div className="comment-avatar">你</div>
        <input
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          maxLength={80}
          placeholder="你的昵称"
        />
        <input
          value={commentBody}
          onChange={(event) => setCommentBody(event.target.value)}
          disabled={loadState === "loading"}
          placeholder="分享你的想法或反馈..."
        />
        <button className="cyan-button" disabled={loadState === "loading"} onClick={publishComment} type="button">
          <Send size={17} />
          发表评论
        </button>
      </div>
      {statusMessage ? <p className="backend-status">{statusMessage}</p> : null}
      {siteBackend.mode === "supabase" ? null : <GitHubIssueComments />}
      <div className="comment-list">
        {comments.map((comment) => (
          <article className="comment-row" key={comment.id}>
            <div className="comment-avatar">{comment.avatar}</div>
            <div className="comment-body">
              <div className="comment-meta">
                <strong>{comment.author}</strong>
                <span>{comment.time}</span>
              </div>
              <p>{comment.body}</p>
              <div className="comment-actions">
                <button type="button">
                  <MessageCircle size={15} />
                  回复
                </button>
                <button onClick={() => likeComment(comment.id)} type="button">
                  <Heart size={15} fill="currentColor" />
                  {comment.likes}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="screen-section contact-section" id="contact">
      <ScreenIntro
        title="合作与联系"
        description="后端、登录、存储、评论审核和自动发布都已经预留接入位，下一步可以直接接真实服务。"
      />
      <div className="roadmap-list">
        {backendRoadmap.map((item) => (
          <div className="roadmap-item" key={item}>
            <LockKeyhole size={16} />
            <span>{item}</span>
          </div>
        ))}
      </div>
      <footer className="site-footer">
        LinX Archive OS · 策划文档 · Demo · 音乐 · 灵感 · 留言
      </footer>
    </section>
  );
}

export function App() {
  const [activeSection, setActiveSection] = useState<SectionId>(() => getSectionFromLocation());

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

  const activeScreen = {
    home: <HeroSection />,
    docs: <DocsSection />,
    demos: <DemosSection />,
    music: <MusicSection />,
    gallery: <GallerySection />,
    private: <PrivateSection />,
    comments: <CommentsSection />,
    contact: <ContactSection />,
  }[activeSection];

  return (
    <div className="app-shell">
      <Sidebar activeSection={activeSection} />
      <main className="workspace">
        <MobileNav activeSection={activeSection} />
        {activeScreen}
      </main>
    </div>
  );
}
