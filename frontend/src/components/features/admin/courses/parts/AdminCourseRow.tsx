import Link from "next/link";
import { Edit, HelpCircle, Trash2, Video } from "lucide-react";

import { ADMIN_COURSES as C } from "@/src/constants/admin/courses-page";
import { formatVnd } from "@/src/lib/format";
import type { Course } from "@/src/services/course";

import styles from "../AdminCourses.module.scss";

interface AdminCourseRowProps {
  course: Course;
  deleting: boolean;
  onDelete: (courseId: string, courseTitle: string) => void;
}

/** Mot dong khoa hoc: ten, cap do, gia, trang thai va cac thao tac. */
export default function AdminCourseRow({
  course,
  deleting,
  onDelete,
}: AdminCourseRowProps) {
  const price = course.price ?? 0;
  const href = (build: (id: string) => string) => (course._id ? build(course._id) : "#");

  return (
    <tr className={styles.row2}>
      <td className={styles.cell}>{course.title}</td>
      <td className={styles.cell2}>
        <span className={styles.label}>{course.level}</span>
      </td>
      <td className={styles.cell3}>
        {price === 0 ? <span className={styles.label2}>{C.free}</span> : formatVnd(price)}
      </td>
      <td className={styles.cell4}>
        <span
          className={`${styles.label5} ${course.isPublished ? styles.label3 : styles.label4}`}
        >
          {course.isPublished ? C.published : C.draft}
        </span>
      </td>

      <td className={styles.cell5}>
        <Link href={href(C.lessonsHref)} className={styles.box4}>
          <Video size={13} /> {C.actions.lessons}
        </Link>

        <Link href={href(C.faqsHref)} className={styles.box5}>
          <HelpCircle size={13} /> {C.actions.faqs}
        </Link>

        <Link href={href(C.detailHref)} className={styles.box6}>
          <Edit size={13} /> {C.actions.edit}
        </Link>

        <button
          type="button"
          disabled={deleting}
          onClick={() => onDelete(course._id!, course.title)}
          className={styles.button}
        >
          <Trash2 size={13} />
          {deleting ? C.actions.deleting : C.actions.delete}
        </button>
      </td>
    </tr>
  );
}
