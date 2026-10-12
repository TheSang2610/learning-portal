import { QUIZ_EDIT as C } from "@/src/constants/shared/quiz-edit-page";
import type { QuizConfigDraft } from "@/src/types/quiz-draft";

import styles from "../QuizEdit.module.scss";

interface QuizEditConfigProps {
  config: QuizConfigDraft;
  onChange: (next: QuizConfigDraft) => void;
}

/** Tieu de, thoi gian, diem dat va so luot lam. */
export default function QuizEditConfig({ config, onChange }: QuizEditConfigProps) {
  return (
    <div className={styles.card2}>
      <div>
        <label className={styles.fieldLabel}>{C.config.title}</label>
        <input
          type="text"
          className={styles.input}
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          required
        />
      </div>
      <div className={styles.grid}>
        <div>
          <label className={styles.fieldLabel}>{C.config.timeLimit}</label>
          <input
            type="number"
            className={styles.input2}
            value={config.timeLimit || ""}
            onChange={(e) => onChange({ ...config, timeLimit: Number(e.target.value) })}
          />
        </div>
        <div>
          <label className={styles.fieldLabel}>{C.config.passingScore}</label>
          <input
            type="number"
            className={styles.input2}
            value={config.passingScore}
            onChange={(e) =>
              onChange({ ...config, passingScore: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label className={styles.fieldLabel}>{C.config.attempts}</label>
          <input
            type="number"
            className={styles.input2}
            value={config.attempts}
            onChange={(e) => onChange({ ...config, attempts: Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
}
