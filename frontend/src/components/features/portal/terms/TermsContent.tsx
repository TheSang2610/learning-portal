import { AlertTriangle } from "lucide-react";

import RichText from "@/src/components/ui/RichText";
import type { TermsContentData } from "@/src/types/legal";

import styles from "./TermsOfService.module.scss";

/* Content */
export default function TermsContent({ intro, sections, warning }: TermsContentData) {
  return (
    <div className={styles.stack}>
      <p>
        <RichText value={intro} />
      </p>

      {sections.map(({ title, body }, i) => (
        <section key={title} className={styles.section}>
          <h2 className={styles.heading}>
            <span className={styles.row2}>{i + 1}</span>
            {title}
          </h2>
          <p>
            <RichText value={body} />
          </p>
        </section>
      ))}

      <section className={styles.section2}>
        <h2 className={styles.heading2}>
          <AlertTriangle size={18} />
          {warning.title}
        </h2>
        <p className={styles.text2}>{warning.body}</p>
      </section>
    </div>
  );
}
