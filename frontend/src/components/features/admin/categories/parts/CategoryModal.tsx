import { Loader2, X } from "lucide-react";

import { ADMIN_CATEGORIES as C } from "@/src/constants/admin/categories-page";

import styles from "../AdminCategories.module.scss";

interface CategoryModalProps {
  isEdit: boolean;
  name: string;
  icon: string;
  saving: boolean;
  formError: string;
  onName: (v: string) => void;
  onIcon: (v: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

/** Hop tao / sua danh muc (ten + icon; slug backend tu sinh). */
export default function CategoryModal({
  isEdit,
  name,
  icon,
  saving,
  formError,
  onName,
  onIcon,
  onClose,
  onSubmit,
}: CategoryModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card3}>
        <div className={styles.row6}>
          <h2 className={styles.heading}>
            {isEdit ? C.modal.editTitle : C.modal.createTitle}
          </h2>
          <button onClick={onClose} className={styles.button4}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} className={styles.form}>
          {formError && <div className={styles.card4}>{formError}</div>}

          <div>
            <label className={styles.fieldLabel}>{C.modal.name}</label>
            <input
              value={name}
              onChange={(e) => onName(e.target.value)}
              className={styles.input}
              placeholder={C.modal.namePlaceholder}
            />
            <p className={styles.text2}>{C.modal.slugHint}</p>
          </div>

          <div>
            <label className={styles.fieldLabel}>{C.modal.icon}</label>
            <input
              value={icon}
              onChange={(e) => onIcon(e.target.value)}
              className={styles.input}
              placeholder={C.modal.iconPlaceholder}
            />
          </div>

          <div className={styles.row7}>
            <button type="button" onClick={onClose} className={styles.button5}>
              {C.modal.cancel}
            </button>
            <button type="submit" disabled={saving} className={styles.button6}>
              {saving && <Loader2 size={14} className={styles.spinner2} />}
              {isEdit ? C.modal.save : C.modal.create}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
