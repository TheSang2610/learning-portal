import { Trash2 } from "lucide-react";

import { INSTRUCTOR_LESSON_DETAIL as C } from "@/src/constants/instructor/lesson-detail-page";

import styles from "../InstructorLessonDetail.module.scss";

interface LessonInfoBarProps {
  lessonId: string;
  busy: boolean;
  deleting: boolean;
  onDelete: () => void;
}

/** Ma bai hoc hien tai + nut xoa bai. */
export default function LessonInfoBar({
  lessonId,
  busy,
  deleting,
  onDelete,
}: LessonInfoBarProps) {
  return (
    <div className={styles.col}>
      <div>
        <h3 className={styles.subheading}>{C.info.title}</h3>
        <p className={styles.text4}>
          {C.info.idLabel} <span className={styles.label}>{lessonId}</span>
        </p>
      </div>

      <button type="button" disabled={busy} onClick={onDelete} className={styles.button2}>
        <Trash2 size={14} />
        {deleting ? C.info.deleting : C.info.delete}
      </button>
    </div>
  );
}
