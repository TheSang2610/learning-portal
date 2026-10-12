import { AlertCircle, CheckCircle, Download, FileText, Search, X } from "lucide-react";

import { ADMIN_DOCUMENTS as C } from "@/src/constants/admin/documents-page";

import type { AdminDocumentsState } from "../hooks/useAdminDocuments";
import styles from "../AdminDocuments.module.scss";

/** Tieu de + so lieu, o tim, thong bao loi / thanh cong. */
export default function DocumentsToolbar({ s }: { s: AdminDocumentsState }) {
  return (
    <>
      <header className={styles.top}>
        <div>
          <h1 className={styles.title}>{C.title}</h1>
          <p className={styles.sub}>{C.subtitle}</p>
        </div>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <FileText size={15} />
            {C.stats.total(s.tong)}
          </span>
          {/* Noi ro "trang nay": con so chi cong tu 20 dong dang hien, khong
              phai tong ca kho. Ghi tron "luot tai" la mot con so sai. */}
          <span className={styles.stat}>
            <Download size={15} />
            {C.stats.downloads(s.tongLuotTai)}
          </span>
          {/* Chi hien khi co: day la viec admin can lam, khong phai so lieu. */}
          {s.missingSubjectCount > 0 && (
            <span className={`${styles.stat} ${styles.statCanh}`}>
              <AlertCircle size={15} />
              {C.stats.noSubject(s.missingSubjectCount)}
            </span>
          )}
        </div>
      </header>

      <form onSubmit={s.search} className={styles.searchBox}>
        <Search size={16} className={styles.searchIcon} />
        <input
          value={s.searchInput}
          onChange={(e) => s.setSearchInput(e.target.value)}
          placeholder={C.search.placeholder}
          className={styles.searchInput}
        />
        {s.tuKhoa && (
          <button
            type="button"
            onClick={s.clearSearch}
            className={styles.clearSearch}
            aria-label={C.search.clearAria}
          >
            <X size={15} />
          </button>
        )}
        <button type="submit" className={styles.searchButton}>
          {C.search.submit}
        </button>
      </form>

      {s.loi && (
        <div className={styles.errorTable}>
          <AlertCircle size={16} />
          {s.loi}
        </div>
      )}
      {s.showSuccess && (
        <div className={styles.bangOk}>
          <CheckCircle size={16} />
          {s.showSuccess}
          <button
            type="button"
            onClick={s.closeNotice}
            aria-label={C.closeAria}
            className={styles.rows}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </>
  );
}
