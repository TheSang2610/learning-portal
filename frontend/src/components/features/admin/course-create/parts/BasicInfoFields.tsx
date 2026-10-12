import { ADMIN_COURSE_CREATE as C } from "@/src/constants/admin/course-create-page";
import type {
  AdminCourseCreateFormData,
  FieldChangeEvent,
} from "@/src/types/course-form";

import styles from "../AdminCourseCreate.module.scss";

interface BasicInfoFieldsProps {
  formData: AdminCourseCreateFormData;
  onTitle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSlug: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: (e: FieldChangeEvent) => void;
}

/** Tieu de, slug, mo ta, gia va trinh do. */
export default function BasicInfoFields({
  formData,
  onTitle,
  onSlug,
  onChange,
}: BasicInfoFieldsProps) {
  return (
    <>
      <div>
        <label className={styles.fieldLabel3}>{C.courseTitle.label}</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onTitle}
          className={styles.input2}
          placeholder={C.courseTitle.placeholder}
          required
        />
      </div>

      <div>
        <label className={styles.fieldLabel3}>{C.slug.label}</label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={onSlug}
          className={styles.input3}
          required
        />
      </div>

      <div>
        <label className={styles.fieldLabel3}>{C.description.label}</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={4}
          className={styles.input2}
          placeholder={C.description.placeholder}
          required
        />
      </div>

      <div className={styles.grid}>
        <div>
          <label className={styles.fieldLabel3}>{C.price.label}</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={onChange}
            className={styles.input2}
            min={0}
            required
          />
        </div>

        <div>
          <label className={styles.fieldLabel3}>{C.level.label}</label>
          <select
            name="level"
            value={formData.level}
            onChange={onChange}
            className={styles.select}
          >
            {C.level.options.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
