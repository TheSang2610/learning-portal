"use client";

import { Suspense } from "react";

import { ADMIN_LESSON_DETAIL as C } from "@/src/constants/admin/lesson-detail-page";

import { useAdminLessonDetail } from "./hooks/useAdminLessonDetail";
import VideoSourceField from "./parts/VideoSourceField";
import styles from "./AdminLessonDetail.module.scss";

function AdminLessonDetailContent() {
  const s = useAdminLessonDetail();
  const busy = s.submitting || s.deleting;

  if (s.loading) {
    return <div className={styles.box}>{C.loading}</div>;
  }

  return (
    <div className={styles.container}>
      <button onClick={s.backToCourse} className={styles.button}>
        {C.back}
      </button>

      <div className={styles.card}>
        <div className={styles.row}>
          <div>
            <h1 className={styles.title}>{C.title}</h1>
            <p className={styles.text}>{C.subtitle}</p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={s.deleteHandler}
            className={styles.button2}
          >
            {s.deleting ? C.deleting : C.delete}
          </button>
        </div>

        <form onSubmit={s.saveHandler} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.box2}>
              <label className={styles.fieldLabel}>{C.fields.title}</label>
              <input
                type="text"
                value={s.title}
                onChange={(e) => s.setTitle(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.box3}>
              <label className={styles.fieldLabel}>{C.fields.order}</label>
              <input
                type="number"
                value={s.order}
                onChange={(e) => s.setOrder(Number(e.target.value))}
                className={styles.input}
                min={1}
                required
              />
            </div>
          </div>

          <VideoSourceField s={s} />

          <div>
            <label className={styles.fieldLabel}>{C.fields.content}</label>
            <textarea
              value={s.content}
              onChange={(e) => s.setContent(e.target.value)}
              rows={8}
              placeholder={C.fields.contentPlaceholder}
              className={styles.textarea}
            />
          </div>

          <div className={styles.row2}>
            <button
              type="button"
              disabled={busy}
              onClick={s.backToCourse}
              className={styles.button4}
            >
              {C.actions.cancel}
            </button>
            <button type="submit" disabled={busy} className={styles.button5}>
              {s.progress !== null
                ? C.actions.uploading(s.progress)
                : s.submitting
                  ? C.actions.saving
                  : C.actions.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Trang /admin/lesson-detail?courseId=...&lessonId=...
 *
 * useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
 * Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
 */
export default function AdminLessonDetail() {
  return (
    <Suspense
      fallback={
        <div className={styles.row3}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <AdminLessonDetailContent />
    </Suspense>
  );
}
