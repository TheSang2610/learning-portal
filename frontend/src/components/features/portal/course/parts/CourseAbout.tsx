import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";

import styles from "../CourseDetail.module.scss";

/* Tab 1: About */
export default function CourseAbout({ description }: { description?: string }) {
  return (
    <section id="about" className={styles.section}>
      <h2 className={styles.heading}>{C.about.heading}</h2>
      <div className={styles.box31}>{description || C.about.empty}</div>
    </section>
  );
}
