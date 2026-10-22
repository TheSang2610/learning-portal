import { createElement } from "react";
import { Loader2, X } from "lucide-react";

import { ADMIN_CATEGORIES as C } from "@/src/constants/admin/categories-page";
import { CATEGORY_ICONS, categoryIcon } from "@/src/lib/category-icons";

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

function IconPicker({
  value,
  name,
  onChange,
}: {
  value: string;
  name: string;
  onChange: (v: string) => void;
}) {
  const known = CATEGORY_ICONS.some((i) => i.key === value);
  return (
    <div className={styles.iconGrid} role="radiogroup" aria-label={C.modal.icon}>
      <button
        type="button"
        role="radio"
        aria-checked={!known}
        onClick={() => onChange("")}
        className={!known ? styles.iconOptionActive : styles.iconOption}
        title={C.modal.iconAuto}
      >
        {/* Ve san bieu tuong se duoc doan tu ten dang go. */}
        {createElement(categoryIcon("", name), { size: 18 })}
        <span>{C.modal.iconAuto}</span>
      </button>
      {CATEGORY_ICONS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          onClick={() => onChange(key)}
          className={value === key ? styles.iconOptionActive : styles.iconOption}
          title={label}
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
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
            {/* Chon tu bang co dinh thay cho o chu tu do: go tay thi trang chu
                khong biet doi chu do ra bieu tuong nao. */}
            <IconPicker value={icon} name={name} onChange={onIcon} />
            <p className={styles.text2}>{C.modal.iconHint}</p>
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
