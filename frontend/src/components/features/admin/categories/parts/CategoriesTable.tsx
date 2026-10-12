import { Edit3, FolderOpen, Loader2, Trash2 } from "lucide-react";

import { ADMIN_CATEGORIES as C } from "@/src/constants/admin/categories-page";
import type { Category } from "@/src/services/categoryService";

import styles from "../AdminCategories.module.scss";

interface CategoriesTableProps {
  categories: Category[];
  loading: boolean;
  busyId: string | null;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
}

export default function CategoriesTable({
  categories,
  loading,
  busyId,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <div className={styles.card2}>
      <div className={styles.scroller}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.headCell}>{C.columns.name}</th>
              <th className={styles.headCell}>{C.columns.slug}</th>
              <th className={styles.headCell}>{C.columns.icon}</th>
              <th className={styles.headCell2}>{C.columns.actions}</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {loading ? (
              <tr>
                <td colSpan={4} className={styles.cell}>
                  <Loader2 size={20} className={styles.spinner} />
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.cell2}>
                  {C.empty}
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c._id} className={styles.row2}>
                  <td className={styles.headCell}>
                    <div className={styles.row3}>
                      <span className={styles.row4}>
                        <FolderOpen size={15} />
                      </span>
                      <span className={styles.label}>{c.name}</span>
                    </div>
                  </td>
                  <td className={styles.cell3}>{c.slug}</td>
                  <td className={styles.cell4}>{c.icon || C.noIcon}</td>
                  <td className={styles.headCell}>
                    <div className={styles.row5}>
                      <button
                        onClick={() => onEdit(c)}
                        title={C.edit}
                        className={styles.button2}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(c)}
                        disabled={busyId === c._id}
                        title={C.delete}
                        className={styles.button3}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
