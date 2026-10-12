import { Mail, MessageSquare } from "lucide-react";

import type { HelpContactData } from "@/src/types/help";

import styles from "./HelpCenter.module.scss";

/* Khối Liên hệ Hỗ trợ */
export default function HelpContact({ email, hotline }: HelpContactData) {
  return (
    <div className={styles.grid}>
      <div className={styles.card4}>
        <div className={styles.box3}>
          <Mail size={24} />
        </div>
        <div>
          <h3 className={styles.subheading}>{email.title}</h3>
          <p className={styles.text2}>{email.text}</p>
          <a href={`mailto:${email.address}`} className={styles.link}>
            {email.address}
          </a>
        </div>
      </div>

      <div className={styles.card4}>
        <div className={styles.box4}>
          <MessageSquare size={24} />
        </div>
        <div>
          <h3 className={styles.subheading}>{hotline.title}</h3>
          <p className={styles.text2}>{hotline.text}</p>
          <span className={styles.label2}>{hotline.number}</span>
        </div>
      </div>
    </div>
  );
}
