/* eslint-disable @next/next/no-img-element --
   Anh xem truoc co the lay tu URL.createObjectURL nen la URL blob: cuc bo.
   next/image khong toi uu duoc blob vi no phai di qua /_next/image tren may chu,
   nen dung the <img> o day moi dung. */
import { Image as ImageIcon } from "lucide-react";

import { INSTRUCTOR_COURSE_DETAIL as C } from "@/src/constants/instructor/course-detail-page";

import styles from "../InstructorCourseDetail.module.scss";

interface ThumbnailUploadProps {
  previewUrl: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ThumbnailUpload({ previewUrl, onChange }: ThumbnailUploadProps) {
  return (
    <div className={styles.box4}>
      <label className={styles.fieldLabel}>
        <ImageIcon size={14} className={styles.box5} /> {C.thumbnail.label}
      </label>
      <div className={styles.card4}>
        {previewUrl ? (
          <img src={previewUrl} alt={C.thumbnail.alt} className={styles.image} />
        ) : (
          <div className={styles.box6}>{C.thumbnail.empty}</div>
        )}
      </div>
      <input type="file" accept="image/*" onChange={onChange} className={styles.input} />
    </div>
  );
}
