import { apiRequest } from "./apiHelper";

export interface PostAuthor {
  _id?: string;
  name?: string;
  avatar?: string;
  role?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  thumbnail?: string;
  topic: string;
  tags: string[];
  author?: PostAuthor | null;
  views: number;
  createdAt: string;
  /** Chi co trong danh sach cua khu quan tri */
  isPublished?: boolean;
  updatedAt?: string;
}

export interface PostListResponse {
  posts: BlogPost[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Topic {
  slug: string;
  name: string;
  count: number;
}

/** Du lieu gui len khi dang moi hoac sua bai */
export interface PostInput {
  title: string;
  excerpt: string;
  content: string;
  topic?: string;
  tags?: string[];
  thumbnail?: string;
  isPublished?: boolean;
}

export const postService = {
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    topic?: string;
    tag?: string;
    q?: string;
  }): Promise<PostListResponse> => {
    const sp = new URLSearchParams();
    if (params?.page) sp.append("page", String(params.page));
    if (params?.limit) sp.append("limit", String(params.limit));
    if (params?.topic) sp.append("topic", params.topic);
    if (params?.tag) sp.append("tag", params.tag);
    if (params?.q?.trim()) sp.append("q", params.q.trim());
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    return apiRequest(`/posts${qs}`, { method: "GET" });
  },

  getTopics: async (): Promise<Topic[]> => apiRequest("/posts/topics", { method: "GET" }),

  getPostBySlug: async (slug: string): Promise<BlogPost> =>
    apiRequest(`/posts/${slug}`, { method: "GET" }),

  createPost: async (data: PostInput): Promise<BlogPost> =>
    apiRequest("/posts", { method: "POST", body: JSON.stringify(data) }),

  updatePost: async (id: string, data: PostInput): Promise<BlogPost> =>
    apiRequest(`/posts/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // --- Khu quan tri ---
  // Hai ham duoi day tra ve ca bai nhap, nen bat buoc token admin.
  getAdminPosts: async (params?: {
    page?: number;
    limit?: number;
    topic?: string;
    status?: "draft" | "published";
    q?: string;
  }): Promise<PostListResponse> => {
    const sp = new URLSearchParams();
    if (params?.page) sp.append("page", String(params.page));
    if (params?.limit) sp.append("limit", String(params.limit));
    if (params?.topic) sp.append("topic", params.topic);
    if (params?.status) sp.append("status", params.status);
    if (params?.q?.trim()) sp.append("q", params.q.trim());
    const qs = sp.toString() ? `?${sp.toString()}` : "";
    return apiRequest(`/posts/admin/all${qs}`, { method: "GET" });
  },

  getAdminPost: async (id: string): Promise<BlogPost> =>
    apiRequest(`/posts/admin/${id}`, { method: "GET" }),

  deletePost: async (id: string): Promise<{ message: string }> =>
    apiRequest(`/posts/${id}`, { method: "DELETE" }),
};
