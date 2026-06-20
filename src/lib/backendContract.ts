import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  isPublicPortfolioItem,
  portfolioItems,
  portfolioKindLabels,
  portfolioProjectLabels,
  type PortfolioItem,
  type PortfolioKind,
  type PortfolioProject,
} from "../data/portfolioItems";
import {
  defaultSiteSettings,
  galleryItems,
  musicTracks,
  readingNotes,
  seedComments,
  seedOwnerPosts,
  type Comment,
  type GalleryItem,
  type MusicTrack,
  type OwnerPost,
  type ReadingNote,
  type SiteSettings,
} from "../data/siteData";
import { getReadableNow } from "./format";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  avatarUrl?: string;
  role: "owner" | "visitor";
};

export type AuthCredentials = {
  email: string;
  password: string;
  username?: string;
};

export type AuthResult = {
  user: AuthUser | null;
  needsEmailConfirmation?: boolean;
};

export type AssetRecord = {
  id: string;
  kind:
    | "design-doc"
    | "game-demo"
    | "music-cover"
    | "gallery-image"
    | "music-audio"
    | "site-logo"
    | "site-cover"
    | "site-avatar"
    | "reading-cover";
  title: string;
  url: string;
  storagePath: string;
  createdAt: string;
};

export type PortfolioItemInput = {
  project: Exclude<PortfolioProject, "all">;
  kind: PortfolioKind;
  title: string;
  summary: string;
  tags: string[];
  publicUrl: string;
  previewUrl?: string;
  thumbnailUrl?: string;
  sourcePath?: string;
  featured?: boolean;
};

export type MusicTrackInput = {
  title: string;
  artist: string;
  mood: string;
  duration?: string;
  audioUrl: string;
  coverUrl?: string;
  isBackground?: boolean;
};

export type GalleryItemInput = {
  title: string;
  category: string;
  description?: string;
  imageUrl: string;
  isCover?: boolean;
};

export type ReadingNoteInput = {
  kind: ReadingNote["kind"];
  title: string;
  creator: string;
  sourceUrl?: string;
  coverUrl?: string;
  quote: string;
  reflection: string;
  tags: string[];
};

export type CommentInput = Pick<Comment, "author" | "body"> & {
  verificationElapsedMs?: number;
  honeypot?: string;
};

export type SiteBackend = {
  readonly mode: "local" | "supabase";
  getCurrentUser(): Promise<AuthUser | null>;
  onAuthStateChange?(callback: (user: AuthUser | null, event: string) => void): () => void;
  signInWithPassword(input: AuthCredentials): Promise<AuthUser | null>;
  signUpWithPassword(input: AuthCredentials): Promise<AuthResult>;
  resendConfirmationEmail(email: string): Promise<void>;
  sendPasswordResetEmail(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  signOut(): Promise<void>;
  updateProfile(input: { username: string; avatarUrl?: string }): Promise<AuthUser>;
  uploadProfileAvatar(file: File): Promise<{ publicUrl: string; storagePath: string }>;
  listOwnerPosts(): Promise<OwnerPost[]>;
  createOwnerPost(input: Pick<OwnerPost, "title" | "body" | "visibility">): Promise<OwnerPost>;
  updateOwnerPost(id: string, input: Pick<OwnerPost, "title" | "body" | "visibility">): Promise<OwnerPost>;
  deleteOwnerPost(id: string): Promise<void>;
  listComments(): Promise<Comment[]>;
  createComment(input: CommentInput): Promise<Comment>;
  likeComment(id: string, likes: number): Promise<void>;
  deleteComment(id: string): Promise<void>;
  listPortfolioItems(): Promise<PortfolioItem[]>;
  createPortfolioItem(input: PortfolioItemInput): Promise<PortfolioItem>;
  updatePortfolioItem(id: string, input: PortfolioItemInput): Promise<PortfolioItem>;
  deletePortfolioItem(id: string): Promise<void>;
  uploadPortfolioFile(file: File, kind: PortfolioKind): Promise<{ publicUrl: string; storagePath: string }>;
  uploadAsset(file: File, kind: AssetRecord["kind"]): Promise<AssetRecord>;
  listMusicTracks(): Promise<MusicTrack[]>;
  createMusicTrack(input: MusicTrackInput): Promise<MusicTrack>;
  updateMusicTrack(id: string, input: MusicTrackInput): Promise<MusicTrack>;
  deleteMusicTrack(id: string): Promise<void>;
  listGalleryItems(): Promise<GalleryItem[]>;
  createGalleryItem(input: GalleryItemInput): Promise<GalleryItem>;
  updateGalleryItem(id: string, input: GalleryItemInput): Promise<GalleryItem>;
  deleteGalleryItem(id: string): Promise<void>;
  listReadingNotes(): Promise<ReadingNote[]>;
  createReadingNote(input: ReadingNoteInput): Promise<ReadingNote>;
  updateReadingNote(id: string, input: ReadingNoteInput): Promise<ReadingNote>;
  deleteReadingNote(id: string): Promise<void>;
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(input: Partial<SiteSettings>): Promise<SiteSettings>;
};

type ProfileRow = {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  role: "owner" | "visitor";
};

type OwnerPostRow = {
  id: string;
  title: string;
  body: string;
  visibility: "public" | "draft";
  created_at: string;
};

type CommentRow = {
  id: string;
  author_id: string | null;
  author: string;
  avatar_url: string | null;
  body: string;
  likes: number;
  created_at: string;
};

type PortfolioItemRow = {
  id: string;
  project_id: Exclude<PortfolioProject, "all">;
  title: string;
  kind: PortfolioKind;
  summary: string;
  tags: string[];
  public_url: string;
  preview_url: string | null;
  thumbnail_url: string | null;
  source_path: string | null;
  featured: boolean;
  updated_at: string;
};

type MusicTrackRow = {
  id: string;
  title: string;
  artist: string;
  mood: string;
  duration: string | null;
  audio_url: string | null;
  cover_url: string | null;
  is_background: boolean;
  created_at: string;
};

type GalleryItemRow = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  image_url: string | null;
  is_cover: boolean;
  created_at: string;
};

