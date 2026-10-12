"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { INSTRUCTOR_QUIZ_STATS as C } from "@/src/constants/instructor/quiz-stats-page";

import { useInstructorQuizStats } from "./hooks/useInstructorQuizStats";
import RetryModal from "./parts/RetryModal";
import StatsOverview from "./parts/StatsOverview";
import SubmittedTable from "./parts/SubmittedTable";
import UnsubmittedTable from "./parts/UnsubmittedTable";
import styles from "./InstructorQuizStats.module.scss";

function InstructorQuizStatsContent() {
  const s = useInstructorQuizStats();

  if (!s.quizId) {
    return <div className={styles.box}>{C.missingQuiz}</div>;
  }

  if (s.loading) {
    return (
      <div className={styles.col}>
        <Loader2 className={styles.spinner} size={28} />
        <p className={styles.text}>{C.loading}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <StatsOverview
        stats={s.stats}
        activeTab={s.activeTab}
        onTab={s.setActiveTab}
        onBack={s.backToLessons}
      />

      {s.activeTab === "submitted" && (
        <SubmittedTable list={s.stats?.submittedList} onRetry={s.openRetryModal} />
      )}

      {s.activeTab === "unsubmitted" && (
        <UnsubmittedTable list={s.stats?.unsubmittedList} />
      )}

      {s.selectedStudent && (
        <RetryModal
          studentName={s.selectedStudent.name}
          reason={s.retryReason}
          busy={s.submittingId !== null}
          onReason={s.setRetryReason}
          onCancel={s.closeRetryModal}
          onConfirm={s.handleConfirmRetry}
        />
      )}
    </div>
  );
}

/**
 * Trang /instructor/quiz-stats?courseId=...&lessonId=...&quizId=...
 *
 * useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
 * Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
 */
export default function InstructorQuizStats() {
  return (
    <Suspense
      fallback={
        <div className={styles.row6}>
          <div className={styles.spinner3} />
        </div>
      }
    >
      <InstructorQuizStatsContent />
    </Suspense>
  );
}
