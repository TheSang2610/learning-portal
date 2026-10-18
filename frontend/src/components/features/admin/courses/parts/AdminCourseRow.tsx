import Link from "next/link";
import { BookOpen, HelpCircle, Pencil, Trash2, Video } from "lucide-react";

import { Badge, Button, buttonClass } from "@/src/components/admin-ui";
import SafeImage from "@/src/components/ui/SafeImage";
import { COURSE_LEVEL_LABELS } from "@/src/constants/course-level";
import { ADMIN_COURSES as C } from "@/src/constants/admin/courses-page";
import { formatVnd } from "@/src/lib/format";
import type { Course } from "@/src/services/course";

import styles from "../AdminCourses.module.scss";

interface AdminCourseRowProps {
  course: Course;
  deleting: boolean;
  onDelete: (courseId: string, courseTitle: string) => void;
}

/** Mot dong khoa hoc: anh + ten, cap do, hoc phi, trang thai, thao tac (nut bieu tuong). */
export default function AdminCourseRow({
  course,
  deleting,
  onDelete,
}: AdminCourseRowProps) {
  const price = course.price ?? 0;
  const id = course._id ?? "";
  const provider =
    course.provider && typeof course.provider === "object" ? course.provider.name : null;

  return (
    <tr>
      <td>
        <div className={styles.courseCell}>
          <span className={styles.thumb}>
            {course.thumbnail ? (
              <SafeImage
                src={course.thumbnail}
                alt=""
                fill
                sizes="56px"
                className={styles.thumbImage}
                hideOnError
              />
            ) : (
              <BookOpen size={16} aria-hidden />
            )}
          </span>
          <span className={styles.courseText}>
            <Link href={C.detailHref(id)} className={styles.courseTitle}>
              {course.title}
            </Link>
            {provider && <span className={styles.courseSub}>{provider}</span>}
          </span>
        </div>
      </td>
      <td className={styles.nowrap}>
        {COURSE_LEVEL_LABELS[String(course.level).toLowerCase()] ?? course.level}
      </td>
      <td className={styles.nowrap}>{price === 0 ? C.free : formatVnd(price)}</td>
      <td>
        <Badge tone={course.isPublished ? "success" : "neutral"}>
          {course.isPublished ? C.published : C.draft}
        </Badge>
      </td>
      <td>
        <div className={styles.actions}>
          <Link
            href={C.lessonsHref(id)}
            className={buttonClass("ghost", "icon")}
            title={C.actions.lessons}
            aria-label={`${C.actions.lessons}: ${course.title}`}
          >
            <Video size={16} />
          </Link>
          <Link
            href={C.faqsHref(id)}
            className={buttonClass("ghost", "icon")}
            title={C.actions.faqs}
            aria-label={`${C.actions.faqs}: ${course.title}`}
          >
            <HelpCircle size={16} />
          </Link>
          <Link
            href={C.detailHref(id)}
            className={buttonClass("ghost", "icon")}
            title={C.actions.edit}
            aria-label={`${C.actions.edit}: ${course.title}`}
          >
            <Pencil size={16} />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            disabled={deleting}
            onClick={() => onDelete(id, course.title)}
            title={deleting ? C.actions.deleting : C.actions.delete}
            aria-label={`${C.actions.delete}: ${course.title}`}
            className={styles.danger}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </td>
    </tr>
  );
}
