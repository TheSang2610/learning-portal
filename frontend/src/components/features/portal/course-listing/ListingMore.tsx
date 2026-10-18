import Link from "next/link";
import { ArrowRight, FileText, PenLine } from "lucide-react";

import { COURSES_PAGE } from "@/src/constants/portal/courses-page";

import styles from "./ListingMore.module.scss";

const M = COURSES_PAGE.more;
const ICONS = { guides: PenLine, documents: FileText } as const;

/** Hai the dan sang khu Cam nang (/blog) va Kho tai lieu (/share-document). */
export default function ListingMore() {
  return (
    <section className={styles.section} aria-labelledby="courses-more-heading">
      <div className={styles.container}>
        <h2 id="courses-more-heading" className={styles.heading}>
          {M.heading}
        </h2>
        <p className={styles.description}>{M.description}</p>

        <div className={styles.grid}>
          {M.cards.map((c) => {
            const Icon = ICONS[c.id];
            return (
              <Link key={c.id} href={c.href} className={`group ${styles.card}`}>
                <span className={styles.icon}>
                  <Icon size={22} aria-hidden />
                </span>
                <span className={styles.body}>
                  <span className={styles.title}>{c.title}</span>
                  <span className={styles.text}>{c.text}</span>
                  <span className={styles.cta}>
                    {c.cta}
                    <ArrowRight size={16} className={styles.arrow} />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
