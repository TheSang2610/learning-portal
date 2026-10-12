import Link from "next/link";
import { Tag, User } from "lucide-react";

import SafeImage from "@/src/components/ui/SafeImage";
import { INSTRUCTOR_COURSES as C } from "@/src/constants/instructor/courses-page";
import { formatVnd } from "@/src/lib/format";
import { Course, topicName } from "@/src/services/course";

import styles from "../InstructorCourses.module.scss";

/** The mot khoa hoc trong luoi "Khoa hoc cua toi". */
export default function InstructorCourseCard({ course }: { course: Course }) {
  const price = course.price ?? 0;

  return (
    <div className={`group ${styles.card2}`}>
      <div className={styles.box2}>
        <SafeImage
          src={course.thumbnail || C.fallbackThumbnail}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={styles.box3}
        />
        <span
          className={`${styles.floating} ${
            course.isPublished ? styles.label : styles.label2
          }`}
        >
          {course.isPublished ? C.card.published : C.card.draft}
        </span>
      </div>

      <div className={styles.col}>
        <div className={styles.stack2}>
          <span className={styles.label3}>
            <Tag size={12} />
            {topicName(course.category)[0] || C.card.noCategory}
          </span>
          <h4 className={styles.minorHeading2}>{course.title}</h4>
          <p className={styles.text3}>{course.description || C.card.noDescription}</p>
        </div>

        <div className={styles.row4}>
          <span className={styles.row5}>
            <User size={14} className={styles.box4} />
            {course.studentsCount || 0} {C.card.students}
          </span>
          <span className={styles.label4}>
            {price === 0 ? C.card.free : formatVnd(price)}
          </span>
        </div>

        <Link href={C.detailHref(course._id)} className={styles.card3}>
          {C.card.edit}
        </Link>
      </div>
    </div>
  );
}
