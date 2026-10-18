import { Check, GraduationCap, Pencil, Plus, Trash2, X } from "lucide-react";

import { ADMIN_DOCUMENT_SUBJECTS as C } from "@/src/constants/admin/document-subjects-page";
import type { DocumentUniversity } from "@/src/services/document";

import type { DocumentCatalogState } from "../hooks/useDocumentCatalog";
import styles from "../AdminDocumentSubjects.module.scss";

/** Truong dai hoc: them, doi ten / logo, xoa. */
export default function UniversitySection({
  s,
  hideHeading = false,
}: {
  s: DocumentCatalogState;
  /** Trang da co tieu de rieng (PageHeader) thi an tieu de muc. */
  hideHeading?: boolean;
}) {
  const U = C.universities;

  const phim = (t: DocumentUniversity) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") s.renameSchool(t);
    if (e.key === "Escape") s.setEditSchool(null);
  };

  return (
    <>
      {!hideHeading && (
        <h2 className={styles.muc}>
          <GraduationCap size={18} />
          {U.heading}
        </h2>
      )}
      <form onSubmit={s.themTruong} className={styles.them}>
        <input
          value={s.newSchoolName}
          onChange={(e) => s.setNewSchoolName(e.target.value)}
          maxLength={U.maxLength}
          placeholder={U.placeholder}
          aria-label={U.nameAria}
          className={styles.o}
        />
        <button
          type="submit"
          disabled={!s.newSchoolName.trim()}
          className={styles.primaryButton}
        >
          <Plus size={15} />
          {U.add}
        </button>
      </form>
      {!s.loading && s.schoolList.length > 0 && (
        <ul className={styles.ds}>
          {s.schoolList.map((t) => (
            <li key={t._id} className={styles.dong1}>
              {s.suaTruong === t._id ? (
                <div className={styles.sua}>
                  <input
                    value={s.editSchoolName}
                    onChange={(e) => s.setEditSchoolName(e.target.value)}
                    onKeyDown={phim(t)}
                    maxLength={U.maxLength}
                    autoFocus
                    aria-label={C.newNameAria(t.ten)}
                    className={styles.o}
                  />
                  <input
                    value={s.editLogo}
                    onChange={(e) => s.setEditLogo(e.target.value)}
                    onKeyDown={phim(t)}
                    maxLength={U.logoMaxLength}
                    placeholder={U.logoPlaceholder}
                    aria-label={U.logoAria(t.ten)}
                    className={styles.o}
                  />
                  <button
                    type="button"
                    onClick={() => s.renameSchool(t)}
                    className={styles.iconButton}
                    aria-label={C.saveNameAria}
                  >
                    <Check size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => s.setEditSchool(null)}
                    className={styles.iconButton}
                    aria-label={C.cancelAria}
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <span className={styles.ten}>
                    {t.ten}
                    {t.logo && <span className={styles.hasLogo}>{U.hasLogo}</span>}
                  </span>
                  <span className={styles.so}>{U.count(t.soTaiLieu)}</span>
                  <div className={styles.actions}>
                    <button
                      type="button"
                      onClick={() => s.startEditSchool(t)}
                      className={styles.iconButton}
                      title={U.editTitle}
                      aria-label={C.renameAria(t.ten)}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => s.xoaTruong(t)}
                      className={styles.deleteButton}
                      title={U.deleteTitle}
                      aria-label={C.deleteAria(t.ten)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
