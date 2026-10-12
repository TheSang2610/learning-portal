import { Loader2, X } from "lucide-react";

import { ADMIN_COURSE_FAQS as C } from "@/src/constants/admin/course-faqs-page";
import type { FaqManager } from "@/src/hooks/useFaqManager";

import styles from "../AdminCourseFaqs.module.scss";

/** Hop them / sua cau hoi cua khoa. */
export default function CourseFaqModal({ m }: { m: FaqManager }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card6}>
        <div className={styles.row4}>
          <h4 className={styles.minorHeading2}>
            {m.editingId ? C.modal.editTitle : C.modal.createTitle}
          </h4>
          <button onClick={m.closeModal} className={styles.button4}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={m.handleSubmit} className={styles.form}>
          <div>
            <label className={styles.fieldLabel}>{C.modal.question}</label>
            <input
              type="text"
              required
              value={m.question}
              onChange={(e) => m.setQuestion(e.target.value)}
              placeholder={C.modal.questionPlaceholder}
              className={styles.input}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>{C.modal.answer}</label>
            <textarea
              required
              rows={4}
              value={m.answer}
              onChange={(e) => m.setAnswer(e.target.value)}
              placeholder={C.modal.answerPlaceholder}
              className={styles.textarea}
            />
          </div>

          <div className={styles.row5}>
            <button type="button" onClick={m.closeModal} className={styles.button5}>
              {C.modal.cancel}
            </button>
            <button type="submit" disabled={m.isSubmitting} className={styles.button6}>
              {m.isSubmitting && <Loader2 className={styles.spinner2} size={16} />}
              {m.editingId ? C.modal.save : C.modal.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
