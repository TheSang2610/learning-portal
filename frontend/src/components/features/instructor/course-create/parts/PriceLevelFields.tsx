import { INSTRUCTOR_COURSE_CREATE as C } from "@/src/constants/instructor/course-create-page";
import type { FieldChangeEvent } from "@/src/types/course-form";

import styles from "../InstructorCourseCreate.module.scss";

interface PriceLevelFieldsProps {
  price: number;
  level: string;
  onChange: (e: FieldChangeEvent) => void;
}

/** Gia ban va trinh do, xep hai cot. */
export default function PriceLevelFields({
  price,
  level,
  onChange,
}: PriceLevelFieldsProps) {
  return (
    <div className={styles.grid}>
      <div className={styles.stack}>
        <label className={styles.fieldLabel3}>{C.price.label}</label>
        <input
          type="number"
          required
          name="price"
          min="0"
          className={styles.input2}
          value={price}
          onChange={onChange}
        />
      </div>

      <div className={styles.stack}>
        <label className={styles.fieldLabel3}>{C.level.label}</label>
        <select name="level" className={styles.select} value={level} onChange={onChange}>
          {C.level.options.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
