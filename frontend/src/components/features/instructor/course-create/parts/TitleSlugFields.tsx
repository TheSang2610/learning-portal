import { INSTRUCTOR_COURSE_CREATE as C } from "@/src/constants/instructor/course-create-page";

import styles from "../InstructorCourseCreate.module.scss";

interface TitleSlugFieldsProps {
  title: string;
  slug: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSlugChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/** Tieu de khoa hoc va duong dan SEO (slug tu sinh theo tieu de). */
export default function TitleSlugFields({
  title,
  slug,
  onTitleChange,
  onSlugChange,
}: TitleSlugFieldsProps) {
  return (
    <>
      <div className={styles.stack}>
        <label className={styles.fieldLabel3}>{C.title.label}</label>
        <input
          type="text"
          required
          name="title"
          placeholder={C.title.placeholder}
          className={styles.input2}
          value={title}
          onChange={onTitleChange}
        />
      </div>

      <div className={styles.stack}>
        <label className={styles.fieldLabel3}>{C.slug.label}</label>
        <input
          type="text"
          required
          name="slug"
          className={styles.input3}
          value={slug}
          onChange={onSlugChange}
        />
      </div>
    </>
  );
}
