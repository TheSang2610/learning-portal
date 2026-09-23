import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Eye, User } from "lucide-react";
import ArticleWithOutline from "@/src/components/common/ArticleWithOutline";
import SafeImage from "@/src/components/ui/SafeImage";
import { thoiGianTuongDoi, phutDoc } from "@/src/components/common/time";
import type { BlogPost } from "@/src/services/post";
import { GOC_API } from "@/src/services/serverFetch";

export const revalidate = 30;

import styles from "./page.module.scss";
async function layBai(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`${GOC_API}/api/posts/${encodeURIComponent(slug)}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    return (await res.json()) as BlogPost;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bai = await layBai(slug);
  if (!bai) return { title: "Không tìm thấy bài viết" };
  return { title: bai.title, description: bai.excerpt };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const bai = await layBai(slug);
  if (!bai) notFound();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link href="/blog" className={styles.box}>
          <ArrowLeft size={16} />
          Về danh sách bài viết
        </Link>

        <div className={styles.card}>
          {bai.thumbnail && (
            // aspect-[16/6] thay vi chieu cao co dinh: anh khong bi bop meo
            // tren man hinh hep, va khong tao khoang trong tren man hinh rong.
            <div className={styles.box2}>
              <SafeImage
                src={bai.thumbnail}
                alt={bai.title}
                fill
                sizes="(max-width: 1152px) 100vw, 1152px"
                className={styles.box3}
                priority
              />
            </div>
          )}

          <div className={styles.box4}>
            <div className={styles.row}>
              {bai.tags.map((t) => (
                <span key={t} className={styles.label}>
                  {t}
                </span>
              ))}
            </div>

            <h1 className={styles.title}>{bai.title}</h1>
            <p className={styles.text}>{bai.excerpt}</p>

            <div className={styles.row2}>
              <span className={styles.label2}>
                <User size={15} className={styles.box5} />
                {bai.author?.name || "Ẩn danh"}
              </span>
              <span className={styles.label2}>
                <CalendarDays size={15} className={styles.box5} />
                {thoiGianTuongDoi(bai.createdAt)}
              </span>
              <span className={styles.label2}>
                <Eye size={15} className={styles.box5} />
                {bai.views} lượt xem
              </span>
              <span>{phutDoc(bai.content ?? "")} phút đọc</span>
            </div>
          </div>
        </div>

        <ArticleWithOutline
          content={bai.content ?? ""}
          goiYKhiTrong="Bài viết này chưa chia mục."
        />
      </div>
    </div>
  );
}
