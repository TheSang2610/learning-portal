import Link from "next/link";

import FeedCard from "@/src/components/common/FeedCard";
import { readingMinutes, relativeTime } from "@/src/lib/post-time";
import { BLOG } from "@/src/constants/portal/blog-page";
import type { BlogPost } from "@/src/services/post";

import styles from "./BlogList.module.scss";

const L = BLOG.list;

/** Cot trai: danh sach bai viet (hoac thong bao trong). */
export default function BlogPostList({
  posts,
  topic,
}: {
  posts: BlogPost[];
  topic: string;
}) {
  if (posts.length === 0) {
    return (
      <div className={styles.card}>
        <p className={styles.text}>{topic ? L.emptyTopic : L.empty}</p>
        {topic && (
          <Link href={BLOG.listHref} className={styles.box}>
            {L.seeAll}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      {posts.map((p) => (
        <FeedCard
          key={p._id}
          href={BLOG.postHref(p.slug)}
          tacGia={p.author?.name || L.anonymous}
          authorAvatar={p.author?.avatar || null}
          verified={p.author?.role === "admin" || p.author?.role === "instructor"}
          tieuDe={p.title}
          moTa={p.excerpt}
          luu={{ loai: "baiViet", id: p._id }}
          anh={p.thumbnail ? { src: p.thumbnail, alt: p.title } : null}
          meta={
            <>
              {p.tags.slice(0, 1).map((t) => (
                <span key={t} className={styles.label}>
                  {t}
                </span>
              ))}
              <span>{relativeTime(p.createdAt)}</span>
              <span aria-hidden className={styles.label2}>
                &middot;
              </span>
              <span>{L.readMinutes(readingMinutes(p.excerpt))}</span>
            </>
          }
        />
      ))}
    </div>
  );
}
