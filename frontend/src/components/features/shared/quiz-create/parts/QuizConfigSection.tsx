import { QUIZ_CREATE as C } from "@/src/constants/shared/quiz-create-page";
import type { LessonOption, QuizConfigDraft } from "@/src/types/quiz-draft";

import styles from "../QuizCreate.module.scss";

interface QuizConfigSectionProps {
  config: QuizConfigDraft;
  lessons: LessonOption[];
  onChange: (next: QuizConfigDraft) => void;
}

/** Khoi 1: tieu de, bai hoc gan kem, thoi gian, diem dat, so luot, mo ta. */
export default function QuizConfigSection({
  config,
  lessons,
  onChange,
}: QuizConfigSectionProps) {
  return (
    <div className={styles.card2}>
      <h2 className={styles.heading}>{C.config.heading}</h2>

      <div className={styles.grid}>
        <div className={styles.box4}>
          <label className={styles.fieldLabel}>{C.config.title}</label>
          <input
            type="text"
            placeholder={C.config.titlePlaceholder}
            className={styles.input}
            value={config.title}
            onChange={(e) => onChange({ ...config, title: e.target.value })}
            required
          />
        </div>

        <div>
          <label className={styles.fieldLabel}>{C.config.lesson}</label>
          <select
            className={styles.select}
            value={config.lessonId}
            onChange={(e) => onChange({ ...config, lessonId: e.target.value })}
          >
            <option value="">{C.config.noLesson}</option>
            {lessons.map((l) => (
              <option key={l._id} value={l._id}>
                {l.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.grid2}>
          <div>
            <label className={styles.fieldLabel}>{C.config.timeLimit}</label>
            <input
              type="number"
              className={styles.input2}
              value={config.timeLimit}
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

        <div className={styles.box4}>
          <label className={styles.fieldLabel}>{C.config.description}</label>
          <textarea
            rows={2}
            placeholder={C.config.descriptionPlaceholder}
            className={styles.input2}
            value={config.description}
            onChange={(e) => onChange({ ...config, description: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
