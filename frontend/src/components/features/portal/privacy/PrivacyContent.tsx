import RichText from "@/src/components/ui/RichText";
import type { PrivacyContentData } from "@/src/types/legal";

import styles from "./PrivacyPolicy.module.scss";

/* Content */
export default function PrivacyContent({ intro, sections }: PrivacyContentData) {
  return (
    <div className={styles.stack}>
      <p>
        <RichText value={intro} />
      </p>

      {sections.map(({ icon: Icon, title, body, list }) => (
        <section key={title} className={styles.section}>
          <h2 className={styles.heading}>
            <Icon size={18} className={styles.box2} />
            {title}
          </h2>
          <p>
            <RichText value={body} />
          </p>
          {list && (
            <ul className={styles.list}>
              {list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
