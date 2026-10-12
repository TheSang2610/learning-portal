"use client";

import { Suspense } from "react";

import {
  LESSON_CREATE_ROLE,
  type LessonCreateRole,
} from "@/src/constants/shared/lesson-create-page";

import { useLessonCreate } from "./hooks/useLessonCreate";
import LessonCreateActions from "./parts/LessonCreateActions";
import LessonCreateIntro from "./parts/LessonCreateIntro";
import LessonMediaFields from "./parts/LessonMediaFields";
import {
  LessonDescriptionField,
  LessonTimingFields,
  LessonTitleField,
} from "./parts/LessonTextFields";
import styles from "./LessonCreate.module.scss";

function LessonCreateContent({ role }: { role: LessonCreateRole }) {
  const f = useLessonCreate(role);

  return (
    <div className={styles.container}>
      <LessonCreateIntro role={role} courseId={f.courseId} />

      <div className={styles.card2}>
        <form onSubmit={f.submitHandler} className={styles.form}>
          <LessonTitleField formData={f.formData} onChange={f.changeHandler} />
          <LessonMediaFields
            videoSelectedNote={LESSON_CREATE_ROLE[role].videoSelectedNote}
            videoUrl={f.formData.videoUrl}
            documentUrl={f.formData.documentUrl}
            videoFile={f.videoFile}
            documentFile={f.documentFile}
            onChange={f.changeHandler}
            onVideoFile={f.setVideoFile}
            onDocumentFile={f.setDocumentFile}
          />
          <LessonTimingFields formData={f.formData} onChange={f.changeHandler} />
          <LessonDescriptionField formData={f.formData} onChange={f.changeHandler} />
          <LessonCreateActions
            role={role}
            courseId={f.courseId}
            submitting={f.submitting}
            progress={f.progress}
          />
        </form>
      </div>
    </div>
  );
}

/**
 * Trang them bai hoc /admin/lesson-create va /instructor/lesson-create (?courseId=...).
 *
 * useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
 * Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
 */
export default function LessonCreate({ role }: { role: LessonCreateRole }) {
  return (
    <Suspense
      fallback={
        <div className={styles.row3}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <LessonCreateContent role={role} />
    </Suspense>
  );
}
