import { Check, Tag, User as UserIcon } from "lucide-react";

import { ADMIN_COURSE_DETAIL as C } from "@/src/constants/admin/course-detail-page";
import type { Category } from "@/src/services/categoryService";
import type { User } from "@/src/services/userApi";
import type { AdminCourseEditFormData, FieldChangeEvent } from "@/src/types/course-form";

import styles from "../AdminCourseDetail.module.scss";

interface InstructorCategoryFieldsProps {
  formData: AdminCourseEditFormData;
  isAdmin: boolean;
  instructors: User[];
  categories: Category[];
  onChange: (e: FieldChangeEvent) => void;
  onToggleCategory: (categoryId: string) => void;
}

/** Giang vien phu trach (chi admin doi) va danh muc chon nhieu. */
export default function InstructorCategoryFields({
  formData,
  isAdmin,
  instructors,
  categories,
  onChange,
  onToggleCategory,
}: InstructorCategoryFieldsProps) {
  return (
    <>
      <div className={styles.box8}>
        <label className={styles.fieldLabel4}>
          <UserIcon size={14} className={styles.box4} />
          {C.instructor.label}
        </label>
        <select
          name="instructorId"
          value={formData.instructorId}
          onChange={onChange}
          disabled={!isAdmin}
          className={styles.select3}
          required
        >
          <option value="">{C.instructor.none}</option>
          {instructors.map((ins) => (
            <option key={ins._id} value={ins._id}>
              {C.instructor.option(ins.name, ins.email)}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.box8}>
        <label className={styles.fieldLabel4}>
          <Tag size={14} className={styles.box9} />
          {C.categories}
        </label>
        <div className={styles.card5}>
          {categories.map((cat) => {
            const active = formData.category.includes(cat._id);
            return (
              <button
                type="button"
                key={cat._id}
                onClick={() => onToggleCategory(cat._id)}
                className={`${styles.button8} ${active ? styles.button4 : styles.button5}`}
              >
                {cat.name}
                {active && <Check size={12} />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
