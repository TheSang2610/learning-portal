import { INSTRUCTOR_COURSE_CREATE as C } from "@/src/constants/instructor/course-create-page";
import type { FieldChangeEvent } from "@/src/types/course-form";

import styles from "../InstructorCourseCreate.module.scss";

interface DescriptionFieldProps {
  value: string;
  onChange: (e: FieldChangeEvent) => void;
}

export default function DescriptionField({ value, onChange }: DescriptionFieldProps) {
  return (
    <div className={styles.stack}>
      <label className={styles.fieldLabel3}>{C.description.label}</label>
      <textarea
        rows={4}
        name="description"
        placeholder={C.description.placeholder}
        className={styles.input2}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
