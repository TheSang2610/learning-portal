import type { LegalHeaderData } from "@/src/types/legal";

import styles from "./TermsOfService.module.scss";

/* Header */
export default function TermsHeader({ badge, title, updated }: LegalHeaderData) {
  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <span className={styles.label}>{badge}</span>
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{updated}</p>
    </div>
  );
}
