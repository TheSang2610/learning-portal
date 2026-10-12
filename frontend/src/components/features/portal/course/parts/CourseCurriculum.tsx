import { CheckCircle } from "lucide-react";

import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";
import type { Course } from "@/src/services/course";
import type { Lesson } from "@/src/services/lesson.api";

import styles from "../CourseDetail.module.scss";

/* Tab 2: Curriculum */
export default function CourseCurriculum({ lessons }: { lessons: Course["lessons"] }) {
  const K = C.curriculum;

  return (
    <section id="curriculum" className={styles.section2}>
      <div className={styles.row9}>
        <h2 className={styles.heading}>{K.heading}</h2>
        <span className={styles.label4}>{K.count(lessons?.length || 0)}</span>
      </div>

      <div className={styles.box32}>
        {lessons && lessons.length > 0 ? (
          [...(lessons as Lesson[])]
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((lesson, index: number) => (
              <div key={lesson._id || index} className={`group ${styles.row10}`}>
                <div className={styles.row11}>
                  <span className={styles.label5}>{index + 1}</span>
                  <CheckCircle size={16} className={styles.box33} />
                  <span className={styles.label6}>{lesson.title}</span>
                </div>
                {lesson.videoUrl && <span className={styles.card5}>{K.video}</span>}
              </div>
            ))
        ) : (
          <p className={styles.text6}>{K.empty}</p>
        )}
      </div>
    </section>
  );
}
