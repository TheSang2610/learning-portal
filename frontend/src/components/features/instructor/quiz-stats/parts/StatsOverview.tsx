import { ArrowLeft } from "lucide-react";

import { INSTRUCTOR_QUIZ_STATS as C } from "@/src/constants/instructor/quiz-stats-page";
import type { QuizStats } from "@/src/services/quizService";

import type { StatsTab } from "../hooks/useInstructorQuizStats";
import styles from "../InstructorQuizStats.module.scss";

interface StatsOverviewProps {
  stats: QuizStats | null;
  activeTab: StatsTab;
  onTab: (tab: StatsTab) => void;
  onBack: () => void;
}

/** Nut quay lai, tieu de, 4 the so lieu va thanh tab. */
export default function StatsOverview({
  stats,
  activeTab,
  onTab,
  onBack,
}: StatsOverviewProps) {
  const submitted = stats?.submittedList?.length || 0;
  const notSubmitted = stats?.unsubmittedList?.length || 0;

  return (
    <>
      <div>
        <button onClick={onBack} className={styles.button}>
          <ArrowLeft size={16} /> {C.header.back}
        </button>
        <span className={styles.label}>{C.header.eyebrow}</span>
        <h1 className={styles.title}>
          {C.header.title(stats?.title || C.header.titleFallback)}
        </h1>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.text2}>{C.summary.submitted}</p>
          <p className={styles.text3}>{submitted}</p>
        </div>
        <div className={styles.card}>
          <p className={styles.text2}>{C.summary.average}</p>
          <p className={styles.text4}>{stats?.averageScore || 0}%</p>
        </div>
        <div className={styles.card}>
          <p className={styles.text2}>{C.summary.passRate}</p>
          <p className={styles.text5}>{stats?.passRate || 0}%</p>
        </div>
        <div className={styles.card}>
          <p className={styles.text2}>{C.summary.unsubmitted}</p>
          <p className={styles.text6}>{notSubmitted}</p>
        </div>
      </div>

      <div className={styles.row}>
        <button
          onClick={() => onTab("submitted")}
          className={`${styles.button9} ${activeTab === "submitted" ? styles.button2 : styles.button3}`}
        >
          {C.tabs.submitted(submitted)}
        </button>
        <button
          onClick={() => onTab("unsubmitted")}
          className={`${styles.button9} ${activeTab === "unsubmitted" ? styles.button4 : styles.button3}`}
        >
          {C.tabs.unsubmitted(notSubmitted)}
        </button>
      </div>
    </>
  );
}
