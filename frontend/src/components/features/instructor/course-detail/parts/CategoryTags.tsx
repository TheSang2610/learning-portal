import { Check, Tag } from "lucide-react";

import { INSTRUCTOR_COURSE_DETAIL as C } from "@/src/constants/instructor/course-detail-page";
import type { Category } from "@/src/services/categoryService";

import styles from "../InstructorCourseDetail.module.scss";

interface CategoryTagsProps {
  categories: Category[];
  selected: string[];
  onToggle: (categoryId: string) => void;
}

export default function CategoryTags({
  categories,
  selected,
  onToggle,
}: CategoryTagsProps) {
  return (
    <div className={styles.box8}>
      <label className={styles.fieldLabel4}>
        <Tag size={14} className={styles.box9} /> {C.categories.label}
      </label>
      <div className={styles.card5}>
        {categories.map((cat) => {
          const active = selected.includes(cat._id);
          return (
            <button
              type="button"
              key={cat._id}
              onClick={() => onToggle(cat._id)}
              className={`${styles.button4} ${active ? styles.button : styles.button2}`}
            >
              {cat.name} {active && <Check size={12} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
