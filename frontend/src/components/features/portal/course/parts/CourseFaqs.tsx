"use client";

import { useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";

import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";
import type { FaqItem } from "@/src/services/faq";

import styles from "../CourseDetail.module.scss";

/* Tab 3: FAQs */
export default function CourseFaqs({
  faqs,
  loadingFaqs,
}: {
  faqs: FaqItem[];
  loadingFaqs: boolean;
}) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  return (
    <section id="faqs" className={styles.section2}>
      {(loadingFaqs || faqs.length > 0) && (
        <div className={styles.stack5}>
          <h2 className={styles.heading2}>{C.faqs.heading}</h2>

          {loadingFaqs ? (
            <div className={styles.row12}>
              <Loader2 className={styles.spinner} size={16} />
              <span>{C.faqs.loading}</span>
            </div>
          ) : (
            <div className={styles.card6}>
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={faq._id || index} className={styles.box34}>
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className={`group ${styles.button6}`}
                    >
                      <span className={styles.label7}>{faq.question}</span>
                      <ChevronDown
                        size={18}
                        className={`${styles.box45} ${isOpen ? styles.box35 : ""}`}
                      />
                    </button>

                    <div
                      className={`${styles.grid2} ${isOpen ? styles.box36 : styles.box37}`}
                    >
                      <div className={styles.box38}>
                        <p className={styles.text7}>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
