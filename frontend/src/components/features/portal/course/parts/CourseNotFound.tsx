import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";

import styles from "../CourseDetail.module.scss";

/** Khong tai duoc khoa (sai slug, chua xuat ban, loi mang). */
export default function CourseNotFound({
  error,
  onHome,
}: {
  error: string;
  onHome: () => void;
}) {
  return (
    <div className={styles.page2}>
      <div className={styles.card3}>
        <p className={styles.text}>{C.notFound.title}</p>
        <p className={styles.text2}>{error || C.notFound.text}</p>
        <button onClick={onHome} className={styles.button}>
          {C.notFound.home}
        </button>
      </div>
    </div>
  );
}
