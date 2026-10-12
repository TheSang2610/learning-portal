import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";

import { INSTRUCTOR_COURSES as C } from "@/src/constants/instructor/courses-page";

import styles from "../InstructorCourses.module.scss";

/** Giang vien chua co khoa hoc nao. */
export default function CoursesEmpty() {
  return (
    <div className={styles.container}>
      <div className={styles.row3}>
        <BookOpen size={24} />
      </div>
      <h4 className={styles.minorHeading}>{C.empty.title}</h4>
      <p className={styles.text2}>{C.empty.text}</p>
      <Link href={C.createHref} className={styles.box}>
        {C.empty.action} <ChevronRight size={16} />
      </Link>
    </div>
  );
}
