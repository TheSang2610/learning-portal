import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import {
  QUIZ_CREATE as C,
  QUIZ_CREATE_ROLE,
  type QuizCreateRole,
} from "@/src/constants/shared/quiz-create-page";

import styles from "../QuizCreate.module.scss";

interface QuizCreateIntroProps {
  role: QuizCreateRole;
  courseId: string;
}

/** Banner che do giang vien (chi giang vien) + nut quay lai + tieu de. */
export default function QuizCreateIntro({ role, courseId }: QuizCreateIntroProps) {
  const cfg = QUIZ_CREATE_ROLE[role];

  return (
    <>
      {cfg.notice && (
        <div className={styles.card}>
          <AlertCircle size={18} className={styles.box} />
          <div className={styles.box2}>
            <p className={styles.text}>{cfg.notice.title}</p>
            <p className={styles.text2}>{cfg.notice.text}</p>
          </div>
        </div>
      )}

      <div className={styles.row}>
        <div>
          <Link href={cfg.lessonsHref(courseId)} className={styles.box3}>
            <ArrowLeft size={14} /> {C.header.back}
          </Link>
          <h1 className={styles.title}>{C.header.title}</h1>
        </div>
      </div>
    </>
  );
}
