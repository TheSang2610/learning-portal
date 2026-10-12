import { LEARN } from "@/src/constants/portal/learn-page";

import styles from "../CourseLearn.module.scss";

/** Khong vao duoc phong hoc (sai slug / chua dang ky). */
export default function LearnNotFound({ onHome }: { onHome: () => void }) {
  return (
    <div className={styles.col4}>
      <div className={styles.card3}>
        <p className={styles.text}>{LEARN.notFound.title}</p>
        <p className={styles.text2}>{LEARN.notFound.text}</p>
        <button onClick={onHome} className={styles.button}>
          {LEARN.notFound.home}
        </button>
      </div>
    </div>
  );
}
