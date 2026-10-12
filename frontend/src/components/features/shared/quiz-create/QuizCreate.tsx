"use client";

import { Suspense } from "react";
import { Save } from "lucide-react";

import {
  QUIZ_CREATE as C,
  QUIZ_CREATE_ROLE,
  type QuizCreateRole,
} from "@/src/constants/shared/quiz-create-page";

import { useQuizCreate } from "./hooks/useQuizCreate";
import QuestionsSection from "./parts/QuestionsSection";
import QuizConfigSection from "./parts/QuizConfigSection";
import QuizCreateIntro from "./parts/QuizCreateIntro";
import styles from "./QuizCreate.module.scss";

function QuizCreateContent({ role }: { role: QuizCreateRole }) {
  const q = useQuizCreate(role);

  return (
    <div
      className={`${styles.container} ${QUIZ_CREATE_ROLE[role].roomy ? styles.containerRoomy : ""}`}
    >
      <QuizCreateIntro role={role} courseId={q.courseId} />

      <form onSubmit={q.handleFormSubmit} className={styles.form}>
        <QuizConfigSection
          config={q.quizConfig}
          lessons={q.lessons}
          onChange={q.setQuizConfig}
        />
        <QuestionsSection editor={q.editor} />

        <div className={styles.row5}>
          <button type="submit" disabled={q.submitting} className={styles.button4}>
            <Save size={14} /> {q.submitting ? C.submit.busy : C.submit.idle}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Trang soan quiz moi /admin/quiz-create va /instructor/quiz-create
 * (?courseId=...&lessonId=...).
 *
 * useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
 * Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
 */
export default function QuizCreate({ role }: { role: QuizCreateRole }) {
  return (
    <Suspense
      fallback={
        <div className={styles.row6}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <QuizCreateContent role={role} />
    </Suspense>
  );
}
