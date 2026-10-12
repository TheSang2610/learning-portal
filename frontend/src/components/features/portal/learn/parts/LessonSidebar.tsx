import { CheckCircle, Clock, Lock } from "lucide-react";

import { LEARN } from "@/src/constants/portal/learn-page";
import type { Lesson } from "@/src/services/lesson.api";

import type { CourseLearnState } from "../hooks/useCourseLearn";
import styles from "../CourseLearn.module.scss";

const S = LEARN.sidebar;

/* VIEW PHẢI: MENU DANH SÁCH BÀI HỌC (Nền Trắng) */
export default function LessonSidebar({ s }: { s: CourseLearnState }) {
  const lessons = s.course?.lessons;

  return (
    <div className={styles.col7}>
      <div className={styles.row2}>
        <h3 className={styles.subheading}>{S.title}</h3>
        <span className={styles.label4}>{S.count(lessons?.length || 0)}</span>
      </div>

      <div className={styles.scroller2}>
        {lessons && lessons.length > 0 ? (
          [...(lessons as Lesson[])]
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((lesson, index: number) => {
              const isCurrent = s.activeLesson?._id === lesson._id;
              const isCompleted = s.checkLessonCompleted(lesson._id);

              return (
                <button
                  key={lesson._id || index}
                  onClick={() => s.handleSelectLesson(lesson)}
                  className={`group ${styles.button8} ${
                    isCurrent ? styles.button6 : styles.button7
                  }`}
                >
                  <div className={styles.box19}>
                    {lesson.biKhoa ? (
                      <Lock size={15} className={styles.box14} />
                    ) : isCompleted ? (
                      <CheckCircle size={16} className={styles.box20} />
                    ) : (
                      <div
                        className={`${styles.box24} ${isCurrent ? styles.box21 : styles.box22} ${styles.row8}`}
                      >
                        {index + 1}
                      </div>
                    )}
                  </div>

                  <div className={styles.box23}>
                    <span
                      className={`${styles.label7} ${isCurrent ? styles.label5 : styles.label6}`}
                    >
                      {lesson.title}
                    </span>
                    <div className={styles.row6}>
                      <div className={styles.row7}>
                        <Clock size={10} />
                        <span>
                          {lesson.duration ? S.minutes(lesson.duration) : S.video}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
        ) : (
          <p className={styles.text10}>{S.empty}</p>
        )}
      </div>
    </div>
  );
}
