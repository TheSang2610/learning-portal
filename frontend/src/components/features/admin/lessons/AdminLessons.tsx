"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

import { ADMIN_LESSONS as C } from "@/src/constants/admin/lessons-page";
import { useCourseLessons } from "@/src/hooks/useCourseLessons";

import AdminLessonRow from "./parts/AdminLessonRow";
import styles from "./AdminLessons.module.scss";

function AdminLessonsContent() {
  const params = useSearchParams();
  const courseId = params.get("courseId") || "";
  const l = useCourseLessons(courseId, C.messages);

  if (l.loading) return <div className={styles.box}>{C.loading}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.col}>
        <div>
          <Link href={C.courseDetailHref(courseId)} className={styles.box2}>
            <ArrowLeft size={16} /> {C.header.back}
          </Link>
          <h1 className={styles.title}>{C.header.title}</h1>
          <p className={styles.text}>
            {C.header.courseLabel} <span className={styles.label}>{l.courseTitle}</span>
          </p>
        </div>

        <Link href={C.lessonCreateHref(courseId)} className={styles.card}>
          <Plus size={16} /> {C.header.addLesson}
        </Link>
      </div>

      <div className={styles.card2}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {C.columns.map((col, i) => (
                <th
                  key={col}
                  className={
                    i === C.columns.length - 1 ? styles.headCell2 : styles.headCell
                  }
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {l.lessons.length > 0 ? (
              l.lessons.map((lesson, index) => (
                <AdminLessonRow
                  key={lesson._id}
                  courseId={courseId}
                  lesson={lesson}
                  index={index}
                  quiz={l.quizOfLesson(lesson._id)}
                  onDeleteLesson={l.handleDeleteLesson}
                  onToggleQuiz={l.handleTogglePublishQuiz}
                  onDeleteQuiz={l.handleDeleteQuiz}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className={styles.cell5}>
                  {C.empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Trang /admin/lessons?courseId=...
 *
 * useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
 * Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
 */
export default function AdminLessons() {
  return (
    <Suspense
      fallback={
        <div className={styles.row3}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <AdminLessonsContent />
    </Suspense>
  );
}
