import Link from "next/link";
import FeedCard from "@/src/components/common/FeedCard";
import TieuDeMuc from "@/src/components/home/SectionHeading";
import { thoiGianTuongDoi, phutDoc } from "@/src/components/common/time";
import type { BlogPost, PostListResponse, Topic } from "@/src/services/post";
import { layTuMayChu } from "@/src/services/serverFetch";

export const metadata = {
  title: "Bài viết",
  description:
    "Tổng hợp các bài viết chia sẻ về kinh nghiệm tự học lập trình online và các kỹ thuật lập trình web.",
};

export const revalidate = 30;

import styles from "./page.module.scss";
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
    <div className={styles.page}>
      {/* max-w-7xl px-6 trung voi BlogHeader, nho vay tieu de bai va logo tren
          thanh dieu huong thang hang nhau. */}
      <div className={styles.container}>
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

        <div className={styles.grid}>
          {/* --------------------------------------------------------- */}
          {/* Cot trai - danh sach bai viet                              */}
          {/* --------------------------------------------------------- */}
          <div>
            {data.posts.length === 0 ? (
              <div className={styles.card}>
                <p className={styles.text}>
                  {topic ? "Chủ đề này chưa có bài viết" : "Chưa có bài viết nào"}
                </p>
                {topic && (
                  <Link href="/blog" className={styles.box}>
                    Xem tất cả bài viết
                  </Link>
                )}
              </div>
            ) : (
              <div className={styles.stack}>
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
                          <span key={t} className={styles.label}>
                            {t}
                          </span>
                        ))}
                        <span>{thoiGianTuongDoi(p.createdAt)}</span>
                        <span aria-hidden className={styles.label2}>
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
              <div className={styles.row}>
                {page > 1 ? (
                  <Link href={duongDan({ page: page - 1 })} className={styles.card2}>
                    Trước
                  </Link>
                ) : (
                  <span className={styles.label3}>Trước</span>
                )}
                <span className={styles.label4}>
                  Trang {data.page}/{data.totalPages}
                </span>
                {page < data.totalPages ? (
                  <Link href={duongDan({ page: page + 1 })} className={styles.card2}>
                    Sau
                  </Link>
                ) : (
                  <span className={styles.label3}>Sau</span>
                )}
              </div>
            )}
          </div>

          {/* --------------------------------------------------------- */}
          {/* Cot phai - chu de                                          */}
          {/* --------------------------------------------------------- */}
          <aside className={styles.aside}>
            <h2 className={styles.heading}>Xem các bài viết theo chủ đề</h2>
            <ul className={styles.list}>
              {topics.map((t) => {
                const dangChon = t.slug === topic;
                return (
                  <li key={t.slug}>
                    <Link
                      href={dangChon ? "/blog" : duongDan({ topic: t.slug, page: 1 })}
                      aria-current={dangChon ? "page" : undefined}
                      className={[styles.box2, dangChon ? styles.box3 : styles.box4].join(
                        " ",
                      )}
                    >
                      {t.name}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className={styles.card3}>
              <p className={styles.text2}>Bạn có tài liệu muốn chia sẻ?</p>
              <p className={styles.text3}>
                Đăng đề cương, đề thi hoặc slide bài giảng để mọi người cùng tải về.
              </p>
              <Link href="/share-document" className={styles.box5}>
                Chia sẻ tài liệu
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
