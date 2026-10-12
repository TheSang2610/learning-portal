import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import styles from "./FeatureLinks.module.scss";
// Dung chung cho ca hai trang: "Các tính năng khác" o trang Ho so diem va
// "Các tính năng liên quan" o trang Tinh diem tong ket.

export interface FeatureLink {
  href: string;
  label: string;
  desc?: string;
  icon: LucideIcon;
}

export default function FeatureLinks({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: FeatureLink[];
}) {
  return (
    <section className={styles.section}>
      <div className={styles.box}>
        <h2 className={styles.heading}>{title}</h2>
        <p className={styles.text}>{subtitle}</p>
      </div>

      <div className={styles.grid}>
        {items.map(({ href, label, desc, icon: Icon }) => (
          <Link key={href} href={href} className={styles.card}>
            <span className={styles.row}>
              <Icon size={20} className={styles.box2} />
            </span>
            <div className={styles.box3}>
              <h3 className={styles.subheading}>{label}</h3>
              {desc && <p className={styles.text2}>{desc}</p>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
