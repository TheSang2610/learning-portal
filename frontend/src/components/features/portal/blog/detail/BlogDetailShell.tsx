import type { ReactNode } from "react";

import styles from "./BlogDetailHeader.module.scss";

/** Khung trang /blog/[slug]. */
export default function BlogDetailShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.container}>{children}</div>
    </div>
  );
}
