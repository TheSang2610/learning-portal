import { Loader2, MessageSquare } from "lucide-react";

import { INSTRUCTOR_QUIZ_STATS as C } from "@/src/constants/instructor/quiz-stats-page";

import styles from "../InstructorQuizStats.module.scss";

interface RetryModalProps {
  studentName: string;
  reason: string;
  busy: boolean;
  onReason: (v: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Hop nhap ly do truoc khi cho hoc vien lam lai bai. */
export default function RetryModal({
  studentName,
  reason,
  busy,
  onReason,
  onCancel,
  onConfirm,
}: RetryModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={`${styles.showZoom} ${styles.card5}`}>
        <div className={styles.row4}>
          <div className={styles.card6}>
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className={styles.subheading}>{C.retryModal.title}</h3>
            <p className={styles.text10}>
              {C.retryModal.student} <span className={styles.label4}>{studentName}</span>
            </p>
          </div>
        </div>

        <div className={styles.stack}>
          <label className={styles.fieldLabel}>{C.retryModal.reason}</label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => onReason(e.target.value)}
            placeholder={C.retryModal.reasonPlaceholder}
            className={styles.textarea}
          />
        </div>

        <div className={styles.row5}>
          <button onClick={onCancel} className={styles.button7}>
            {C.retryModal.cancel}
          </button>
          <button onClick={onConfirm} disabled={busy} className={styles.button8}>
            {busy ? <Loader2 className={styles.spinner2} size={12} /> : null}
            {C.retryModal.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
