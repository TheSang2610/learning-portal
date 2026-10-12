import { AlertCircle, ArrowLeft } from "lucide-react";

import { INSTRUCTOR_LESSON_DETAIL as C } from "@/src/constants/instructor/lesson-detail-page";

import styles from "../InstructorLessonDetail.module.scss";

/** Banner che do giang vien + nut quay lai + tieu de. */
export default function LessonDetailIntro({ onBack }: { onBack: () => void }) {
  return (
    <>
      <div className={styles.card}>
        <AlertCircle size={18} className={styles.box2} />
        <div className={styles.box3}>
          <p className={styles.text}>{C.notice.title}</p>
          <p className={styles.text2}>{C.notice.text}</p>
        </div>
      </div>

      <div>
        <button onClick={onBack} className={styles.button}>
          <ArrowLeft size={16} /> {C.header.back}
        </button>
        <h1 className={styles.title}>{C.header.title}</h1>
        <p className={styles.text3}>{C.header.subtitle}</p>
      </div>
    </>
  );
}
