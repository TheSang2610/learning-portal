import Link from "next/link";
import { ArrowRight, BadgeCheck, Check } from "lucide-react";

import SectionTitle from "@/src/components/common/SectionHeading";
import { fillTemplate, formatVnd } from "@/src/lib/format";
import type { HomePricingData } from "@/src/types/home";

import styles from "./HomePricing.module.scss";

interface Props extends HomePricingData {
  freeCount: number;
  paidCount: number;
  /** null = chua co khoa co phi nao dang mo. */
  minPaidPrice: number | null;
  accessDays: number;
}

/**
 * Bang hoc phi cho KHACH. He thong ban THEO TUNG KHOA (khong co goi thang),
 * nen hai "goi" o day la hai loai khoa: mien phi va co phi.
 *
 * Gia va so khoa tinh tu danh sach khoa hoc that (getHomeData) - ghi "tu X"
 * theo khoa re nhat, "N ngay" theo khoa co han ngan nhat, de khong bao gio
 * hua nhieu hon thu nguoi ta mua duoc.
 *
 * Component MAY CHU. Boc trong <GuestOnly> o page.tsx.
 */
export default function HomePricing({
  freeCount,
  paidCount,
  minPaidPrice,
  accessDays,
  heading,
  description,
  freePrice,
  paidFrom,
  paidNone,
  accessDaysLabel,
  plans,
  footnote,
}: Props) {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionTitle tieuDe={heading} moTa={description} />

        <div className={styles.grid}>
          {plans.map((plan) => {
            const isFree = plan.id === "free";
            const n = isFree ? freeCount : paidCount;
            const price = isFree
              ? freePrice
              : minPaidPrice === null
                ? paidNone
                : fillTemplate(paidFrom, { price: formatVnd(minPaidPrice) });
            const note = isFree
              ? plan.priceNote
              : minPaidPrice === null
                ? ""
                : fillTemplate(accessDaysLabel, { n: accessDays });

            return (
              <article
                key={plan.id}
                className={`${styles.card} ${plan.highlight ? styles.highlight : ""}`}
              >
                <h3 className={styles.name}>{plan.name}</h3>
                <p className={styles.price}>
                  {price}
                  {note && <span className={styles.note}>{note}</span>}
                </p>
                <p className={styles.count}>
                  {n > 0 ? fillTemplate(plan.count, { n }) : plan.countZero}
                </p>

                <ul className={styles.features}>
                  {plan.features.map((f) => (
                    <li key={f} className={styles.feature}>
                      <Check size={16} className={styles.check} aria-hidden />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={plan.cta.href} className={`group ${styles.cta}`}>
                  {plan.cta.label}
                  <ArrowRight size={17} className={styles.arrow} />
                </Link>
              </article>
            );
          })}
        </div>

        <p className={styles.footnote}>
          <BadgeCheck size={16} aria-hidden />
          {footnote}
        </p>
      </div>
    </section>
  );
}
