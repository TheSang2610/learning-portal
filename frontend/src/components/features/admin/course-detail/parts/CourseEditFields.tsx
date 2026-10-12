/* eslint-disable @next/next/no-img-element --
   Anh xem truoc co the lay tu URL.createObjectURL nen la URL blob: cuc bo.
   next/image khong toi uu duoc blob vi no phai di qua /_next/image tren may chu,
   nen dung the <img> o day moi dung. */
import { Building2, Image as ImageIcon } from "lucide-react";

import { ADMIN_COURSE_DETAIL as C } from "@/src/constants/admin/course-detail-page";
import type { ProviderData } from "@/src/services/provider";
import type { AdminCourseEditFormData, FieldChangeEvent } from "@/src/types/course-form";

import styles from "../AdminCourseDetail.module.scss";

interface CourseEditFieldsProps {
  formData: AdminCourseEditFormData;
  previewUrl: string;
  providers: ProviderData[];
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSlug: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: (e: FieldChangeEvent) => void;
}

/** Anh bia, tieu de, gia, slug, mo ta, trinh do va doi tac. */
export default function CourseEditFields({
  formData,
  previewUrl,
  providers,
  onFile,
  onTitle,
  onSlug,
  onChange,
}: CourseEditFieldsProps) {
  return (
    <>
      <div className={styles.box5}>
        <label className={styles.fieldLabel}>
          <ImageIcon size={14} className={styles.box4} />
          {C.thumbnail.label}
        </label>
        <div className={styles.card4}>
          {previewUrl ? (
            <img src={previewUrl} alt={C.thumbnail.alt} className={styles.image} />
          ) : (
            <div className={styles.box6}>{C.thumbnail.empty}</div>
          )}
        </div>
        <input type="file" accept="image/*" onChange={onFile} className={styles.input} />
      </div>

      <div className={styles.grid}>
        <div>
          <label className={styles.fieldLabel2}>{C.courseTitle}</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={onTitle}
            className={styles.input2}
            required
          />
        </div>
        <div>
          <label className={styles.fieldLabel2}>{C.price}</label>
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
          <label htmlFor="accessDays" className={styles.fieldLabel2}>
            {C.accessDays}
          </label>
          <input
            id="accessDays"
            type="number"
            name="accessDays"
            value={formData.accessDays}
            onChange={onChange}
            className={styles.input2}
            min={1}
            max={3650}
            required
            aria-describedby="accessDaysHint"
          />
          <p id="accessDaysHint" className={styles.hint}>
            {C.accessDaysHint}
          </p>
        </div>
      </div>

      <div>
        <label className={styles.fieldLabel2}>{C.slug}</label>
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
        <label className={styles.fieldLabel2}>{C.description}</label>
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
            <Building2 size={14} className={styles.box7} />
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
      </div>
    </>
  );
}
