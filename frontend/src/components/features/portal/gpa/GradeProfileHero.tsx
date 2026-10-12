import type { GradeProfileHeroData } from "@/src/types/gpa";

import styles from "./GradeProfileShell.module.scss";

/** Dai tieu de xanh o dau trang Ho so diem. */
export default function GradeProfileHero({ title, subtitle }: GradeProfileHeroData) {
  return (
    <div className={styles.container}>
      <div className={styles.container2}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.title}>{subtitle}</p>
      </div>
    </div>
  );
}
