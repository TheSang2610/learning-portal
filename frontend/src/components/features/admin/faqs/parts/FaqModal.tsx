import { Loader2, X } from "lucide-react";

import { ADMIN_FAQS as C } from "@/src/constants/admin/faqs-page";
import type { FaqManager } from "@/src/hooks/useFaqManager";

import styles from "../AdminFaqs.module.scss";

/** Hop them / sua cau hoi, tieu de kem ten khu vuc. */
export default function FaqModal({ m, areaName }: { m: FaqManager; areaName?: string }) {
  return (
    <div className={`${styles.showPaste} ${styles.overlay}`}>
      <div className={`${styles.expand} ${styles.card6}`}>
        <div className={styles.row4}>
          <h4 className={styles.minorHeading2}>
            {m.editingId ? C.modal.editTitle : C.modal.createTitle} · {areaName}
          </h4>
          <button onClick={m.closeModal} className={styles.button4}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={m.handleSubmit} className={styles.form}>
          <div>
            <label className={styles.fieldLabel}>
              {C.modal.question} <span className={styles.label3}>{C.modal.required}</span>
            </label>
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
            <label className={styles.fieldLabel}>
              {C.modal.answer} <span className={styles.label3}>{C.modal.required}</span>
            </label>
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