type ReadingNoteRow = {
  id: string;
  kind: "book" | "video";
  title: string;
  creator: string;
  source_url: string | null;
  cover_url: string | null;
  quote: string;
  reflection: string;
  tags: string[];
  created_at: string;
};

type SiteSettingsRow = {
  id: string;
  brand_name: string | null;
  brand_subtitle: string | null;
  hero_title: string | null;
  hero_description: string | null;
  site_logo_url: string | null;
  site_avatar_url: string | null;
  hero_cover_url: string | null;
  background_music_url: string | null;
  background_music_title: string | null;
  background_music_enabled: boolean;
  updated_at: string;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabaseAssetBucket = import.meta.env.VITE_SUPABASE_PUBLIC_BUCKET || "portfolio-public";
const forceLocalPreview = import.meta.env.VITE_FORCE_LOCAL_PREVIEW === "true";
const baseUrl = import.meta.env.BASE_URL;

function withBasePath(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  if (value.startsWith("/portfolio-assets/") || value.startsWith("/portfolio-previews/")) {
    return `${baseUrl}${value.replace(/^\/+/, "")}`;
  }

  return value;
}

function isLocalPreviewHost() {
  if (typeof window === "undefined") {
    return false;
  }

  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function requireSupabaseResult<T>(data: T | null, error: { message: string } | null): T {
  if (error) {
    throw new Error(error.message);
  }

  if (data === null) {
    throw new Error("Supabase returned no data.");
  }

  return data;
}

function isMissingColumnError(error: { message?: string; code?: string } | null | undefined, columnName: string) {
  const message = error?.message?.toLowerCase() ?? "";
  return error?.code === "42703" || message.includes(`column ${columnName.toLowerCase()}`) || message.includes(columnName.toLowerCase());
}

function createSiteSettingsPayload(settings: SiteSettings, ownerId: string, includeLogo: boolean) {
  return {
    id: "main",
    owner_id: ownerId,
    brand_name: settings.brandName,
    brand_subtitle: settings.brandSubtitle,
    hero_title: settings.heroTitle,
    hero_description: settings.heroDescription,
    ...(includeLogo ? { site_logo_url: settings.siteLogoUrl ?? null } : {}),
    site_avatar_url: settings.siteAvatarUrl ?? null,
    hero_cover_url: settings.heroCoverUrl ?? null,
    background_music_url: settings.backgroundMusicUrl ?? null,
    background_music_title: settings.backgroundMusicTitle ?? null,
    background_music_enabled: settings.backgroundMusicEnabled,
    updated_at: new Date().toISOString(),
  };
}

const siteSettingsSelectColumns =
  "id,brand_name,brand_subtitle,hero_title,hero_description,site_logo_url,site_avatar_url,hero_cover_url,background_music_url,background_music_title,background_music_enabled,updated_at";

const siteSettingsSelectColumnsWithoutLogo =
  "id,brand_name,brand_subtitle,hero_title,hero_description,site_avatar_url,hero_cover_url,background_music_url,background_music_title,background_music_enabled,updated_at";

function formatRelativeTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function mapOwnerPost(row: OwnerPostRow): OwnerPost {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    visibility: row.visibility,
    createdAt: formatRelativeTime(row.created_at),
  };
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    author: row.author,
    avatar: row.avatar_url || row.author.trim().slice(0, 1) || "访",
    body: row.body,
    time: formatRelativeTime(row.created_at),
    likes: row.likes,
  };
}

function mapPortfolioItem(row: PortfolioItemRow): PortfolioItem {
  return {
    id: row.id,
    title: row.title,
    project: row.project_id,
    projectLabel: portfolioProjectLabels[row.project_id],
    kind: row.kind,
    kindLabel: portfolioKindLabels[row.kind],
    summary: row.summary,
    tags: row.tags,
    publicUrl: withBasePath(row.public_url) ?? row.public_url,
    previewUrl: withBasePath(row.preview_url),
    thumbnailUrl: withBasePath(row.thumbnail_url),
    sourcePath: row.source_path ?? "Supabase Storage",
    updatedAt: row.updated_at.slice(0, 10),
    featured: row.featured,
    downloadable: true,
  };
}

