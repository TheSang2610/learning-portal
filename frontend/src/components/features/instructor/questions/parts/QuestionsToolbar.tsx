import { MessageCircleQuestion } from "lucide-react";

import { INSTRUCTOR_QUESTIONS as C } from "@/src/constants/instructor/questions-page";

import styles from "../InstructorQuestions.module.scss";

interface QuestionsToolbarProps {
  loading: boolean;
  tatCa: boolean;
  tong: number;
  onAll: (v: boolean) => void;
}

/** Tieu de, dong tom tat so cau va hai tab Cho tra loi / Tat ca. */
export default function QuestionsToolbar({
  loading,
  tatCa: all,
  tong: total,
  onAll,
}: QuestionsToolbarProps) {
  return (
    <>
      <div className={styles.row}>
        <MessageCircleQuestion size={22} className={styles.box} />
        <h1 className={styles.title}>{C.title}</h1>
      </div>

      <p className={styles.text}>
        {loading
          ? C.summary.loading
          : all
            ? C.summary.all(total)
            : C.summary.pending(total)}
      </p>

      <div className={styles.row2}>
        <button
          type="button"
          onClick={() => onAll(false)}
          className={`${styles.button6} ${!all ? styles.button : styles.button2}`}
        >
          {C.tabs.pending}
        </button>
        <button
          type="button"
          onClick={() => onAll(true)}
          className={`${styles.button6} ${all ? styles.button : styles.button2}`}
        >
          {C.tabs.all}
        </button>
      </div>
    </>
  );
}
