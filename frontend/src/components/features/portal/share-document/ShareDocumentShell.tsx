import type { ReactNode } from "react";

import styles from "./ShareDocumentShell.module.scss";

/** Khung trang chu khu tai lieu (/share-document). */
export default function ShareDocumentShell({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}
