"use client";

import Link from "next/link";
import { AlertCircle, FileText, Loader2, Newspaper, Plus } from "lucide-react";

import { ADMIN_POSTS as C } from "@/src/constants/admin/posts-page";

import { useAdminPosts } from "./hooks/useAdminPosts";
import PostCard from "./parts/PostCard";
import PostFilters from "./parts/PostFilters";
import styles from "./AdminPosts.module.scss";

/** Trang /admin/posts - bai viet cam nang mon hoc (/blog). */
export default function AdminPosts() {
  const s = useAdminPosts();

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <div>
          <h3 className={styles.subheading}>
            <Newspaper className={styles.box} size={26} />
            {C.title}
          </h3>
          <p className={styles.text}>
            {C.intro.before}
            <code>{C.intro.code}</code>
            {C.intro.after}
          </p>
        </div>
        <Link href={C.createHref} className={styles.card}>
          <Plus size={18} />
          {C.create}
        </Link>
      </div>

      <PostFilters s={s} />

      {s.loading ? (
        <div className={styles.card3}>
          <Loader2 className={styles.spinner} size={32} />
          <p className={styles.text2}>{C.loading}</p>
        </div>
      ) : s.loi ? (
        <div className={styles.card4}>
          <AlertCircle size={32} />
          <p className={styles.text3}>{C.errorTitle}</p>
          <p className={styles.text4}>{s.loi}</p>
        </div>
      ) : s.posts.length === 0 ? (
        <div className={styles.card5}>
          <FileText className={styles.box3} size={48} />
          <p className={styles.text5}>
            {s.activeKeyword || s.status || s.topic ? C.emptyFiltered : C.empty}
          </p>
          <p className={styles.text6}>{C.emptyHint}</p>
        </div>
      ) : (
        <div className={styles.stack2}>
          {s.posts.map((p) => (
            <PostCard
              key={p._id}
              p={p}
              topicName={s.topicName(p.topic)}
              onDelete={s.xoa}
            />
          ))}
        </div>
      )}

      {s.totalPages > 1 && (
        <div className={styles.row6}>
          <button
            type="button"
            disabled={s.trang <= 1 || s.loading}
            onClick={() => s.goToPage(s.trang - 1)}
            className={styles.card7}
          >
            {C.pager.prev}
          </button>
          <span className={styles.label6}>{C.pager.info(s.trang, s.totalPages)}</span>
          <button
            type="button"
            disabled={s.trang >= s.totalPages || s.loading}
            onClick={() => s.goToPage(s.trang + 1)}
            className={styles.card7}
          >
            {C.pager.next}
          </button>
        </div>
      )}
    </div>
  );
}
