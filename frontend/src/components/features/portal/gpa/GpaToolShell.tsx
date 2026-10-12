import type { ReactNode } from "react";

import type { GpaToolHeroData } from "@/src/types/gpa";

import styles from "./GpaToolShell.module.scss";

interface GpaToolShellProps extends GpaToolHeroData {
  children: ReactNode;
}

/**
 * Khung chung cua trang Tinh diem tong ket va Quy doi 10 -> 4: tieu de, mo
 * ta, mot hang so lieu, roi toi noi dung cong cu. Truoc day hai trang chep
 * nguyen mot khung va mot file SCSS giong het nhau.
 */
export default function GpaToolShell({
  icon: HeroIcon,
  title,
  intro,
  stats,
  children,
}: GpaToolShellProps) {
  return (
    <div className={styles.page}>
      {/* ============ HERO ============ */}
      <section className={styles.section}>
        <span className={styles.label}>
          <HeroIcon size={24} className={styles.box} />
        </span>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{intro}</p>

        <div className={styles.row}>
          {stats.map(({ icon: Icon, value, label }) => (
            <span key={label} className={styles.card}>
              <Icon size={15} className={styles.box} />
              <strong className={styles.strong}>{value}</strong>
              <span className={styles.label2}>·</span>
              <span className={styles.label3}>{label}</span>
            </span>
          ))}
        </div>
      </section>

      <div className={styles.container}>{children}</div>
    </div>
  );
}
