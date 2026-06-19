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
  ShieldCheck,
  Shuffle,
  SkipBack,
  SkipForward,
  Upload,
  Volume2,
} from "lucide-react";
import {
  backendRoadmap,
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

  return (
    <div className="portfolio-preview-empty">
      <PortfolioIcon item={item} />
      <strong>{item.kindLabel} 暂不做站内预览</strong>
      <span>当前先提供公开下载入口；后续可以继续补独立预览。</span>
    </div>
  );
}

function HeroSection({ settings }: { settings: SiteSettings }) {
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
        <MediaTile tile={0} imageUrl={settings.heroCoverUrl} className="hero-media">
          <div className="hero-media-caption">
            <span>Archive OS</span>
            <strong>策划文档 · 原型记录 · 灵感索引</strong>
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
            <span>{isSupabase ? "Supabase 权限" : localPreviewLabel}</span>
            <strong>{isOwner ? "站主编辑入口已开启" : "公开浏览模式"}</strong>
          </div>
          <BackendModeNotice isSupabase={isSupabase} />
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

function MusicSection({
  settings,
  onSettingsChange,
}: {
  settings: SiteSettings;
  onSettingsChange: (settings: SiteSettings) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorite, setFavorite] = useLocalStorage("linx_music_favorite", true);
  const [tracks, setTracks] = useState<MusicTrack[]>(musicTracks);
  const [activeTrackId, setActiveTrackId] = useState(musicTracks[0].id);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [draft, setDraft] = useState<MusicTrackInput>(defaultMusicDraft);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isOwner = user?.role === "owner";
  const isSupabase = siteBackend.mode === "supabase";
  const activeTrack = tracks.find((track) => track.id === activeTrackId) ?? tracks[0];

  useEffect(() => {
    let active = true;

    async function loadMusicWorkbench() {
      setLoadState("loading");
      setStatusMessage("");

      try {
        const [currentUser, remoteTracks, remoteSettings] = await Promise.all([
          siteBackend.getCurrentUser(),
          siteBackend.listMusicTracks(),
          siteBackend.getSiteSettings(),
        ]);

        if (!active) {
          return;
        }

        setUser(currentUser);
        if (remoteTracks.length > 0) {
          setTracks(remoteTracks);
          setActiveTrackId(remoteTracks[0].id);
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
  }, [onSettingsChange]);

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

  async function createTrack() {
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
      const nextTrack = await siteBackend.createMusicTrack({
        ...draft,
        title,
        artist,
        mood,
        audioUrl,
        coverUrl: draft.coverUrl?.trim() || undefined,
        duration: draft.duration?.trim() || undefined,
      });
      setTracks((current) => [nextTrack, ...current]);
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

      setDraft(defaultMusicDraft);
      setStatusMessage(
        draft.isBackground
          ? "音乐已保存，并更新为全站背景音乐。"
          : isSupabase
            ? "音乐已写入 Supabase。"
            : "本地预览已新增音乐。",
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "新增音乐失败。");
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
          <button type="button" aria-label="随机播放">
            <Shuffle size={18} />
          </button>
          <button type="button" aria-label="上一首">
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
          <button type="button" aria-label="下一首">
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
          <strong>{isOwner ? "站主音乐上传入口" : "访客只能试听公开歌单"}</strong>
        </div>
        <BackendModeNotice isSupabase={isSupabase} />
        {isOwner ? (
          <>
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
              <button className="cyan-button" onClick={createTrack} type="button">
                保存音乐
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
}: {
  settings: SiteSettings;
  onSettingsChange: (settings: SiteSettings) => void;
}) {
  const [filter, setFilter] = useState("全部");
  const [items, setItems] = useState<GalleryItem[]>(galleryItems);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [draft, setDraft] = useState<GalleryItemInput>(defaultGalleryDraft);
  const [statusMessage, setStatusMessage] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");

  const isOwner = user?.role === "owner";
  const isSupabase = siteBackend.mode === "supabase";

  const filteredItems = useMemo(() => {
    if (filter === "全部") {
      return items;
    }

    return items.filter((item) => item.category === filter);
  }, [filter, items]);

  useEffect(() => {
    let active = true;

    async function loadGalleryWorkbench() {
      setLoadState("loading");
      setStatusMessage("");

      try {
        const [currentUser, remoteItems, remoteSettings] = await Promise.all([
          siteBackend.getCurrentUser(),
          siteBackend.listGalleryItems(),
          siteBackend.getSiteSettings(),
        ]);

        if (!active) {
          return;
        }

        setUser(currentUser);
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

  async function createGalleryEntry() {
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
      const nextItem = await siteBackend.createGalleryItem({
        title,
        category: draft.category.trim() || "概念",
        description: draft.description?.trim() || undefined,
        imageUrl,
        isCover: draft.isCover,
      });
      setItems((current) => [nextItem, ...current]);
      setDraft(defaultGalleryDraft);

      if (nextItem.isCover && nextItem.imageUrl) {
        const nextSettings = await siteBackend.updateSiteSettings({
          ...settings,
          heroCoverUrl: nextItem.imageUrl,
        });
        onSettingsChange(nextSettings);
      }

      setStatusMessage(nextItem.isCover ? "图片已保存，并更新为首页封面。" : "图片已加入图库。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "新增图片失败。");
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
          <article key={item.id} className={clsx("gallery-card", item.isCover && "cover-selected")}>
            <MediaTile tile={item.tile ?? 4} imageUrl={item.imageUrl} />
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
          <strong>{isOwner ? "站主图片上传入口" : "访客只能浏览公开图库"}</strong>
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
              <button className="cyan-button" onClick={createGalleryEntry} type="button">
                保存图片
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

function NotesSection() {
  const [notes, setNotes] = useState<ReadingNote[]>(readingNotes);
  const [activeKind, setActiveKind] = useState<"all" | ReadingNote["kind"]>("all");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [draft, setDraft] = useState<ReadingNoteInput>(defaultReadingDraft);
  const [tagInput, setTagInput] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loadState, setLoadState] = useState<LoadState>("idle");

  const isOwner = user?.role === "owner";
  const isSupabase = siteBackend.mode === "supabase";
  const filteredNotes = useMemo(() => {
    if (activeKind === "all") {
      return notes;
    }

    return notes.filter((note) => note.kind === activeKind);
  }, [activeKind, notes]);

  useEffect(() => {
    let active = true;

    async function loadNotesWorkbench() {
      setLoadState("loading");
      setStatusMessage("");

      try {
        const [currentUser, remoteNotes] = await Promise.all([
          siteBackend.getCurrentUser(),
          siteBackend.listReadingNotes(),
        ]);

        if (!active) {
          return;
        }

        setUser(currentUser);
        if (remoteNotes.length > 0) {
          setNotes(remoteNotes);
        }
        setLoadState("ready");
      } catch (error) {
        if (!active) {
          return;
        }

        setLoadState("error");
        setStatusMessage(error instanceof Error ? error.message : "书摘心得加载失败，已使用本地数据。");
      }
    }

    void loadNotesWorkbench();
    return () => {
      active = false;
    };
  }, []);

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

  async function createReadingNote() {
    if (!isOwner) {
      setStatusMessage("只有站主账号可以发布书摘心得。");
      return;
    }

    const title = draft.title.trim();
    const creator = draft.creator.trim();
    const quote = draft.quote.trim();
    const reflection = draft.reflection.trim();

    if (!title || !creator || !quote || !reflection) {
      setStatusMessage("标题、作者/来源、摘录和心得都需要填写。");
      return;
    }

    try {
      const nextNote = await siteBackend.createReadingNote({
        ...draft,
        title,
        creator,
        quote,
        reflection,
        sourceUrl: draft.sourceUrl?.trim() || undefined,
        coverUrl: draft.coverUrl?.trim() || undefined,
        tags: parseTags(tagInput),
      });
      setNotes((current) => [nextNote, ...current]);
      setDraft(defaultReadingDraft);
      setTagInput("");
      setStatusMessage(isSupabase ? "书摘心得已写入 Supabase。" : "本地预览已新增书摘心得。");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "新增书摘心得失败。");
    }
  }

  return (
    <section className="screen-section notes-section" id="notes">
      <ScreenIntro
        title="书摘心得"
        description="这里放策划书籍、设计文章和视频课程的摘录与复盘，方便 HR 看到你的学习路径和方法论。"
      />
      <div className="notes-workbench">
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
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <article className="note-card" key={note.id}>
              {note.coverUrl ? <img src={note.coverUrl} alt={note.title} /> : <MediaTile tile={note.kind === "book" ? 1 : 2} />}
              <div>
                <span>{note.kind === "book" ? "策划书籍" : "视频心得"}</span>
                <h3>{note.title}</h3>
                <p>{note.creator}</p>
              </div>
              <blockquote>{note.quote}</blockquote>
              <p>{note.reflection}</p>
              <div className="tag-row">
                {note.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              {note.sourceUrl ? (
                <a href={note.sourceUrl} target="_blank" rel="noreferrer">
                  <ExternalLink size={15} />
                  打开来源
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <div className="owner-upload-panel notes-upload-panel">
        <div className="portfolio-admin-head">
          <span>{isSupabase ? "Supabase RLS" : localPreviewLabel}</span>
          <strong>{isOwner ? "站主书摘发布入口" : "访客只能阅读公开心得"}</strong>
        </div>
        <BackendModeNotice isSupabase={isSupabase} />
        {isOwner ? (
          <>
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
                <span>标题</span>
                <input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  placeholder="书名或视频标题"
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
            <label>
              <span>摘录</span>
              <textarea
                value={draft.quote}
                onChange={(event) => setDraft((current) => ({ ...current, quote: event.target.value }))}
                placeholder="摘一句最值得记住的话"
              />
            </label>
            <label>
              <span>心得</span>
              <textarea
                value={draft.reflection}
                onChange={(event) => setDraft((current) => ({ ...current, reflection: event.target.value }))}
                placeholder="这段内容如何影响你的策划方法"
              />
            </label>
            <label>
              <span>标签</span>
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                placeholder="体验设计, 关卡, 系统"
              />
            </label>
            <div className="portfolio-upload-row">
              <label className="portfolio-file-picker">
                <ImageIcon size={16} />
                <span>上传封面</span>
                <input accept="image/*" onChange={(event) => void handleReadingCover(event.target.files?.[0] ?? null)} type="file" />
              </label>
              <button className="cyan-button" onClick={createReadingNote} type="button">
                发布心得
              </button>
            </div>
          </>
        ) : null}
        {loadState === "loading" ? <p className="backend-status">正在同步书摘...</p> : null}
        {statusMessage ? <p className="backend-status">{statusMessage}</p> : null}
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
            <span>{localPreviewLabel}</span>
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
        <span>公网评论桥</span>
        <strong>GitHub Issues 持久留言</strong>
      </div>
      <p>
        当前 GitHub Pages 版本还没接 Supabase，下面的评论面板会把公开留言保存到仓库 Issues；安装 Utterances App 后访客即可用 GitHub 账号评论。
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

function CommentsSection() {
  const [comments, setComments] = useLocalStorage<Comment[]>("linx_comments", seedComments);
  const [commentBody, setCommentBody] = useState("");
  const [author, setAuthor] = useLocalStorage("linx_comment_author", "访客");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [gate, setGate] = useState<HumanGateState>(() => createHumanGate());

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

    if (!checkHumanGate(gate)) {
      setStatusMessage("验证没有通过：请完成算术题，停留两秒后再提交。");
      return;
    }

    try {
      const nextComment = await siteBackend.createComment({
        author: authorName,
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

  return (
    <section className="screen-section comments-section" id="comments">
      <ScreenIntro
        title="留言墙"
        description="访客评论也独占一屏，提交前会经过轻量验证，降低刷屏和脚本灌水风险。"
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
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);

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
    home: <HeroSection settings={siteSettings} />,
    docs: <DocsSection />,
    demos: <DemosSection />,
    music: <MusicSection settings={siteSettings} onSettingsChange={setSiteSettings} />,
    gallery: <GallerySection settings={siteSettings} onSettingsChange={setSiteSettings} />,
    notes: <NotesSection />,
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
      <BackgroundMusicDock settings={siteSettings} />
    </div>
  );
}
