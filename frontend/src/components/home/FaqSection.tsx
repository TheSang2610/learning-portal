"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Minus, Plus } from "lucide-react";
import { faqService, FaqItem } from "@/src/services/faq";
import TieuDeMuc from "./SectionHeading";

import styles from "./FaqSection.module.scss";
function FaqAccordionSkeleton() {
  return (
    <div className={styles.box}>
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className={styles.row}>
          {/* Thanh câu hỏi dài giả lập */}
          <div className={styles.box2}></div>
          {/* Vòng tròn icon mũi tên giả lập */}
          <div className={styles.box3}></div>
        </div>
      ))}
    </div>
  );
}

interface Props {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/page.tsx).
   *
   * Co san thi KHONG goi API luc mount nua: noi dung nam thang trong HTML,
   * nguoi dung khong phai nhin khung xam, va may tim kiem doc duoc.
   * Bo trong thi component tu goi nhu cu - de con dung lai duoc o cho khac.
   */
  initialData?: FaqItem[] | null;
}

export default function FaqSection({ initialData }: Props) {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialData ?? []);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Mặc định mở câu đầu tiên

  useEffect(() => {
    if (initialData) return;

    faqService
      .getHomepageFaqs()
      .then((data) => setFaqs(data || []))
      .catch((error) => console.error("❌ Error fetching homepage FAQs:", error))
      .finally(() => setLoading(false));
  }, [initialData]);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <TieuDeMuc
          tieuDe="Câu hỏi thường gặp"
          moTa="Những thắc mắc hay gặp nhất về học phí, chứng nhận và cách khoá học vận hành."
        />

        {loading ? (
          <FaqAccordionSkeleton />
        ) : faqs.length === 0 ? (
          <div className={styles.row2}>
            <HelpCircle size={18} />
            <span>Chưa có câu hỏi thường gặp nào được thiết lập cho Trang chủ.</span>
          </div>
        ) : (
          // Cot hep hon phan con lai cua trang: cau hoi va cau tra loi la van
          // ban chay, doc de nhat trong khoang 70-75 ky tu moi dong. De tran
          // ra 1280px thi mat phai luot ca man hinh moi het mot dong.
          <div className={styles.card}>
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={faq._id || index} className={styles.box4}>
                  <h3>
                    <button
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                      className={`group ${styles.button}`}
                    >
                      <span
                        className={`${styles.label5} ${
                          isOpen ? styles.label : styles.label2
                        }`}
                      >
                        {faq.question}
                      </span>

                      {/* Dau cong doi thanh dau tru: trang thai dong/mo doc
                          duoc ngay ca khi nguoi dung khong phan biet duoc huong
                          mui ten, va aria-expanded o tren noi dieu do cho trinh
                          doc man hinh. */}
                      <span
                        aria-hidden="true"
                        className={`${styles.row3} ${
                          isOpen ? styles.label3 : styles.label4
                        }`}
                      >
                        {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                      </span>
                    </button>
                  </h3>

                  <div className={`${styles.grid} ${isOpen ? styles.box5 : styles.box6}`}>
                    <div className={styles.box7}>
                      <p className={styles.text}>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
