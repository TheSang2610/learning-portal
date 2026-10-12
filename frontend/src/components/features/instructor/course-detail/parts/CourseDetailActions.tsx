import Link from "next/link";
import { Video } from "lucide-react";

import { INSTRUCTOR_COURSE_DETAIL as C } from "@/src/constants/instructor/course-detail-page";

import styles from "../InstructorCourseDetail.module.scss";

/** Nut luu + loi sang trang quan ly bai hoc cua khoa. */
export default function CourseDetailActions({ courseId }: { courseId: string }) {
  return (
    <div className={styles.col2}>
      <button type="submit" className={styles.button3}>
        {C.actions.save}
      </button>

      <Link href={C.lessonsHref(courseId)} className={styles.card6}>
        <Video size={14} /> {C.actions.lessons}
      </Link>
    </div>
  );
}
