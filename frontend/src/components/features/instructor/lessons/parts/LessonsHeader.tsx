import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

import { INSTRUCTOR_LESSONS as C } from "@/src/constants/instructor/lessons-page";

import styles from "../InstructorLessons.module.scss";

interface LessonsHeaderProps {
  courseId: string;
  courseTitle: string;
}

export default function LessonsHeader({ courseId, courseTitle }: LessonsHeaderProps) {
  return (
    <div className={styles.col}>
      <div>
        <Link href={C.courseDetailHref(courseId)} className={styles.box2}>
          <ArrowLeft size={16} /> {C.header.back}
        </Link>
        <h1 className={styles.title}>{C.header.title}</h1>
        <p className={styles.text}>
          {C.header.courseLabel} <span className={styles.label}>{courseTitle}</span>
        </p>
      </div>

      <Link href={C.lessonCreateHref(courseId)} className={styles.card}>
        <Plus size={16} /> {C.header.addLesson}
      </Link>
    </div>
  );
}
