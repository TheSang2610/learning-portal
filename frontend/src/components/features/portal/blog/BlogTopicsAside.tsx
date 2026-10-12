import Link from "next/link";

import { BLOG } from "@/src/constants/portal/blog-page";
import type { Topic } from "@/src/services/post";

import styles from "./BlogList.module.scss";

interface BlogTopicsAsideProps {
  topics: Topic[];
  topic: string;
  hrefForTopic: (slug: string) => string;
}

/** Cot phai: chu de + loi moi chia se tai lieu. */
export default function BlogTopicsAside({
  topics,
  topic,
  hrefForTopic,
}: BlogTopicsAsideProps) {
  const T = BLOG.topics;

  return (
    <aside className={styles.aside}>
      <h2 className={styles.heading}>{T.heading}</h2>
      <ul className={styles.list}>
        {topics.map((t) => {
          const selected = t.slug === topic;
          return (
            <li key={t.slug}>
              <Link
                href={selected ? BLOG.listHref : hrefForTopic(t.slug)}
                aria-current={selected ? "page" : undefined}
                className={[styles.box2, selected ? styles.box3 : styles.box4].join(" ")}
              >
                {t.name}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className={styles.card3}>
        <p className={styles.text2}>{T.shareTitle}</p>
        <p className={styles.text3}>{T.shareText}</p>
        <Link href={BLOG.shareDocumentHref} className={styles.box5}>
          {T.shareCta}
        </Link>
      </div>
    </aside>
  );
}
