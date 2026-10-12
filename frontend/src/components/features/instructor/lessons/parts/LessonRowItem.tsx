import Link from "next/link";
import { BarChart2, FileQuestion, Video } from "lucide-react";

import { INSTRUCTOR_LESSONS as C } from "@/src/constants/instructor/lessons-page";
import type { Quiz } from "@/src/services/quizService";
import type { LessonRow } from "@/src/types/lesson";

import styles from "../InstructorLessons.module.scss";

interface LessonRowItemProps {
  courseId: string;
  lesson: LessonRow;
  index: number;
  quiz: Quiz | undefined;
  onDelete: (lessonId: string) => void;
  onToggleQuiz: (quizId: string) => void;
}

/** Mot dong bai hoc: ten, thoi luong, trang thai quiz va cac tac vu. */
export default function LessonRowItem({
  courseId,
  lesson,
  index,
  quiz,
  onDelete,
  onToggleQuiz,
}: LessonRowItemProps) {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <span className={styles.label2}>#{index + 1}</span>
        <div className={styles.box3}>
          <Video size={14} />
        </div>
        <span className={styles.label3}>{lesson.title}</span>
      </td>

      <td className={styles.cell2}>
        {lesson.duration
          ? `${Math.round(Number(lesson.duration) / 60)} ${C.row.minutes}`
          : C.row.noDuration}
      </td>

      <td className={styles.cell3}>
        {quiz ? (
          <div className={styles.row2}>
            <span
              className={`${styles.row4} ${quiz.isPublished ? styles.label4 : styles.label5}`}
            >
              <FileQuestion size={10} />
              {quiz.isPublished ? C.row.quizOpen : C.row.quizHidden}
            </span>
            <span className={styles.label6}>
              ({quiz.questions?.length || 0} {C.row.questions})
            </span>
          </div>
        ) : (
          <span className={styles.label7}>{C.row.noQuiz}</span>
        )}
      </td>

      <td className={styles.cell4}>
        {!quiz ? (
          <Link href={C.quizCreateHref(courseId, lesson._id)} className={styles.box4}>
            {C.row.addQuiz}
          </Link>
        ) : (
          <>
            <Link
              href={C.quizStatsHref(courseId, lesson._id, quiz._id)}
              className={styles.box5}
            >
              <BarChart2 size={12} /> {C.row.viewScores}
            </Link>

            <Link href={C.quizEditHref(courseId, lesson._id)} className={styles.box6}>
              {C.row.editQuiz}
            </Link>

            <button onClick={() => onToggleQuiz(quiz._id)} className={styles.button}>
              {quiz.isPublished ? C.row.hide : C.row.show}
            </button>
          </>
        )}

        <span className={styles.label8}>{C.row.separator}</span>

        <Link href={C.lessonDetailHref(courseId, lesson._id)} className={styles.box7}>
          {C.row.editLesson}
        </Link>
        <button onClick={() => onDelete(lesson._id)} className={styles.button2}>
          {C.row.deleteLesson}
        </button>
      </td>
    </tr>
  );
}