function assertPublicPortfolioInput(input: PortfolioItemInput) {
  if (!isPublicPortfolioItem(input)) {
    throw new Error("这个作品集条目像是内部投递说明或待替换个人信息文件，已阻止公开发布。");
  }
}

function mapMusicTrack(row: MusicTrackRow): MusicTrack {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    mood: row.mood,
    duration: row.duration ?? "未知",
    audioUrl: row.audio_url ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    isBackground: row.is_background,
    createdAt: row.created_at.slice(0, 10),
  };
}

function mapGalleryItem(row: GalleryItemRow): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    isCover: row.is_cover,
    createdAt: row.created_at.slice(0, 10),
  };
}

function mapReadingNote(row: ReadingNoteRow): ReadingNote {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    creator: row.creator,
    sourceUrl: row.source_url ?? undefined,
    coverUrl: row.cover_url ?? undefined,
    quote: row.quote,
    reflection: row.reflection,
    tags: row.tags,
    createdAt: row.created_at.slice(0, 10),
  };
}

function mapSiteSettings(row: SiteSettingsRow): SiteSettings {
  return {
    brandName: row.brand_name || defaultSiteSettings.brandName,
    brandSubtitle: row.brand_subtitle || defaultSiteSettings.brandSubtitle,
    heroTitle: row.hero_title || defaultSiteSettings.heroTitle,
    heroDescription: row.hero_description || defaultSiteSettings.heroDescription,
    siteLogoUrl: row.site_logo_url ?? undefined,
    siteAvatarUrl: row.site_avatar_url ?? undefined,
    heroCoverUrl: row.hero_cover_url ?? undefined,
    backgroundMusicUrl: row.background_music_url ?? undefined,
    backgroundMusicTitle: row.background_music_title ?? undefined,
    backgroundMusicEnabled: row.background_music_enabled,
    updatedAt: row.updated_at,
  };
}

function requireOwner(user: AuthUser | null, message: string) {
  if (!user || user.role !== "owner") {
    throw new Error(message);
  }

  return user;
}

function getAuthRedirectUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return `${window.location.origin}${window.location.pathname}`;
}

function getFriendlyAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "邮箱或密码不对。如果你是点邮箱链接进来的，请先在已登录状态点“设置密码”保存新密码；如果已经退出，就点“忘记密码”重新设置。";
  }

  if (normalized.includes("email not confirmed") || normalized.includes("confirm")) {
    return "这个邮箱还没有确认。请先打开确认邮件，点确认链接后再登录。";
  }

  if (normalized.includes("already registered") || normalized.includes("user already registered")) {
    return "这个邮箱已经注册过了。请直接登录；如果忘了密码，就点“忘记密码”重新设置。";
  }

  if (normalized.includes("password")) {
    return "密码没有通过要求，建议至少 6 位，并避免太简单。";
  }

  if (normalized.includes("rate limit")) {
    return "请求太频繁了，稍等一会儿再试。";
  }

  return message;
}

let localSiteSettings: SiteSettings = defaultSiteSettings;
let localProfile: AuthUser = {
  id: "local-owner",
  email: "owner@example.local",
  username: "Local Owner",
  avatarUrl: undefined,
  role: "owner",
};
let localOwnerPosts: OwnerPost[] = [...seedOwnerPosts];
let localComments: Comment[] = [...seedComments];
let localPortfolioItems: PortfolioItem[] = [...portfolioItems];
let localMusicTracks: MusicTrack[] = [...musicTracks];
let localGalleryItems: GalleryItem[] = [...galleryItems];
let localReadingNotes: ReadingNote[] = [...readingNotes];

function createLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createLocalPortfolioItem(input: PortfolioItemInput, id = createLocalId("local-portfolio")): PortfolioItem {
  return {
    id,
    title: input.title,
    project: input.project,
    projectLabel: portfolioProjectLabels[input.project],
    kind: input.kind,
    kindLabel: portfolioKindLabels[input.kind],
    summary: input.summary,
    tags: input.tags,
    publicUrl: input.publicUrl,
    previewUrl: input.previewUrl,
    thumbnailUrl: input.thumbnailUrl,
    sourcePath: input.sourcePath ?? "Local Preview",
    updatedAt: new Date().toISOString().slice(0, 10),
    featured: input.featured,
    downloadable: true,
  };
}

