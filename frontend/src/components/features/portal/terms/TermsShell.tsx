import type { ReactNode } from "react";

import styles from "./TermsOfService.module.scss";

/** Khung trang /terms: nen + cot giua. Cac section nam ben trong. */
export default function TermsShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>{children}</div>
    </div>
  );
}
