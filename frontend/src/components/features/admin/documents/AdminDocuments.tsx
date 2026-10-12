"use client";

import { FileText, Loader2 } from "lucide-react";

import { ADMIN_DOCUMENTS as C } from "@/src/constants/admin/documents-page";

import { useAdminDocuments } from "./hooks/useAdminDocuments";
import DeleteDocumentDialog from "./parts/DeleteDocumentDialog";
import DocumentRow from "./parts/DocumentRow";
import DocumentsToolbar from "./parts/DocumentsToolbar";
import styles from "./AdminDocuments.module.scss";

/** Trang /admin/documents - toan bo tai lieu nguoi dung chia se. */
export default function AdminDocuments() {
  const s = useAdminDocuments();
  const K = C.columns;

  return (
    <div className={styles.page}>
      <DocumentsToolbar s={s} />

      {s.loading ? (
        <div className={styles.trong}>
          <Loader2 size={22} className={styles.quay} />
          {C.loading}
        </div>
      ) : s.danhSach.length === 0 ? (
        <div className={styles.trong}>
          <FileText size={22} />
          {s.tuKhoa ? C.emptyFiltered(s.tuKhoa) : C.empty}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.bang}>
            <thead>
              <tr>
                <th>{K.doc}</th>
                <th>{K.subjects}</th>
                <th>{K.uploader}</th>
                <th>{K.date}</th>
                <th className={styles.phai}>{K.downloads}</th>
                <th className={styles.phai}>{K.actions}</th>
              </tr>
            </thead>
            <tbody>
              {s.danhSach.map((d) => (
                <DocumentRow key={d._id} d={d} s={s} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {s.totalPages > 1 && (
        <div className={styles.phanTrang}>
          <button
            type="button"
            onClick={() => s.setPage((t) => Math.max(1, t - 1))}
            disabled={s.trang <= 1}
            className={styles.pageButton}
          >
            {C.pager.prev}
          </button>
          <span className={styles.pageCount}>{C.pager.info(s.trang, s.totalPages)}</span>
          <button
            type="button"
            onClick={() => s.setPage((t) => Math.min(s.totalPages, t + 1))}
            disabled={s.trang >= s.totalPages}
            className={styles.pageButton}
          >
            {C.pager.next}
          </button>
        </div>
      )}

      <DeleteDocumentDialog s={s} />
    </div>
  );
}
