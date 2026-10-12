import { CheckCircle, FileText } from "lucide-react";

import { LEARN } from "@/src/constants/portal/learn-page";
import type { Lesson } from "@/src/services/lesson.api";

import type { CourseLearnState } from "../hooks/useCourseLearn";
import styles from "../CourseLearn.module.scss";

const I = LEARN.info;

/* Chi tiết bài học dưới Video (Nền Trắng) */
export default function LessonInfo({
  s,
  lesson,
}: {
  s: CourseLearnState;
  lesson: Lesson;
}) {
  const done = s.checkLessonCompleted(lesson._id);

  return (
    <div className={styles.card6}>
      <div className={styles.stack5}>
        <div className={styles.row5}>
          <span className={styles.card7}>{I.ongoing}</span>
          {done && <span className={styles.card8}>{I.completed}</span>}
        </div>
        <h2 className={styles.heading}>{lesson.title}</h2>
        <p className={styles.text8}>{I.description}</p>
      </div>

      <div className={styles.col6}>
        {/* Video nhung chay trong iframe cua ben thu ba nen trang nay
            khong nhan duoc su kien "het video" nhu the <video> - thieu
            nut nay thi bai dung YouTube khong bao gio duoc tinh la
            xong, keo theo khong bao gio cap duoc chung nhan. */}
        {s.embedVideo && !done && (
          <button onClick={s.handleVideoEnded} className={styles.button4}>
            <CheckCircle size={16} />
            {I.markDone}
          </button>
        )}
        {s.currentQuiz && (
          <button onClick={() => s.setIsDoingQuiz(true)} className={styles.button5}>
            <FileText size={16} />
            {I.takeQuiz(s.currentQuiz.passingScore)}
          </button>
        )}
      </div>
    </div>
  );
}
