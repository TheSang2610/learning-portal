import { Check, Layers, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

import { ICONS } from "@/src/components/features/portal/share-document/parts/DocumentCategories";
import { ADMIN_DOCUMENT_SUBJECTS as C } from "@/src/constants/admin/document-subjects-page";

import type { DocumentCatalogState } from "../hooks/useDocumentCatalog";
import styles from "../AdminDocumentSubjects.module.scss";
import SubjectChips from "./SubjectChips";

/**
 * Linh vuc: them (ten + cac nganh thuoc no), sua ten va danh sach nganh, xoa.
 *
 * Truoc day o them co mot o chon bieu tuong ghi "Sach", "Lap trinh", "Kinh
 * doanh"... - nhin nhu danh sach nganh nen bi hieu nham, va khong co cho nao
 * nhap nganh cho linh vuc. Gio bo o bieu tuong (linh vuc moi tu doan theo ten,
 * linh vuc cu giu nguyen), thay bang o nhap nganh dang the.
 */
export default function CategorySection({
  s,
  hideHeading = false,
}: {
  s: DocumentCatalogState;
  /** Trang da co tieu de rieng (PageHeader) thi an tieu de muc. */
  hideHeading?: boolean;
}) {
  const K = C.categories;

  return (
    <>
      {!hideHeading && (
        <h2 className={styles.muc}>
          <Layers size={18} />
          {K.heading}
        </h2>
      )}
      <form onSubmit={s.addGroup} className={styles.addCard}>
        <div className={styles.addRow}>
          <input
            value={s.newGroupName}
            onChange={(e) => s.setNewGroupName(e.target.value)}
            maxLength={K.maxLength}
            placeholder={K.placeholder}
            aria-label={K.nameAria}
            className={styles.o}
          />
          <button
            type="submit"
            disabled={s.addingGroup || !s.newGroupName.trim()}
            className={styles.primaryButton}
          >
            {s.addingGroup ? (
              <Loader2 size={15} className={styles.quay} />
            ) : (
              <Plus size={15} />
            )}
            {K.add}
          </button>
        </div>
        <p className={styles.fieldLabel}>{K.subjects}</p>
        <SubjectChips
          value={s.newGroupSubjects}
          onChange={s.setNewGroupSubjects}
          suggestions={s.allSubjectNames}
        />
        <p className={styles.hint}>{K.subjectsHint}</p>
      </form>

      {!s.loading && s.groupList.length > 0 && (
        <ul className={styles.ds}>
          {s.groupList.map((n) => {
            const icon = ICONS[n.bieuTuong] ?? ICONS.sach;
            const editing = s.editGroup === n._id;
            const subjects = s.subjectsOf(n._id);
            return (
              <li key={n._id} className={styles.groupRow}>
                <span className={styles.bieuTuong} aria-hidden>
                  <icon.Icon size={16} />
                </span>

                {editing ? (
                  <div className={styles.groupBody}>
                    <input
                      value={s.editGroupName}
                      onChange={(e) => s.setEditGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") s.setEditGroup(null);
                      }}
                      maxLength={K.maxLength}
                      autoFocus
                      aria-label={C.newNameAria(n.ten)}
                      className={styles.o}
                    />
                    <p className={styles.fieldLabel}>{K.subjects}</p>
                    <SubjectChips
                      value={s.editGroupSubjects}
                      onChange={s.setEditGroupSubjects}
                      suggestions={s.allSubjectNames}
                    />
                    <p className={styles.hint}>{K.subjectsHint}</p>
                    <div className={styles.editActions}>
                      <button
                        type="button"
                        onClick={() => s.setEditGroup(null)}
                        disabled={s.savingGroup}
                        className={styles.secondaryButton}
                      >
                        <X size={15} />
                        {K.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={() => s.saveGroup(n)}
                        disabled={s.savingGroup || !s.editGroupName.trim()}
                        className={styles.primaryButton}
                      >
                        {s.savingGroup ? (
                          <Loader2 size={15} className={styles.quay} />
                        ) : (
                          <Check size={15} />
                        )}
                        {K.save}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.groupBody}>
                      <div className={styles.groupHead}>
                        <span className={styles.ten}>{n.ten}</span>
                        <span className={styles.so}>{K.count(n.soMon, n.soTaiLieu)}</span>
                      </div>
                      {subjects.length > 0 ? (
                        <ul className={styles.subjectTags}>
                          {subjects.map((m) => (
                            <li key={m._id}>{m.ten}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className={styles.hint}>{K.noSubjects}</p>
                      )}
                    </div>
                    <div className={styles.actions}>
                      <button
                        type="button"
                        onClick={() => s.startEditGroup(n)}
                        className={styles.iconButton}
                        title={K.editTitle}
                        aria-label={C.renameAria(n.ten)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => s.deleteGroup(n)}
                        className={styles.deleteButton}
                        title={K.deleteTitle}
                        aria-label={C.deleteAria(n.ten)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
