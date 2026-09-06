import Link from "next/link";
import FeedCard from "@/src/components/common/FeedCard";
import TieuDeMuc from "@/src/components/home/TieuDeMuc";
import { thoiGianTuongDoi, phutDoc } from "@/src/components/common/thoiGian";
import type { BlogPost, PostListResponse, Topic } from "@/src/services/post";
import { layTuMayChu } from "@/src/services/serverFetch";

export const metadata = {
  title: "Bài viết",
  description:
    "Tổng hợp các bài viết chia sẻ về kinh nghiệm tự học lập trình online và các kỹ thuật lập trình web.",
};

export const revalidate = 30;

const RONG: PostListResponse = { posts: [], total: 0, page: 1, totalPages: 1 };

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const topic = sp.topic ?? "";
  const page = Math.max(1, Number(sp.page) || 1);

  // Loc theo chu de qua DUONG DAN chu khong qua trang thai client: nho vay
  // trang van dung san duoc, chia se link ra ngoai van giu bo loc, va nut
  // Back cua trinh duyet hoat dong dung.
  const qs = new URLSearchParams({ page: String(page), limit: "10" });
  if (topic) qs.set("topic", topic);

  const [data, topics] = await Promise.all([
    layTuMayChu<PostListResponse>(`/api/posts?${qs.toString()}`, RONG, 30),
    layTuMayChu<Topic[]>("/api/posts/topics", [], 30),
  ]);

  const chuDeDangChon = topics.find((t) => t.slug === topic);

  const duongDan = (p: { topic?: string; page?: number }) => {
    const u = new URLSearchParams();
    const t = p.topic ?? topic;
    if (t) u.set("topic", t);
    if (p.page && p.page > 1) u.set("page", String(p.page));
    const s = u.toString();
    return s ? `/blog?${s}` : "/blog";
  };

  return (
    <div className="min-h-screen bg-white py-8">
      {/* max-w-7xl px-6 trung voi BlogHeader, nho vay tieu de bai va logo tren
          thanh dieu huong thang hang nhau. */}
      <div className="mx-auto max-w-7xl px-6">
        <TieuDeMuc
          nhu="h1"
          tieuDe={chuDeDangChon ? chuDeDangChon.name : "Bài viết"}
          moTa="Tổng hợp các bài viết chia sẻ về kinh nghiệm tự học lập trình online và các kỹ thuật lập trình web."
          // Dang loc theo mot chu de thi mo mot duong ra. Truoc day loi ra duy
          // nhat la cai the chu de o cot phai - ma tren man hinh hep cot do bi
          // day xuong tan duoi danh sach bai.
          xemTatCa={chuDeDangChon ? "/blog" : undefined}
          chuXemTatCa="Tất cả bài viết"
        />

        <div className="mt-7 grid gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* --------------------------------------------------------- */}
          {/* Cot trai - danh sach bai viet                              */}
          {/* --------------------------------------------------------- */}
          <div>
            {data.posts.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
                <p className="text-sm font-semibold text-slate-800">
                  {topic ? "Chủ đề này chưa có bài viết" : "Chưa có bài viết nào"}
                </p>
                {topic && (
                  <Link
                    href="/blog"
                    className="mt-3 inline-block text-sm font-semibold text-blue-700 hover:underline"
                  >
                    Xem tất cả bài viết
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {data.posts.map((p: BlogPost) => (
                  <FeedCard
                    key={p._id}
                    href={`/blog/${p.slug}`}
                    tacGia={p.author?.name || "Ẩn danh"}
                    anhTacGia={p.author?.avatar || null}
                    daXacThuc={
                      p.author?.role === "admin" || p.author?.role === "instructor"
                    }
                    tieuDe={p.title}
                    moTa={p.excerpt}
                    anh={p.thumbnail ? { src: p.thumbnail, alt: p.title } : null}
                    meta={
                      <>
                        {p.tags.slice(0, 1).map((t) => (
                          <span
                            key={t}
                            className="rounded-md bg-slate-100 px-2.5 py-1 text-[13px] text-slate-700"
                          >
                            {t}
                          </span>
                        ))}
                        <span>{thoiGianTuongDoi(p.createdAt)}</span>
                        <span aria-hidden className="text-slate-300">
                          &middot;
                        </span>
                        <span>{phutDoc(p.excerpt)} phút đọc</span>
                      </>
                    }
                  />
                ))}
              </div>
            )}

            {data.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {page > 1 ? (
                  <Link
                    href={duongDan({ page: page - 1 })}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-600"
                  >
                    Trước
                  </Link>
                ) : (
                  <span className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-300">
                    Trước
                  </span>
                )}
                <span className="px-2 text-sm text-slate-600">
                  Trang {data.page}/{data.totalPages}
                </span>
                {page < data.totalPages ? (
                  <Link
                    href={duongDan({ page: page + 1 })}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-600"
                  >
                    Sau
                  </Link>
                ) : (
                  <span className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-300">
                    Sau
                  </span>
                )}
              </div>
            )}
          </div>

          {/* --------------------------------------------------------- */}
          {/* Cot phai - chu de                                          */}
          {/* --------------------------------------------------------- */}
          <aside className="lg:sticky lg:top-[120px] lg:self-start">
            <h2 className="text-[13px] font-bold tracking-wide text-slate-500 uppercase">
              Xem các bài viết theo chủ đề
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {topics.map((t) => {
                const dangChon = t.slug === topic;
                return (
                  <li key={t.slug}>
                    <Link
                      href={dangChon ? "/blog" : duongDan({ topic: t.slug, page: 1 })}
                      aria-current={dangChon ? "page" : undefined}
                      className={[
                        "inline-block rounded-full px-4 py-2 text-[15px] transition",
                        dangChon
                          ? "bg-blue-600 font-semibold text-white"
                          : "bg-slate-100 text-slate-800 hover:bg-slate-200",
                      ].join(" ")}
                    >
                      {t.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-bold text-slate-900">
                Bạn có tài liệu muốn chia sẻ?
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                Đăng đề cương, đề thi hoặc slide bài giảng để mọi người cùng tải về.
              </p>
              <Link
                href="/share-document"
                className="mt-3 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Chia sẻ tài liệu
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
