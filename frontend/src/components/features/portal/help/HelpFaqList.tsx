"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import type { HelpFaqData } from "@/src/types/help";

import styles from "./HelpCenter.module.scss";

/* Khối FAQs - mo mot cau mot luc. Chi phan nay can trang thai nen chi no la client. */
export default function HelpFaqList({ heading, items }: HelpFaqData) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.card2}>
      <h2 className={styles.heading}>{heading}</h2>
      <div className={styles.stack}>
        {items.map((faq, index) => (
          <div key={index} className={styles.card3}>
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className={styles.button}
            >
              <span className={styles.label}>{faq.question}</span>
              {openFaq === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {openFaq === index && <div className={styles.box2}>{faq.answer}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
