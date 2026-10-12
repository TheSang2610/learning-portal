import { ADMIN_DOCUMENTS as C } from "@/src/constants/admin/documents-page";

import type { AdminDocumentsState } from "../hooks/useAdminDocuments";
import styles from "../AdminDocuments.module.scss";

/**
 * Hoi lai truoc khi xoa. Xoa tai lieu la KHONG LAY LAI DUOC: ban ghi mat
 * va file tren Cloudinary cung bi go (xem deleteDocument).
 */
export default function DeleteDocumentDialog({ s }: { s: AdminDocumentsState }) {
  const D = C.deleteDialog;
  if (!s.pendingDelete) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tieu-de-xoa"
    >
      <div className={styles.dialog}>
        <h2 id="tieu-de-xoa" className={styles.titleBox}>
          {D.title}
        </h2>
        <p className={styles.textBox}>
          <strong>{s.pendingDelete.title}</strong>
          {D.body}
        </p>
        <div className={styles.buttonBox}>
          <button
            type="button"
            onClick={() => s.setPendingDelete(null)}
            className={styles.cancelButton}
          >
            {D.cancel}
          </button>
          <button
            type="button"
            onClick={s.confirmDelete}
            disabled={s.deleting !== null}
            className={styles.confirmButton}
          >
            {s.deleting ? D.deleting : D.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
