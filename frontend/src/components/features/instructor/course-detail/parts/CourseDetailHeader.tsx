import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

import { INSTRUCTOR_COURSE_DETAIL as C } from "@/src/constants/instructor/course-detail-page";

import styles from "../InstructorCourseDetail.module.scss";

/**
 * Tieu de + trang thai (chi xem, giang vien khong tu doi duoc) + banner nhac
 * rang Admin moi la nguoi duyet cong khai.
 */
export default function CourseDetailHeader({ isPublished }: { isPublished: boolean }) {
  return (
    <>
      <div className={styles.col}>
        <div>
          <Link href={C.backHref} className={styles.box2}>
            <ArrowLeft size={16} /> {C.header.back}
          </Link>
          <h1 className={styles.title}>{C.header.title}</h1>
        </div>

        <div className={styles.card}>
          {C.header.statusLabel}{" "}
          <span className={isPublished ? styles.label : styles.label2}>
            {isPublished ? C.header.published : C.header.draft}
          </span>
        </div>
      </div>

      <div className={styles.card2}>
        <AlertTriangle size={16} className={styles.box3} />
        <span>
          {C.notice.before}
          <strong>{C.notice.strong}</strong>
          {C.notice.after}
        </span>
      </div>
    </>
  );
}
