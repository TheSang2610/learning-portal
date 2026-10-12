import Link from "next/link";
import { Plus } from "lucide-react";

import { INSTRUCTOR_COURSES as C } from "@/src/constants/instructor/courses-page";

import styles from "../InstructorCourses.module.scss";

export default function CoursesHeader() {
  return (
    <div className={styles.row2}>
      <div>
        <h3 className={styles.subheading}>{C.header.title}</h3>
        <p className={styles.text}>{C.header.subtitle}</p>
      </div>
      <Link href={C.createHref} className={styles.card}>
        <Plus size={18} />
        {C.header.create}
      </Link>
    </div>
  );
}
