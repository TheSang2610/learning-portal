"use client";

import { Suspense } from "react";
import { Save } from "lucide-react";

import {
  QUIZ_EDIT as C,
  QUIZ_EDIT_ROLE,
  type QuizEditRole,
} from "@/src/constants/shared/quiz-edit-page";

import { useQuizEdit } from "./hooks/useQuizEdit";
import QuizEditConfig from "./parts/QuizEditConfig";
import QuizEditIntro from "./parts/QuizEditIntro";
import QuizEditQuestions from "./parts/QuizEditQuestions";
import styles from "./QuizEdit.module.scss";

function QuizEditContent({ role }: { role: QuizEditRole }) {
  const q = useQuizEdit(role);

  if (q.loading) return <div className={styles.box}>{C.loading}</div>;

  return (
    <div
      className={`${styles.container} ${QUIZ_EDIT_ROLE[role].roomy ? styles.containerRoomy : ""}`}
    >
      <QuizEditIntro role={role} courseId={q.courseId} />

      <form onSubmit={q.handleFormSubmit} className={styles.form}>
        <QuizEditConfig config={q.quizConfig} onChange={q.setQuizConfig} />
        <QuizEditQuestions editor={q.editor} />

        <div className={styles.row3}>
          <button type="submit" disabled={q.submitting} className={styles.button4}>
            <Save size={14} /> {q.submitting ? C.submit.busy : C.submit.idle}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Trang sua quiz /admin/quiz-edit va /instructor/quiz-edit
 * (?courseId=...&lessonId=...).
 *
 * useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
 * Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
 */
export default function QuizEdit({ role }: { role: QuizEditRole }) {
  return (
    <Suspense
      fallback={
        <div className={styles.row4}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <QuizEditContent role={role} />
    </Suspense>
  );
}
