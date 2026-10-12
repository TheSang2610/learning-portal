import type { ReactNode } from "react";

import styles from "./PrivacyPolicy.module.scss";

/** Khung trang /privacy: nen + cot giua. Cac section nam ben trong. */
export default function PrivacyShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>{children}</div>
    </div>
  );
}
