import { BLOG } from "@/src/constants/portal/blog-page";
import type { BlogPost, PostListResponse, Topic } from "@/src/services/post";
import { GOC_API, fetchFromServer } from "@/src/services/serverFetch";

const RONG: PostListResponse = { posts: [], total: 0, page: 1, totalPages: 1 };

/** Danh sach bai (theo chu de + trang) va danh sach chu de, lay o may chu. */
export async function getPostList(topic: string, page: number) {
  // Loc theo chu de qua DUONG DAN chu khong qua trang thai client: nho vay
  // trang van dung san duoc, chia se link ra ngoai van giu bo loc, va nut
  // Back cua trinh duyet hoat dong dung.
  const qs = new URLSearchParams({ page: String(page), limit: String(BLOG.pageSize) });
  if (topic) qs.set("topic", topic);

  const [data, topics] = await Promise.all([
    fetchFromServer<PostListResponse>(
      BLOG.postsApi(qs.toString()),
      RONG,
      BLOG.revalidate,
    ),
    fetchFromServer<Topic[]>(BLOG.topicsApi, [], BLOG.revalidate),
  ]);

  return { data, topics };
}

/** Mot bai theo slug; null khi khong co hoac loi mang. */
export async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${GOC_API}${BLOG.postApi(slug)}`, {
      next: { revalidate: BLOG.revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as BlogPost;
  } catch {
    return null;
  }
}

/** Duong dan /blog giu chu de dang chon, chi them ?page khi > 1. */
export function buildBlogPath(
  currentTopic: string,
  p: { topic?: string; page?: number },
): string {
  const u = new URLSearchParams();
  const t = p.topic ?? currentTopic;
  if (t) u.set("topic", t);
  if (p.page && p.page > 1) u.set("page", String(p.page));
  const s = u.toString();
  return s ? `${BLOG.listHref}?${s}` : BLOG.listHref;
}
