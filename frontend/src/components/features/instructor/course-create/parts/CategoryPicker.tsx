import { Check, Tag } from "lucide-react";

import { INSTRUCTOR_COURSE_CREATE as C } from "@/src/constants/instructor/course-create-page";
import type { Category } from "@/src/services/categoryService";

import styles from "../InstructorCourseCreate.module.scss";

interface CategoryPickerProps {
  categories: Category[];
  selected: string[];
  onToggle: (categoryId: string) => void;
}

/** Chon nhieu danh muc dang the (tag), bam lan nua de bo chon. */
export default function CategoryPicker({
  categories,
  selected,
  onToggle,
}: CategoryPickerProps) {
  return (
    <div className={styles.box7}>
      <label className={styles.fieldLabel5}>
        <Tag size={16} className={styles.box8} />
        {C.categories.label}
      </label>
      <div className={styles.card4}>
        {categories.map((cat) => {
          const active = selected.includes(cat._id);
          return (
            <button
              type="button"
              key={cat._id}
              onClick={() => onToggle(cat._id)}
              className={`${styles.button5} ${active ? styles.button : styles.button2}`}
            >
              {cat.name}
              {active && <Check size={14} className={styles.box9} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
