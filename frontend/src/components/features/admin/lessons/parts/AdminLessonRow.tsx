import Link from "next/link";
import {
  CheckCircle2,
  FileQuestion,
  Pencil,
  Plus,
  Trash2,
  Video,
  XCircle,
} from "lucide-react";

import { ADMIN_LESSONS as C } from "@/src/constants/admin/lessons-page";
import type { Quiz } from "@/src/services/quizService";
import type { LessonRow } from "@/src/types/lesson";

import { formatDuration } from "./LessonPreview";
import styles from "../AdminLessons.module.scss";

interface AdminLessonRowProps {
  courseId: string;
  lesson: LessonRow;
  index: number;
  quiz: Quiz | undefined;
  onDeleteLesson: (lessonId: string) => void;
  onToggleQuiz: (quizId: string) => void;
  onDeleteQuiz: (quizId: string) => void;
  /** Mo cua so xem truoc bai (video + bai tap nhu hoc vien thay). */
  onPreview: () => void;
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
  onPreview,
}: AdminLessonRowProps) {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <span className={styles.label2}>#{index + 1}</span>
        {/* Ca cum bieu tuong + ten bai la mot nut: bam vao xem truoc bai. */}
        <button
          type="button"
          onClick={onPreview}
          className={styles.previewTrigger}
          title={C.preview.openHint}
        >
          <span className={styles.box3}>
            <Video size={16} />
          </span>
          <span className={styles.label3}>{lesson.title}</span>
        </button>
      </td>

      <td className={styles.cell2}>
        {/* duration la chuoi "12:30" trong model; cach cu chia cho 60 ra NaN. */}
        {formatDuration(lesson.duration) || C.row.noDuration}
      </td>

      <td className={styles.cell3}>
        {quiz ? (
          <div className={styles.row2}>
            <span
              className={`${styles.row4} ${quiz.isPublished ? styles.label4 : styles.label5}`}
            >
              <FileQuestion size={12} />
              <span>{quiz.isPublished ? C.row.quizPublished : C.row.quizDraft}</span>
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
            <Plus size={12} />
            <span>{C.row.addQuiz}</span>
          </Link>
        ) : (
          <>
            <Link href={C.quizEditHref(courseId, lesson._id)} className={styles.box5}>
              <Pencil size={12} />
              <span>{C.row.editQuiz}</span>
            </Link>

            <button
              type="button"
              onClick={() => onToggleQuiz(quiz._id)}
              className={`${styles.button5} ${quiz.isPublished ? styles.button : styles.button2}`}
            >
              {quiz.isPublished ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
              {/* Chu trong <span>: chi co svg la con thi DashboardShell coi la nut icon. */}
              <span>{quiz.isPublished ? C.row.hideQuiz : C.row.showQuiz}</span>
            </button>

            <button
              type="button"
              onClick={() => onDeleteQuiz(quiz._id)}
              className={styles.button3}
            >
              <Trash2 size={12} />
              <span>{C.row.deleteQuiz}</span>
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
