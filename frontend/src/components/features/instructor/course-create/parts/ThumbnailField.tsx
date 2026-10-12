/* eslint-disable @next/next/no-img-element --
   Anh xem truoc lay tu URL.createObjectURL nen la URL blob: cuc bo.
   next/image khong toi uu duoc blob vi no phai di qua /_next/image tren may chu,
   nen dung the <img> o day moi dung. */
import { ImageIcon, Image as ImageIcon2 } from "lucide-react";

import { INSTRUCTOR_COURSE_CREATE as C } from "@/src/constants/instructor/course-create-page";

import styles from "../InstructorCourseCreate.module.scss";

interface ThumbnailFieldProps {
  previewUrl: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** O tai anh bia + khung xem truoc. */
export default function ThumbnailField({ previewUrl, onChange }: ThumbnailFieldProps) {
  return (
    <div>
      <label className={styles.fieldLabel}>
        <ImageIcon size={16} className={styles.box2} />
        {C.thumbnail.label}
      </label>

      <div className={styles.card2}>
        <div className={styles.card3}>
          {previewUrl ? (
            <img src={previewUrl} alt={C.thumbnail.previewAlt} className={styles.image} />
          ) : (
            <div className={styles.box3}>
              <ImageIcon2 size={24} className={styles.box4} />
              <span className={styles.label}>{C.thumbnail.emptyPreview}</span>
            </div>
          )}
        </div>

        <div className={styles.box5}>
          <input
            type="file"
            id={C.thumbnail.inputId}
            accept="image/*"
            onChange={onChange}
            className={styles.input}
          />
          <label htmlFor={C.thumbnail.inputId} className={styles.fieldLabel2}>
            {C.thumbnail.pick}
          </label>
          <p className={styles.text2}>{C.thumbnail.hint}</p>
        </div>
      </div>
    </div>
  );
}
