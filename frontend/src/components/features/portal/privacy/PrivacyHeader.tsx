import { ShieldCheck } from "lucide-react";

import type { LegalHeaderData } from "@/src/types/legal";

import styles from "./PrivacyPolicy.module.scss";

/* Header */
export default function PrivacyHeader({ badge, title, updated }: LegalHeaderData) {
  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <ShieldCheck size={28} />
        <span className={styles.label}>{badge}</span>
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{updated}</p>
    </div>
  );
}