function createLocalMusicTrack(input: MusicTrackInput, id = createLocalId("local-music")): MusicTrack {
  return {
    id,
    title: input.title,
    artist: input.artist,
    mood: input.mood,
    duration: input.duration || "本地音频",
    audioUrl: input.audioUrl,
    coverUrl: input.coverUrl,
    isBackground: input.isBackground,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

function createLocalGalleryItem(input: GalleryItemInput, id = createLocalId("local-gallery")): GalleryItem {
  return {
    id,
    title: input.title,
    category: input.category,
    description: input.description,
    imageUrl: input.imageUrl,
    isCover: input.isCover,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

function createLocalReadingNote(input: ReadingNoteInput, id = createLocalId("local-note")): ReadingNote {
  return {
    id,
    ...input,
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export class LocalPreviewBackend implements SiteBackend {
  readonly mode = "local" as const;

  async getCurrentUser() {
    if (!isLocalPreviewHost()) {
      return null;
    }

    return localProfile;
  }

  onAuthStateChange() {
    return () => undefined;
  }

  async signInWithPassword() {
    return this.getCurrentUser();
  }

  async signUpWithPassword() {
    return {
      user: await this.getCurrentUser(),
      needsEmailConfirmation: false,
    };
  }

  async resendConfirmationEmail() {
    return;
  }

  async sendPasswordResetEmail() {
    return;
  }

  async updatePassword() {
    return;
  }

  async signOut() {
    return;
  }

  async updateProfile(input: { username: string; avatarUrl?: string }) {
    localProfile = {
      ...localProfile,
      username: input.username,
      avatarUrl: input.avatarUrl,
    };
    return localProfile;
  }

  async uploadProfileAvatar(file: File) {
    const publicUrl = URL.createObjectURL(file);
    localProfile = {
      ...localProfile,
      avatarUrl: publicUrl,
    };
    return {
      publicUrl,
      storagePath: `local-preview/profile-avatars/${file.name}`,
    };
  }

  async listOwnerPosts() {
    return localOwnerPosts.filter((post) => post.visibility === "public");
  }

  async createOwnerPost(input: Pick<OwnerPost, "title" | "body" | "visibility">) {
    const post = {
      id: createLocalId("local-post"),
      title: input.title,
      body: input.body,
      visibility: input.visibility,
      createdAt: getReadableNow(),
    };
    localOwnerPosts = [post, ...localOwnerPosts];
    return post;
  }

  async updateOwnerPost(id: string, input: Pick<OwnerPost, "title" | "body" | "visibility">) {
    const post = {
      id,
      title: input.title,
      body: input.body,
      visibility: input.visibility,
      createdAt: getReadableNow(),
    };
    localOwnerPosts = localOwnerPosts.map((item) => (item.id === id ? post : item));
    return post;
  }

  async deleteOwnerPost(id: string) {
    localOwnerPosts = localOwnerPosts.filter((post) => post.id !== id);
  }

  async listComments() {
    return localComments;
  }

  async createComment(input: CommentInput) {
    const comment = {
      id: createLocalId("local-comment"),
      author: input.author,
      avatar: input.author.trim().slice(0, 1) || "访",
      body: input.body,
      time: "刚刚",
      likes: 0,
    };
    localComments = [comment, ...localComments];
    return comment;
  }

  async likeComment(id: string, likes: number) {
    localComments = localComments.map((comment) => (comment.id === id ? { ...comment, likes } : comment));
  }

  async deleteComment(id: string) {
    localComments = localComments.filter((comment) => comment.id !== id);
  }

  async listPortfolioItems() {
    return localPortfolioItems;
  }

  async createPortfolioItem(input: PortfolioItemInput) {
    assertPublicPortfolioInput(input);
    const item = createLocalPortfolioItem(input);
    localPortfolioItems = [item, ...localPortfolioItems];
    return item;
  }

  async updatePortfolioItem(id: string, input: PortfolioItemInput) {
    assertPublicPortfolioInput(input);
    const item = createLocalPortfolioItem(input, id);
    localPortfolioItems = localPortfolioItems.map((candidate) => (candidate.id === id ? item : candidate));
    return item;
  }

  async deletePortfolioItem(id: string) {
    localPortfolioItems = localPortfolioItems.filter((item) => item.id !== id);
  }

  async uploadPortfolioFile(file: File, kind: PortfolioKind) {
    return {
      publicUrl: URL.createObjectURL(file),
      storagePath: `local-preview/portfolio/${kind}/${file.name}`,
    };
  }

  async uploadAsset(file: File, kind: AssetRecord["kind"]) {
    return {
      id: `asset-${Date.now()}`,
      kind,
      title: file.name,
      url: URL.createObjectURL(file),
      storagePath: `local-preview/${kind}/${file.name}`,
      createdAt: new Date().toISOString(),
    };
  }

  async listMusicTracks() {
    return localMusicTracks;
  }

  async createMusicTrack(input: MusicTrackInput) {
    const track = createLocalMusicTrack(input);
    localMusicTracks = [track, ...localMusicTracks];
    return track;
  }

  async updateMusicTrack(id: string, input: MusicTrackInput) {
    const track = createLocalMusicTrack(input, id);
    localMusicTracks = localMusicTracks.map((candidate) => (candidate.id === id ? track : candidate));
    return track;
  }

  async deleteMusicTrack(id: string) {
    localMusicTracks = localMusicTracks.filter((track) => track.id !== id);
  }

  async listGalleryItems() {
    return localGalleryItems;
  }

  async createGalleryItem(input: GalleryItemInput) {
    const item = createLocalGalleryItem(input);
    localGalleryItems = [item, ...localGalleryItems];
    return item;
  }

  async updateGalleryItem(id: string, input: GalleryItemInput) {
    const item = createLocalGalleryItem(input, id);
    localGalleryItems = localGalleryItems.map((candidate) => (candidate.id === id ? item : candidate));
    return item;
  }

  async deleteGalleryItem(id: string) {
    localGalleryItems = localGalleryItems.filter((item) => item.id !== id);
  }

  async listReadingNotes() {
    return localReadingNotes;
  }

  async createReadingNote(input: ReadingNoteInput) {
    const note = createLocalReadingNote(input);
    localReadingNotes = [note, ...localReadingNotes];
    return note;
  }

  async updateReadingNote(id: string, input: ReadingNoteInput) {
    const note = createLocalReadingNote(input, id);
    localReadingNotes = localReadingNotes.map((candidate) => (candidate.id === id ? note : candidate));
    return note;
  }

  async deleteReadingNote(id: string) {
    localReadingNotes = localReadingNotes.filter((note) => note.id !== id);
  }

  async getSiteSettings() {
    return localSiteSettings;
  }

  async updateSiteSettings(input: Partial<SiteSettings>) {
    localSiteSettings = {
      ...localSiteSettings,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return localSiteSettings;
  }
}

export class SupabaseBackend implements SiteBackend {
  readonly mode = "supabase" as const;

  constructor(private readonly client: SupabaseClient) {}

  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser();

    if (error || !user) {
      return null;
    }

    const { data, error: profileError } = await this.client
      .from("profiles")
      .select("id,email,username,avatar_url,role")
      .eq("id", user.id)
      .maybeSingle<ProfileRow>();

    if (profileError) {
      throw new Error(profileError.message);
    }

    return {
      id: user.id,
      email: user.email ?? data?.email ?? "",
      username: data?.username || user.user_metadata?.username || (user.email ?? "visitor").split("@")[0],
      avatarUrl: data?.avatar_url ?? undefined,
      role: data?.role ?? "visitor",
    };
  }

  onAuthStateChange(callback: (user: AuthUser | null, event: string) => void) {
    const {
      data: { subscription },
    } = this.client.auth.onAuthStateChange((event) => {
      window.setTimeout(() => {
        void this.getCurrentUser()
          .then((user) => callback(user, event))
          .catch(() => callback(null, event));
      }, 0);
    });

    return () => subscription.unsubscribe();
  }

  async signInWithPassword(input: AuthCredentials) {
    const { error } = await this.client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      throw new Error(getFriendlyAuthError(error.message));
    }

    return this.getCurrentUser();
  }

  async signUpWithPassword(input: AuthCredentials) {
    const { data, error } = await this.client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
        data: {
          username: input.username || input.email.split("@")[0],
        },
      },
    });

    if (error) {
      throw new Error(getFriendlyAuthError(error.message));
    }

    const currentUser = await this.getCurrentUser();
    return {
      user: currentUser,
      needsEmailConfirmation: Boolean(data.user && !data.session && !currentUser),
    };
  }

  async resendConfirmationEmail(email: string) {
    const { error } = await this.client.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: getAuthRedirectUrl(),
      },
    });

    if (error) {
      throw new Error(getFriendlyAuthError(error.message));
    }
  }

  async sendPasswordResetEmail(email: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo: getAuthRedirectUrl(),
    });

    if (error) {
      throw new Error(getFriendlyAuthError(error.message));
    }
  }

  async updatePassword(password: string) {
    const { error } = await this.client.auth.updateUser({ password });

    if (error) {
      throw new Error(getFriendlyAuthError(error.message));
    }
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  async updateProfile(input: { username: string; avatarUrl?: string }) {
    const { data, error } = await this.client.rpc("update_own_profile", {
      next_username: input.username,
      next_avatar_url: input.avatarUrl ?? "",
    });

    const profile = requireSupabaseResult(data as ProfileRow | null, error);
    return {
      id: profile.id,
      email: profile.email,
      username: profile.username,
      avatarUrl: profile.avatar_url ?? undefined,
      role: profile.role,
    };
  }

  async uploadProfileAvatar(file: File) {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error("请先登录账号，再上传头像。");
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const storagePath = `profile-avatars/${user.id}/${Date.now()}.${extension}`;
    const { error } = await this.client.storage
      .from(supabaseAssetBucket)
      .upload(storagePath, file, { upsert: true });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = this.client.storage.from(supabaseAssetBucket).getPublicUrl(storagePath);
    return {
      publicUrl: data.publicUrl,
      storagePath,
    };
  }

  async listOwnerPosts() {
    const { data, error } = await this.client
      .from("owner_posts")
      .select("id,title,body,visibility,created_at")
      .eq("visibility", "public")
      .order("created_at", { ascending: false });

    return requireSupabaseResult(data as OwnerPostRow[] | null, error).map(mapOwnerPost);
  }

  async createOwnerPost(input: Pick<OwnerPost, "title" | "body" | "visibility">) {
    const user = await this.getCurrentUser();
    const owner = requireOwner(user, "只有站主账号可以发布动态。");

    const { data, error } = await this.client
      .from("owner_posts")
      .insert({
        owner_id: owner.id,
        title: input.title,
        body: input.body,
        visibility: input.visibility,
      })
      .select("id,title,body,visibility,created_at")
      .single<OwnerPostRow>();

    return mapOwnerPost(requireSupabaseResult(data, error));
  }

  async updateOwnerPost(id: string, input: Pick<OwnerPost, "title" | "body" | "visibility">) {
    requireOwner(await this.getCurrentUser(), "只有站主账号可以修改动态。");

    const { data, error } = await this.client
      .from("owner_posts")
      .update({
        title: input.title,
        body: input.body,
        visibility: input.visibility,
      })
      .eq("id", id)
      .select("id,title,body,visibility,created_at")
      .single<OwnerPostRow>();

    return mapOwnerPost(requireSupabaseResult(data, error));
  }

  async deleteOwnerPost(id: string) {
    requireOwner(await this.getCurrentUser(), "只有站主账号可以删除动态。");

    const { error } = await this.client.from("owner_posts").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async listComments() {
    const { data, error } = await this.client
      .from("public_comments")
      .select("id,author_id,author,avatar_url,body,likes,created_at")
      .eq("approved", true)
      .not("author_id", "is", null)
      .order("created_at", { ascending: false });

    return requireSupabaseResult(data as CommentRow[] | null, error).map(mapComment);
  }

  async createComment(input: CommentInput) {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error("请先登录账号，再留言。");
    }

    const { data, error } = await this.client
      .from("public_comments")
      .insert({
        author_id: user.id,
        author: user.username || input.author || user.email.split("@")[0],
        avatar_url: user.avatarUrl ?? null,
        body: input.body,
        client_elapsed_ms: input.verificationElapsedMs ?? 0,
        honeypot: input.honeypot ?? "",
      })
      .select("id,author_id,author,avatar_url,body,likes,created_at")
      .single<CommentRow>();

    return mapComment(requireSupabaseResult(data, error));
  }

  async likeComment(id: string) {
    const { error } = await this.client.rpc("increment_comment_likes", { comment_id: id });

    if (error) {
      throw new Error(error.message);
    }
  }

  async deleteComment(id: string) {
    requireOwner(await this.getCurrentUser(), "只有站主账号可以删除留言。");

    const { error } = await this.client.from("public_comments").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async listPortfolioItems() {
    const { data, error } = await this.client
      .from("portfolio_items")
      .select("id,project_id,title,kind,summary,tags,public_url,preview_url,thumbnail_url,source_path,featured,updated_at")
      .eq("published", true)
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });

    return requireSupabaseResult(data as PortfolioItemRow[] | null, error)
      .map(mapPortfolioItem)
      .filter(isPublicPortfolioItem);
  }

  async createPortfolioItem(input: PortfolioItemInput) {
    assertPublicPortfolioInput(input);
    const user = await this.getCurrentUser();
    const owner = requireOwner(user, "只有站主账号可以编辑作品集。");

    const { data, error } = await this.client
      .from("portfolio_items")
      .insert({
        owner_id: owner.id,
        project_id: input.project,
        title: input.title,
        kind: input.kind,
        summary: input.summary,
        tags: input.tags,
        public_url: input.publicUrl,
        preview_url: input.previewUrl || null,
        thumbnail_url: input.thumbnailUrl || null,
        source_path: input.sourcePath || null,
        featured: input.featured ?? false,
        published: true,
      })
      .select("id,project_id,title,kind,summary,tags,public_url,preview_url,thumbnail_url,source_path,featured,updated_at")
      .single<PortfolioItemRow>();

    return mapPortfolioItem(requireSupabaseResult(data, error));
  }

  async updatePortfolioItem(id: string, input: PortfolioItemInput) {
    assertPublicPortfolioInput(input);
    requireOwner(await this.getCurrentUser(), "只有站主账号可以修改作品集。");

    const { data, error } = await this.client
      .from("portfolio_items")
      .update({
        project_id: input.project,
        title: input.title,
        kind: input.kind,
        summary: input.summary,
        tags: input.tags,
        public_url: input.publicUrl,
        preview_url: input.previewUrl || null,
        thumbnail_url: input.thumbnailUrl || null,
        source_path: input.sourcePath || null,
        featured: input.featured ?? false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id,project_id,title,kind,summary,tags,public_url,preview_url,thumbnail_url,source_path,featured,updated_at")
      .single<PortfolioItemRow>();

    return mapPortfolioItem(requireSupabaseResult(data, error));
  }

  async deletePortfolioItem(id: string) {
    requireOwner(await this.getCurrentUser(), "只有站主账号可以删除作品集条目。");

    const { error } = await this.client.from("portfolio_items").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async uploadPortfolioFile(file: File, kind: PortfolioKind) {
    const user = await this.getCurrentUser();

    requireOwner(user, "只有站主账号可以上传作品集文件。");

    const storagePath = `portfolio/${kind}/${Date.now()}-${file.name}`;
    const { error } = await this.client.storage
      .from(supabaseAssetBucket)
      .upload(storagePath, file, { upsert: false });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = this.client.storage.from(supabaseAssetBucket).getPublicUrl(storagePath);
    return {
      publicUrl: data.publicUrl,
      storagePath,
    };
  }

  async uploadAsset(file: File, kind: AssetRecord["kind"]) {
    const user = await this.getCurrentUser();
    const owner = requireOwner(user, "只有站主账号可以上传作品资源。");

    const storagePath = `${kind}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await this.client.storage
      .from(supabaseAssetBucket)
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data: publicData } = this.client.storage.from(supabaseAssetBucket).getPublicUrl(storagePath);
    const { data, error } = await this.client
      .from("assets")
      .insert({
        owner_id: owner.id,
        kind,
        title: file.name,
        storage_path: storagePath,
        public_url: publicData.publicUrl,
      })
      .select("id,kind,title,storage_path,public_url,created_at")
      .single<{
        id: string;
        kind: AssetRecord["kind"];
        title: string;
        storage_path: string;
        public_url: string | null;
        created_at: string;
      }>();

    const record = requireSupabaseResult(data, error);
    return {
      id: record.id,
      kind: record.kind,
      title: record.title,
      url: record.public_url ?? publicData.publicUrl,
      storagePath: record.storage_path,
      createdAt: record.created_at,
    };
  }

  async listMusicTracks() {
    const { data, error } = await this.client
      .from("music_tracks")
      .select("id,title,artist,mood,duration,audio_url,cover_url,is_background,created_at")
      .eq("published", true)
      .order("is_background", { ascending: false })
      .order("created_at", { ascending: false });

    return requireSupabaseResult(data as MusicTrackRow[] | null, error).map(mapMusicTrack);
  }

  async createMusicTrack(input: MusicTrackInput) {
    const user = requireOwner(await this.getCurrentUser(), "只有站主账号可以上传音乐。");

    const { data, error } = await this.client
      .from("music_tracks")
      .insert({
        owner_id: user.id,
        title: input.title,
        artist: input.artist,
        mood: input.mood,
        duration: input.duration || null,
        audio_url: input.audioUrl,
        cover_url: input.coverUrl || null,
        is_background: input.isBackground ?? false,
        published: true,
      })
      .select("id,title,artist,mood,duration,audio_url,cover_url,is_background,created_at")
      .single<MusicTrackRow>();

    return mapMusicTrack(requireSupabaseResult(data, error));
  }

  async updateMusicTrack(id: string, input: MusicTrackInput) {
    requireOwner(await this.getCurrentUser(), "只有站主账号可以修改音乐。");

    const { data, error } = await this.client
      .from("music_tracks")
      .update({
        title: input.title,
        artist: input.artist,
        mood: input.mood,
        duration: input.duration || null,
        audio_url: input.audioUrl,
        cover_url: input.coverUrl || null,
        is_background: input.isBackground ?? false,
      })
      .eq("id", id)
      .select("id,title,artist,mood,duration,audio_url,cover_url,is_background,created_at")
      .single<MusicTrackRow>();

    return mapMusicTrack(requireSupabaseResult(data, error));
  }

  async deleteMusicTrack(id: string) {
    requireOwner(await this.getCurrentUser(), "只有站主账号可以删除音乐。");

    const { error } = await this.client.from("music_tracks").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async listGalleryItems() {
    const { data, error } = await this.client
      .from("gallery_items")
      .select("id,title,category,description,image_url,is_cover,created_at")
      .eq("published", true)
      .order("is_cover", { ascending: false })
      .order("created_at", { ascending: false });

    return requireSupabaseResult(data as GalleryItemRow[] | null, error).map(mapGalleryItem);
  }

  async createGalleryItem(input: GalleryItemInput) {
    const user = requireOwner(await this.getCurrentUser(), "只有站主账号可以上传图片。");

    const { data, error } = await this.client
      .from("gallery_items")
      .insert({
        owner_id: user.id,
        title: input.title,
        category: input.category,
        description: input.description || null,
        image_url: input.imageUrl,
        is_cover: input.isCover ?? false,
        published: true,
      })
      .select("id,title,category,description,image_url,is_cover,created_at")
      .single<GalleryItemRow>();

    return mapGalleryItem(requireSupabaseResult(data, error));
  }

  async updateGalleryItem(id: string, input: GalleryItemInput) {
    requireOwner(await this.getCurrentUser(), "只有站主账号可以修改图片。");

    const { data, error } = await this.client
      .from("gallery_items")
      .update({
        title: input.title,
        category: input.category,
        description: input.description || null,
        image_url: input.imageUrl,
        is_cover: input.isCover ?? false,
      })
      .eq("id", id)
      .select("id,title,category,description,image_url,is_cover,created_at")
      .single<GalleryItemRow>();

    return mapGalleryItem(requireSupabaseResult(data, error));
  }

  async deleteGalleryItem(id: string) {
    requireOwner(await this.getCurrentUser(), "只有站主账号可以删除图片。");

    const { error } = await this.client.from("gallery_items").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async listReadingNotes() {
    const { data, error } = await this.client
      .from("reading_notes")
      .select("id,kind,title,creator,source_url,cover_url,quote,reflection,tags,created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    return requireSupabaseResult(data as ReadingNoteRow[] | null, error).map(mapReadingNote);
  }

  async createReadingNote(input: ReadingNoteInput) {
    const user = requireOwner(await this.getCurrentUser(), "只有站主账号可以发布书摘心得。");

    const { data, error } = await this.client
      .from("reading_notes")
      .insert({
        owner_id: user.id,
        kind: input.kind,
        title: input.title,
        creator: input.creator,
        source_url: input.sourceUrl || null,
        cover_url: input.coverUrl || null,
        quote: input.quote,
        reflection: input.reflection,
        tags: input.tags,
        published: true,
      })
      .select("id,kind,title,creator,source_url,cover_url,quote,reflection,tags,created_at")
      .single<ReadingNoteRow>();

    return mapReadingNote(requireSupabaseResult(data, error));
  }

  async updateReadingNote(id: string, input: ReadingNoteInput) {
    requireOwner(await this.getCurrentUser(), "只有站主账号可以修改书摘心得。");

    const { data, error } = await this.client
      .from("reading_notes")
      .update({
        kind: input.kind,
        title: input.title,
        creator: input.creator,
        source_url: input.sourceUrl || null,
        cover_url: input.coverUrl || null,
        quote: input.quote,
        reflection: input.reflection,
        tags: input.tags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id,kind,title,creator,source_url,cover_url,quote,reflection,tags,created_at")
      .single<ReadingNoteRow>();

    return mapReadingNote(requireSupabaseResult(data, error));
  }

  async deleteReadingNote(id: string) {
    requireOwner(await this.getCurrentUser(), "只有站主账号可以删除书摘心得。");

    const { error } = await this.client.from("reading_notes").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getSiteSettings() {
    const { data, error } = await this.client
      .from("site_settings")
      .select(siteSettingsSelectColumnsWithoutLogo)
      .eq("id", "main")
      .maybeSingle<Omit<SiteSettingsRow, "site_logo_url">>();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return defaultSiteSettings;
    }

    const settings: SiteSettingsRow = {
      ...data,
      site_logo_url: null,
    };

    const { data: logoData, error: logoError } = await this.client
      .from("site_settings")
      .select("site_logo_url")
      .eq("id", "main")
      .maybeSingle<Pick<SiteSettingsRow, "site_logo_url">>();

    if (logoError && !isMissingColumnError(logoError, "site_logo_url")) {
      throw new Error(logoError.message);
    }

    settings.site_logo_url = logoData?.site_logo_url ?? null;
    return mapSiteSettings(settings);
  }

  async updateSiteSettings(input: Partial<SiteSettings>) {
    const user = requireOwner(await this.getCurrentUser(), "只有站主账号可以修改网站封面和背景音乐。");
    const currentSettings = await this.getSiteSettings();
    const nextSettings = {
      ...currentSettings,
      ...input,
    };

    const { data, error } = await this.client
      .from("site_settings")
      .upsert(createSiteSettingsPayload(nextSettings, user.id, true))
      .select(siteSettingsSelectColumns)
      .single<SiteSettingsRow>();

    if (error && isMissingColumnError(error, "site_logo_url")) {
      if (input.siteLogoUrl !== undefined) {
        throw new Error("线上数据库还缺少 site_logo_url 字段。请先在 Supabase SQL Editor 运行 supabase/fix-live-database.sql，再上传 Logo。");
      }

      const { data: fallbackData, error: fallbackError } = await this.client
        .from("site_settings")
        .upsert(createSiteSettingsPayload(nextSettings, user.id, false))
        .select(siteSettingsSelectColumnsWithoutLogo)
        .single<Omit<SiteSettingsRow, "site_logo_url">>();

      const fallbackSettings = requireSupabaseResult(fallbackData, fallbackError);
      return mapSiteSettings({
        ...fallbackSettings,
        site_logo_url: currentSettings.siteLogoUrl ?? null,
      });
    }

    return mapSiteSettings(requireSupabaseResult(data, error));
  }
}

export const siteBackend: SiteBackend =
  forceLocalPreview && isLocalPreviewHost()
    ? new LocalPreviewBackend()
    : supabaseUrl && supabaseAnonKey
      ? new SupabaseBackend(createClient(supabaseUrl, supabaseAnonKey))
      : new LocalPreviewBackend();
