import { AlertCircle, Edit3, HelpCircle, Loader2, Trash2 } from "lucide-react";

import { ADMIN_FAQS as C } from "@/src/constants/admin/faqs-page";
import type { FaqManager } from "@/src/hooks/useFaqManager";

import styles from "../AdminFaqs.module.scss";

/** Dang tai / loi / rong / danh sach FAQ cua khu vuc dang chon. */
export default function FaqList({ m }: { m: FaqManager }) {
  if (m.isLoading) {
    return (
      <div className={styles.card2}>
        <Loader2 className={styles.spinner} size={32} />
        <p className={styles.label}>{C.loading}</p>
      </div>
    );
  }

  if (m.error) {
    return (
      <div className={styles.card3}>
        <AlertCircle size={32} />
        <p className={styles.text2}>{C.errorTitle}</p>
        <p className={styles.text3}>{m.error}</p>
      </div>
    );
  }

  if (m.faqs.length === 0) {
    return (
      <div className={styles.card4}>
        <HelpCircle className={styles.box3} size={48} />
        <p className={styles.text4}>{C.emptyTitle}</p>
        <p className={styles.text5}>{C.emptyHint}</p>
      </div>
    );
  }

  return (
    <div className={styles.stack2}>
      {m.faqs.map((faq, index) => (
        <div key={faq._id} className={`group ${styles.card5}`}>
          <div className={styles.stack3}>
            <div className={styles.row2}>
              <span className={styles.label2}>{C.questionPrefix(index + 1)}</span>
              <h4 className={styles.minorHeading}>{faq.question}</h4>
            </div>
            <div className={styles.box4}>{faq.answer}</div>
          </div>

          <div className={styles.row3}>
            <button
              onClick={() => m.openEdit(faq)}
              className={styles.button2}
              title={C.editTitle}
            >
              <Edit3 size={18} />
            </button>
            <button
              onClick={() => m.handleDelete(faq._id!)}
              className={styles.button3}
              title={C.deleteTitle}
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
