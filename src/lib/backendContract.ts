import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  portfolioItems,
  portfolioKindLabels,
  portfolioProjectLabels,
  type PortfolioItem,
  type PortfolioKind,
  type PortfolioProject,
} from "../data/portfolioItems";
import type { Comment, OwnerPost } from "../data/siteData";
import { getReadableNow } from "./format";

export type AuthUser = {
  id: string;
  email: string;
  role: "owner" | "visitor";
};

export type AssetRecord = {
  id: string;
  kind: "design-doc" | "game-demo" | "music-cover" | "gallery-image";
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

export type SiteBackend = {
  readonly mode: "local" | "supabase";
  getCurrentUser(): Promise<AuthUser | null>;
  signInOwner(email: string): Promise<void>;
  signOut(): Promise<void>;
  listOwnerPosts(): Promise<OwnerPost[]>;
  createOwnerPost(input: Pick<OwnerPost, "title" | "body" | "visibility">): Promise<OwnerPost>;
  listComments(): Promise<Comment[]>;
  createComment(input: Pick<Comment, "author" | "body">): Promise<Comment>;
  likeComment(id: string, likes: number): Promise<void>;
  listPortfolioItems(): Promise<PortfolioItem[]>;
  createPortfolioItem(input: PortfolioItemInput): Promise<PortfolioItem>;
  uploadPortfolioFile(file: File, kind: PortfolioKind): Promise<{ publicUrl: string; storagePath: string }>;
  uploadAsset(file: File, kind: AssetRecord["kind"]): Promise<AssetRecord>;
};

type ProfileRow = {
  id: string;
  email: string;
  role: "owner" | "visitor";
};

type OwnerPostRow = {
  id: string;
  title: string;
  body: string;
  visibility: "private" | "draft";
  created_at: string;
};

type CommentRow = {
  id: string;
  author: string;
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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabaseAssetBucket = import.meta.env.VITE_SUPABASE_PUBLIC_BUCKET || "portfolio-public";
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
    avatar: row.author.trim().slice(0, 1) || "访",
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

export class LocalPreviewBackend implements SiteBackend {
  readonly mode = "local" as const;

  async getCurrentUser() {
    if (!isLocalPreviewHost()) {
      return null;
    }

    return {
      id: "local-owner",
      email: "owner@example.local",
      role: "owner" as const,
    };
  }

  async signInOwner() {
    return;
  }

  async signOut() {
    return;
  }

  async listOwnerPosts() {
    return [];
  }

  async createOwnerPost(input: Pick<OwnerPost, "title" | "body" | "visibility">) {
    return {
      id: `local-${Date.now()}`,
      title: input.title,
      body: input.body,
      visibility: input.visibility,
      createdAt: getReadableNow(),
    };
  }

  async listComments() {
    return [];
  }

  async createComment(input: Pick<Comment, "author" | "body">) {
    return {
      id: `local-${Date.now()}`,
      author: input.author,
      avatar: input.author.trim().slice(0, 1) || "访",
      body: input.body,
      time: "刚刚",
      likes: 0,
    };
  }

  async likeComment() {
    return;
  }

  async listPortfolioItems() {
    return portfolioItems;
  }

  async createPortfolioItem(input: PortfolioItemInput) {
    return {
      id: `local-portfolio-${Date.now()}`,
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
      .select("id,email,role")
      .eq("id", user.id)
      .maybeSingle<ProfileRow>();

    if (profileError) {
      throw new Error(profileError.message);
    }

    return {
      id: user.id,
      email: user.email ?? data?.email ?? "",
      role: data?.role ?? "visitor",
    };
  }

  async signInOwner(email: string) {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${window.location.pathname}#private`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  }

  async listOwnerPosts() {
    const { data, error } = await this.client
      .from("owner_posts")
      .select("id,title,body,visibility,created_at")
      .order("created_at", { ascending: false });

    return requireSupabaseResult(data as OwnerPostRow[] | null, error).map(mapOwnerPost);
  }

  async createOwnerPost(input: Pick<OwnerPost, "title" | "body" | "visibility">) {
    const user = await this.getCurrentUser();

    if (!user || user.role !== "owner") {
      throw new Error("只有站主账号可以发布私密内容。");
    }

    const { data, error } = await this.client
      .from("owner_posts")
      .insert({
        owner_id: user.id,
        title: input.title,
        body: input.body,
        visibility: input.visibility,
      })
      .select("id,title,body,visibility,created_at")
      .single<OwnerPostRow>();

    return mapOwnerPost(requireSupabaseResult(data, error));
  }

  async listComments() {
    const { data, error } = await this.client
      .from("public_comments")
      .select("id,author,body,likes,created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false });

    return requireSupabaseResult(data as CommentRow[] | null, error).map(mapComment);
  }

  async createComment(input: Pick<Comment, "author" | "body">) {
    const { data, error } = await this.client
      .from("public_comments")
      .insert({
        author: input.author,
        body: input.body,
      })
      .select("id,author,body,likes,created_at")
      .single<CommentRow>();

    return mapComment(requireSupabaseResult(data, error));
  }

  async likeComment(id: string) {
    const { error } = await this.client.rpc("increment_comment_likes", { comment_id: id });

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

    return requireSupabaseResult(data as PortfolioItemRow[] | null, error).map(mapPortfolioItem);
  }

  async createPortfolioItem(input: PortfolioItemInput) {
    const user = await this.getCurrentUser();

    if (!user || user.role !== "owner") {
      throw new Error("只有站主账号可以编辑作品集。");
    }

    const { data, error } = await this.client
      .from("portfolio_items")
      .insert({
        owner_id: user.id,
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

  async uploadPortfolioFile(file: File, kind: PortfolioKind) {
    const user = await this.getCurrentUser();

    if (!user || user.role !== "owner") {
      throw new Error("只有站主账号可以上传作品集文件。");
    }

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

    if (!user || user.role !== "owner") {
      throw new Error("只有站主账号可以上传作品资源。");
    }

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
        owner_id: user.id,
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
}

export const siteBackend: SiteBackend =
  supabaseUrl && supabaseAnonKey
    ? new SupabaseBackend(createClient(supabaseUrl, supabaseAnonKey))
    : new LocalPreviewBackend();
