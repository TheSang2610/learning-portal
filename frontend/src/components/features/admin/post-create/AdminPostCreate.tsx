"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { ADMIN_POST_CREATE as C } from "@/src/constants/admin/post-create-page";

import { usePostEditor } from "./hooks/usePostEditor";
import PostEditorHeader from "./parts/PostEditorHeader";
import PostMainFields from "./parts/PostMainFields";
import PostSidebar from "./parts/PostSidebar";
import styles from "./AdminPostCreate.module.scss";

function AdminPostEditor() {
  const s = usePostEditor();

  if (s.loadingPost) {
    return (
      <div className={styles.card}>
        <Loader2 className={styles.spinner} size={32} />
        <p className={styles.text}>{C.opening}</p>
      </div>
    );
  }

  return (
    <form onSubmit={s.luu} className={styles.form}>
      <PostEditorHeader s={s} />

      <div className={styles.grid}>
        <PostMainFields s={s} />
        <PostSidebar s={s} />
      </div>
    </form>
  );
}

/**
 * Trang /admin/post-create (viet moi) va /admin/post-create?id=... (sua).
 *
 * useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
 */
export default function AdminPostCreate() {
  return (
    <Suspense
      fallback={
        <div className={styles.row3}>
          <div className={styles.spinner3} />
        </div>
      }
    >
      <AdminPostEditor />
    </Suspense>
  );
}
