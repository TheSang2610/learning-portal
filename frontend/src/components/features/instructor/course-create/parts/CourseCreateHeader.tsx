import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { INSTRUCTOR_COURSE_CREATE as C } from "@/src/constants/instructor/course-create-page";

import styles from "../InstructorCourseCreate.module.scss";

/** Nut quay lai danh sach + tieu de buoc 1. */
export default function CourseCreateHeader() {
  return (
    <div className={styles.row}>
      <Link href={C.backHref} className={styles.card}>
        <ArrowLeft size={18} />
      </Link>
      <div>
        <h3 className={styles.subheading}>{C.header.title}</h3>
        <p className={styles.text}>{C.header.subtitle}</p>
      </div>
    </div>
  );
}
