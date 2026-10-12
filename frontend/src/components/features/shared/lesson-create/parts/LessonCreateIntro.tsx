import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import {
  LESSON_CREATE as C,
  LESSON_CREATE_ROLE,
  type LessonCreateRole,
} from "@/src/constants/shared/lesson-create-page";

import styles from "../LessonCreate.module.scss";

interface LessonCreateIntroProps {
  role: LessonCreateRole;
  courseId: string;
}

/** Banner che do giang vien (chi giang vien) + tieu de trang. */
export default function LessonCreateIntro({ role, courseId }: LessonCreateIntroProps) {
  const cfg = LESSON_CREATE_ROLE[role];

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

      <div>
        <Link href={cfg.lessonsHref(courseId)} className={styles.box3}>
          <ArrowLeft size={16} /> {C.header.back}
        </Link>
        <h1 className={`${styles.title} ${cfg.largeTitle ? styles.titleLarge : ""}`}>
          {C.header.title}
        </h1>
        <p className={styles.text3}>{C.header.subtitle}</p>
      </div>
    </>
  );
}
