import { ArrowLeft, Award } from "lucide-react";

import { LEARN } from "@/src/constants/portal/learn-page";
import type { Course } from "@/src/services/course";
import type { ProgressStats } from "@/src/services/enrollment.api";

import styles from "../CourseLearn.module.scss";

// course.instructor khi la ObjectId dang chuoi, khi la doi tuong da populate.
// Chi lay duoc ten o truong hop thu hai.
const getInstructorName = (c: Course | null): string | undefined =>
  c && typeof c.instructor === "object" ? c.instructor.name : undefined;

interface LearnHeaderProps {
  course: Course;
  progress: ProgressStats | null;
  onBack: () => void;
}

/* HEADER SÁNG */
export default function LearnHeader({ course, progress, onBack }: LearnHeaderProps) {
  const H = LEARN.header;

  return (
    <header className={styles.header}>
      <div className={styles.row4}>
        {/* xem=1 bao trang gioi thieu dung day nguoc lai vao day. Khoa mien
            phi da ghi danh mac dinh nhay thang vao bai hoc, thieu tham so nay
            thi bam Quay lai se bi nem tro ve chinh trang nay. */}
        <button onClick={onBack} className={styles.button2}>
          <ArrowLeft size={18} />
        </button>
        <div className={styles.box13}>
          <h1 className={styles.title}>{course?.title}</h1>
          <p className={styles.text3}>
            {H.instructor}
            <span className={styles.label}>
              {getInstructorName(course) || H.instructorFallback}
            </span>
          </p>
        </div>
      </div>

      {/* Khung Tiến độ nổi bật */}
      <div className={styles.card4}>
        <Award size={16} className={styles.box14} />
        <div className={styles.box15}>
          <span className={styles.label2}>
            {H.progress(progress?.progressPercentage || 0)}
          </span>
          <span className={styles.label3}>
            {H.done(progress?.completedLessons || 0, course?.lessons?.length || 0)}
          </span>
        </div>
      </div>
    </header>
  );
}
