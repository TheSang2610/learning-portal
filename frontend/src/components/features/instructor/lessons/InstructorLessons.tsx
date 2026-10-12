"use client";

import { Suspense } from "react";

import { INSTRUCTOR_LESSONS as C } from "@/src/constants/instructor/lessons-page";

import { useInstructorLessons } from "./hooks/useInstructorLessons";
import LessonRowItem from "./parts/LessonRowItem";
import LessonsHeader from "./parts/LessonsHeader";
import styles from "./InstructorLessons.module.scss";

function InstructorLessonsContent() {
  const l = useInstructorLessons();

  if (l.loading) return <div className={styles.box}>{C.loading}</div>;

  return (
    <div className={styles.container}>
      <LessonsHeader courseId={l.courseId} courseTitle={l.courseTitle} />

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
                <LessonRowItem
                  key={lesson._id}
                  courseId={l.courseId}
                  lesson={lesson}
                  index={index}
                  quiz={l.quizOfLesson(lesson._id)}
                  onDelete={l.handleDeleteLesson}
                  onToggleQuiz={l.handleTogglePublishQuiz}
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
 * Trang /instructor/lessons?courseId=...
 *
 * useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
 * Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
 */
export default function InstructorLessons() {
  return (
    <Suspense
      fallback={
        <div className={styles.row3}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <InstructorLessonsContent />
    </Suspense>
  );
}
