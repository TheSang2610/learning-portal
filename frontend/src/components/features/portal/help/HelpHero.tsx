import { HelpCircle } from "lucide-react";

import type { HelpHeroData } from "@/src/types/help";

import styles from "./HelpCenter.module.scss";

/* Banner Tìm kiếm */
export default function HelpHero({ title, intro }: HelpHeroData) {
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <HelpCircle size={48} className={styles.box} />
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{intro}</p>
    </div>
  );
}
