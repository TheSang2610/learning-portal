import { Building2, Check, Tag, User as UserIcon } from "lucide-react";

import { ADMIN_COURSE_CREATE as C } from "@/src/constants/admin/course-create-page";
import type { Category } from "@/src/services/categoryService";
import type { ProviderData } from "@/src/services/provider";
import type { User } from "@/src/services/userApi";
import type {
  AdminCourseCreateFormData,
  FieldChangeEvent,
} from "@/src/types/course-form";

import styles from "../AdminCourseCreate.module.scss";

interface AssignmentFieldsProps {
  formData: AdminCourseCreateFormData;
  providers: ProviderData[];
  instructors: User[];
  categories: Category[];
  onChange: (e: FieldChangeEvent) => void;
  onToggleCategory: (categoryId: string) => void;
}

/** Doi tac cap chung chi, giang vien phu trach va danh muc (chon nhieu). */
export default function AssignmentFields({
  formData,
  providers,
  instructors,
  categories,
  onChange,
  onToggleCategory,
}: AssignmentFieldsProps) {
  return (
    <>
      <div className={styles.box7}>
        <label className={styles.fieldLabel4}>
          <Building2 size={16} className={styles.box8} />
          {C.provider.label}
        </label>
        <select
          name="providerId"
          value={formData.providerId}
          onChange={onChange}
          className={styles.select2}
        >
          <option value="">{C.provider.none}</option>
          {providers.map((prov) => (
            <option key={prov._id} value={prov._id}>
              {prov.type === "university"
                ? C.provider.universityPrefix
                : C.provider.companyPrefix}{" "}
              {prov.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.box7}>
        <label className={styles.fieldLabel4}>
          <UserIcon size={16} className={styles.box3} />
          {C.instructor.label}
        </label>
        <select
          name="instructor"
          value={formData.instructor}
          onChange={onChange}
          className={styles.select2}
          required
        >
          <option value="">{C.instructor.none}</option>
          {instructors.map((ins) => (
            <option key={ins._id} value={ins._id}>
              {C.instructor.option(ins.name, ins.email)}
            </option>
          ))}
        </select>
        {instructors.length === 0 && (
          <p className={styles.text3}>{C.instructor.noneFound}</p>
        )}
      </div>

      <div className={styles.box7}>
        <label className={styles.fieldLabel5}>
          <Tag size={16} className={styles.box9} />
          {C.categories.label}
        </label>
        <div className={styles.card3}>
          {categories.map((cat) => {
            const active = formData.category.includes(cat._id);
            return (
              <button
                type="button"
                key={cat._id}
                onClick={() => onToggleCategory(cat._id)}
                className={`${styles.button5} ${active ? styles.button : styles.button2}`}
              >
                {cat.name}
                {active && <Check size={14} className={styles.box10} />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
