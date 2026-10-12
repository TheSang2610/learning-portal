import type { ReactNode } from "react";

import styles from "./HelpCenter.module.scss";

/** Khung trang /help: nen + cot giua. Cac section nam ben trong. */
export default function HelpShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>{children}</div>
    </div>
  );
}
