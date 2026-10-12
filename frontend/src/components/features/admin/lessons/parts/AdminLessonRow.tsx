import Link from "next/link";
import {
  CheckCircle2,
  Edit2,
  FileQuestion,
  Plus,
  Trash2,
  Video,
  XCircle,
} from "lucide-react";

import { ADMIN_LESSONS as C } from "@/src/constants/admin/lessons-page";
import type { Quiz } from "@/src/services/quizService";
import type { LessonRow } from "@/src/types/lesson";

import styles from "../AdminLessons.module.scss";

interface AdminLessonRowProps {
  courseId: string;
  lesson: LessonRow;
  index: number;
  quiz: Quiz | undefined;
  onDeleteLesson: (lessonId: string) => void;
  onToggleQuiz: (quizId: string) => void;
  onDeleteQuiz: (quizId: string) => void;
}

/** Mot bai hoc: ten, thoi luong, trang thai quiz, thao tac quiz va bai hoc. */
export default function AdminLessonRow({
  courseId,
  lesson,
  index,
  quiz,
  onDeleteLesson,
  onToggleQuiz,
  onDeleteQuiz,
}: AdminLessonRowProps) {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <span className={styles.label2}>#{index + 1}</span>
        <div className={styles.box3}>
          <Video size={16} />
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
              <FileQuestion size={12} />
              {quiz.isPublished ? C.row.quizPublished : C.row.quizDraft}
            </span>
            <span className={styles.label6}>
              {C.row.questions(quiz.questions?.length || 0)}
            </span>
          </div>
        ) : (
          <span className={styles.label7}>{C.row.noQuiz}</span>
        )}
      </td>

      <td className={styles.cell4}>
        {!quiz ? (
          <Link href={C.quizCreateHref(courseId, lesson._id)} className={styles.box4}>
            <Plus size={12} /> {C.row.addQuiz}
          </Link>
        ) : (
          <>
            <Link href={C.quizEditHref(courseId, lesson._id)} className={styles.box5}>
              <Edit2 size={12} /> {C.row.editQuiz}
            </Link>

            <button
              type="button"
              onClick={() => onToggleQuiz(quiz._id)}
              className={`${styles.button5} ${quiz.isPublished ? styles.button : styles.button2}`}
            >
              {quiz.isPublished ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
              {quiz.isPublished ? C.row.hideQuiz : C.row.showQuiz}
            </button>

            <button
              type="button"
              onClick={() => onDeleteQuiz(quiz._id)}
              className={styles.button3}
            >
              <Trash2 size={12} /> {C.row.deleteQuiz}
            </button>
          </>
        )}

        {/* Vach chia giua thao tac quiz va thao tac bai hoc */}
        <span className={styles.label8}>{C.row.separator}</span>

        <Link href={C.lessonDetailHref(courseId, lesson._id)} className={styles.box6}>
          {C.row.editLesson}
        </Link>
        <button onClick={() => onDeleteLesson(lesson._id)} className={styles.button4}>
          {C.row.deleteLesson}
        </button>
      </td>
    </tr>
  );
}
