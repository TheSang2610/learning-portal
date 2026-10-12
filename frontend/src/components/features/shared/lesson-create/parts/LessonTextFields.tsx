import { AlignLeft, Clock, FileText, ListOrdered } from "lucide-react";

import { LESSON_CREATE as C } from "@/src/constants/shared/lesson-create-page";
import type { LessonCreateFormData } from "@/src/types/lesson";

import styles from "../LessonCreate.module.scss";

type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

interface FieldProps {
  formData: LessonCreateFormData;
  onChange: (e: ChangeEvent) => void;
}

/** Ten bai hoc. */
export function LessonTitleField({ formData, onChange }: FieldProps) {
  return (
    <div>
      <label className={styles.row4}>
        <FileText size={14} className={styles.box4} /> {C.title.label}
      </label>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={onChange}
        placeholder={C.title.placeholder}
        className={styles.input3}
        required
      />
    </div>
  );
}

/** Thoi luong (phut) va thu tu trong khoa. */
export function LessonTimingFields({ formData, onChange }: FieldProps) {
  return (
    <div className={styles.grid}>
      <div>
        <label className={styles.row4}>
          <Clock size={14} className={styles.box4} /> {C.duration.label}
        </label>
        <input
          type="number"
          name="duration"
          value={formData.duration || ""}
          onChange={onChange}
          min={0}
          placeholder={C.duration.placeholder}
          className={styles.input3}
        />
      </div>
      <div>
        <label className={styles.row4}>
          <ListOrdered size={14} className={styles.box4} /> {C.order.label}
        </label>
        <input
          type="number"
          name="order"
          value={formData.order || ""}
          onChange={onChange}
          min={1}
          className={styles.input3}
        />
      </div>
    </div>
  );
}

/** Tom tat noi dung bai hoc. */
export function LessonDescriptionField({ formData, onChange }: FieldProps) {
  return (
    <div>
      <label className={styles.row4}>
        <AlignLeft size={14} className={styles.box4} /> {C.description.label}
      </label>
      <textarea
        name="description"
        value={formData.description}
        onChange={onChange}
        rows={4}
        placeholder={C.description.placeholder}
        className={styles.input3}
      />
    </div>
  );
}
