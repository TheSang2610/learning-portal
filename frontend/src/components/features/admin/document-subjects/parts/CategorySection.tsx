import { Check, Layers, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";

import { ICONS } from "@/src/components/features/portal/share-document/parts/DocumentCategories";
import { ADMIN_DOCUMENT_SUBJECTS as C } from "@/src/constants/admin/document-subjects-page";
import type { FieldIcon } from "@/src/services/document";

import type { DocumentCatalogState } from "../hooks/useDocumentCatalog";
import styles from "../AdminDocumentSubjects.module.scss";

const DS_BIEU_TUONG = Object.entries(ICONS) as [FieldIcon, (typeof ICONS)[FieldIcon]][];

function BieuTuongOptions() {
  return (
    <>
      {DS_BIEU_TUONG.map(([k, v]) => (
        <option key={k} value={k}>
          {v.nhan}
        </option>
      ))}
    </>
  );
}

/** Linh vuc: them (ten + bieu tuong), doi ten, doi bieu tuong, xoa. */
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
      <form onSubmit={s.addGroup} className={styles.them}>
        <input
          value={s.newGroupName}
          onChange={(e) => s.setNewGroupName(e.target.value)}
          maxLength={K.maxLength}
          placeholder={K.placeholder}
          aria-label={K.nameAria}
          className={styles.o}
        />
        <select
          value={s.newIcon}
          onChange={(e) => s.setNewIcon(e.target.value as FieldIcon)}
          aria-label={K.iconAria}
          className={styles.selectInput}
        >
          <BieuTuongOptions />
        </select>
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
      </form>

      {!s.loading && s.groupList.length > 0 && (
        <ul className={styles.ds}>
          {s.groupList.map((n) => {
            const icon = ICONS[n.bieuTuong] ?? ICONS.sach;
            return (
              <li key={n._id} className={styles.dong1}>
                <span className={styles.bieuTuong} aria-hidden>
                  <icon.Icon size={16} />
                </span>
                {s.editGroup === n._id ? (
                  <div className={styles.sua}>
                    <input
                      value={s.editGroupName}
                      onChange={(e) => s.setEditGroupName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") s.updateGroup(n, { ten: s.editGroupName });
                        if (e.key === "Escape") s.setEditGroup(null);
                      }}
                      maxLength={K.maxLength}
                      autoFocus
                      aria-label={C.newNameAria(n.ten)}
                      className={styles.o}
                    />
                    <button
                      type="button"
                      onClick={() => s.updateGroup(n, { ten: s.editGroupName })}
                      className={styles.iconButton}
                      aria-label={C.saveNameAria}
                    >
                      <Check size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => s.setEditGroup(null)}
                      className={styles.iconButton}
                      aria-label={C.cancelAria}
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className={styles.ten}>{n.ten}</span>
                    <span className={styles.so}>{K.count(n.soMon, n.soTaiLieu)}</span>
                    <div className={styles.actions}>
                      <select
                        value={n.bieuTuong}
                        onChange={(e) =>
                          s.updateGroup(n, {
                            bieuTuong: e.target.value as FieldIcon,
                          })
                        }
                        aria-label={K.iconOfAria(n.ten)}
                        className={styles.smallSelect}
                      >
                        <BieuTuongOptions />
                      </select>
                      <button
                        type="button"
                        onClick={() => s.startEditGroup(n)}
                        className={styles.iconButton}
                        title={C.renameTitle}
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
