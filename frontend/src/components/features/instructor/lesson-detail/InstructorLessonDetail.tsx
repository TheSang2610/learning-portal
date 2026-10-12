"use client";

import { Suspense } from "react";

import { INSTRUCTOR_LESSON_DETAIL as C } from "@/src/constants/instructor/lesson-detail-page";

import { useInstructorLessonDetail } from "./hooks/useInstructorLessonDetail";
import LessonDetailIntro from "./parts/LessonDetailIntro";
import LessonEditForm from "./parts/LessonEditForm";
import LessonInfoBar from "./parts/LessonInfoBar";
import styles from "./InstructorLessonDetail.module.scss";

function InstructorLessonDetailContent() {
  const l = useInstructorLessonDetail();
  const busy = l.submitting || l.deleting;

  if (l.loading) {
    return <div className={styles.box}>{C.loading}</div>;
  }

  return (
    <div className={styles.container}>
      <LessonDetailIntro onBack={l.backToLessons} />

      <div className={styles.card2}>
        <LessonInfoBar
          lessonId={l.lessonId}
          busy={busy}
          deleting={l.deleting}
          onDelete={l.deleteHandler}
        />
        <LessonEditForm
          title={l.title}
          content={l.content}
          videoUrl={l.videoUrl}
          privateVideo={l.privateVideo}
          order={l.order}
          submitting={l.submitting}
          busy={busy}
          onTitle={l.setTitle}
          onContent={l.setContent}
          onVideoUrl={l.setVideoUrl}
          onOrder={l.setOrder}
          onCancel={l.backToLessons}
          onSubmit={l.saveHandler}
        />
      </div>
    </div>
  );
}

/**
 * Trang /instructor/lesson-detail?courseId=...&lessonId=...
 *
 * useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
 * Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
 */
export default function InstructorLessonDetail() {
  return (
    <Suspense
      fallback={
        <div className={styles.row2}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <InstructorLessonDetailContent />
    </Suspense>
  );
}
