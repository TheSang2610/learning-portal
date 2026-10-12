import type { ReactNode } from "react";

import styles from "./GradeProfileShell.module.scss";

/** Cot duoi cong cu: tinh nang khac + huong dan. */
export default function GradeProfileMore({ children }: { children: ReactNode }) {
  return <div className={styles.container3}>{children}</div>;
}
