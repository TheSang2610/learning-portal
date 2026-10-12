import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import {
  QUIZ_EDIT as C,
  QUIZ_EDIT_ROLE,
  type QuizEditRole,
} from "@/src/constants/shared/quiz-edit-page";

import styles from "../QuizEdit.module.scss";

interface QuizEditIntroProps {
  role: QuizEditRole;
  courseId: string;
}

/** Banner che do giang vien (chi giang vien) + nut quay lai + tieu de. */
export default function QuizEditIntro({ role, courseId }: QuizEditIntroProps) {
  const cfg = QUIZ_EDIT_ROLE[role];

  return (
    <>
      {cfg.notice && (
        <div className={styles.card}>
          <AlertCircle size={18} className={styles.box2} />
          <div className={styles.box3}>
            <p className={styles.text}>{cfg.notice.title}</p>
            <p className={styles.text2}>{cfg.notice.text}</p>
          </div>
        </div>
      )}

      <div>
        <Link href={cfg.lessonsHref(courseId)} className={styles.box4}>
          <ArrowLeft size={14} /> {C.header.back}
        </Link>
        <h1 className={styles.title}>{C.header.title}</h1>
      </div>
    </>
  );
}
