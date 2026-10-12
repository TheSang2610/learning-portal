/* eslint-disable @next/next/no-img-element --
   Anh xem truoc lay tu URL.createObjectURL nen la URL blob: cuc bo.
   next/image khong toi uu duoc blob vi no phai di qua /_next/image tren may chu,
   nen dung the <img> o day moi dung. */
import { ImageIcon, Image as ImageIcon2 } from "lucide-react";

import { ADMIN_COURSE_CREATE as C } from "@/src/constants/admin/course-create-page";

import styles from "../AdminCourseCreate.module.scss";

interface ThumbnailPickerProps {
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ThumbnailPicker({ preview, onChange }: ThumbnailPickerProps) {
  return (
    <div>
      <label className={styles.fieldLabel}>
        <ImageIcon size={16} className={styles.box3} />
        {C.thumbnail.label}
      </label>

      <div className={styles.card}>
        <div className={styles.card2}>
          {preview ? (
            <img src={preview} alt={C.thumbnail.previewAlt} className={styles.image} />
          ) : (
            <div className={styles.box4}>
              <ImageIcon2 size={24} className={styles.box5} />
              <span className={styles.label}>{C.thumbnail.empty}</span>
            </div>
          )}
        </div>

        <div className={styles.box6}>
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
