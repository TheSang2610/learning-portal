import type { ReactNode } from "react";

import styles from "./GradeProfileShell.module.scss";

/** Khung trang /gpa-calculator. */
export default function GradeProfileShell({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}
