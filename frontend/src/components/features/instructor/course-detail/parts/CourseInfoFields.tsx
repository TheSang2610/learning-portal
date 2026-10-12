import { Building2 } from "lucide-react";

import { INSTRUCTOR_COURSE_DETAIL as C } from "@/src/constants/instructor/course-detail-page";
import type { ProviderData } from "@/src/services/provider";
import type { CourseEditFormData, FieldChangeEvent } from "@/src/types/course-form";

import styles from "../InstructorCourseDetail.module.scss";

interface CourseInfoFieldsProps {
  formData: CourseEditFormData;
  providers: ProviderData[];
  onChange: (e: FieldChangeEvent) => void;
}

/** Tieu de, gia, mo ta, trinh do va don vi cap chung chi. */
export default function CourseInfoFields({
  formData,
  providers,
  onChange,
}: CourseInfoFieldsProps) {
  return (
    <>
      <div className={styles.grid}>
        <div>
          <label className={styles.fieldLabel2}>{C.title.label}</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onChange}
            className={styles.input2}
            required
          />
        </div>
        <div>
          <label className={styles.fieldLabel2}>{C.price.label}</label>
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
      </div>

      <div>
        <label className={styles.fieldLabel2}>{C.description.label}</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          rows={4}
          className={styles.textarea}
          required
        />
      </div>

      <div className={styles.grid}>
        <div>
          <label className={styles.fieldLabel2}>{C.level.label}</label>
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

        <div>
          <label className={styles.fieldLabel3}>
            <Building2 size={14} className={styles.box7} /> {C.provider.label}
          </label>
          <select
            name="providerId"
            value={formData.providerId}
            onChange={onChange}
            className={styles.select}
          >
            <option value="">{C.provider.none}</option>
            {providers.map((p) => (
              <option key={p._id} value={p._id}>
                {(p.type === "university"
                  ? C.provider.universityPrefix
                  : C.provider.companyPrefix) + p.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
