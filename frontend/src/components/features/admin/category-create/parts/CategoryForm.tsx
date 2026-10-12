import { ADMIN_CATEGORY_CREATE as C } from "@/src/constants/admin/category-create-page";

import styles from "../AdminCategoryCreate.module.scss";

interface CategoryFormProps {
  name: string;
  slug: string;
  submitting: boolean;
  onName: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSlug: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CategoryForm({
  name,
  slug,
  submitting,
  onName,
  onSlug,
  onSubmit,
}: CategoryFormProps) {
  return (
    <div className={styles.card}>
      <form onSubmit={onSubmit} className={styles.form}>
        <div>
          <label className={styles.fieldLabel}>{C.name.label}</label>
          <input
            type="text"
            placeholder={C.name.placeholder}
            value={name}
            onChange={onName}
            className={styles.input}
            required
          />
        </div>

        <div>
          <label className={styles.fieldLabel}>{C.slug.label}</label>
          <input
            type="text"
            placeholder={C.slug.placeholder}
            value={slug}
            onChange={onSlug}
            className={styles.input}
            required
          />
        </div>

        <button type="submit" disabled={submitting} className={styles.button2}>
          {submitting ? C.submit.busy : C.submit.idle}
        </button>
      </form>
    </div>
  );
}
