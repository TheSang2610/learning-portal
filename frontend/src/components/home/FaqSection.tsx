"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Minus, Plus } from "lucide-react";
import { faqService, type FaqItem, type ViTriFaq } from "@/src/services/faq";
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
  /** Khu vuc: trang chu he thong (mac dinh) hay trang chu khu Chia se tai lieu. */
  viTri?: ViTriFaq;
  tieuDe?: string;
  moTa?: string;
}

const MO_TA_MAC_DINH: Record<ViTriFaq, string> = {
  trangChu:
    "Những thắc mắc hay gặp nhất về học phí, chứng nhận và cách khoá học vận hành.",
  taiLieu: "Những thắc mắc hay gặp nhất khi xem, tải và chia sẻ tài liệu học tập.",
};

const TEN_KHU_VUC: Record<ViTriFaq, string> = {
  trangChu: "Trang chủ",
  taiLieu: "Chia sẻ tài liệu",
};

export default function FaqSection({
  initialData,
  viTri = "trangChu",
  tieuDe = "Câu hỏi thường gặp",
  moTa,
}: Props) {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialData ?? []);
  const [loading, setLoading] = useState<boolean>(!initialData);
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Mặc định mở câu đầu tiên

  useEffect(() => {
    if (initialData) return;

    (viTri === "taiLieu" ? faqService.getDocumentFaqs() : faqService.getHomepageFaqs())
      .then((data) => setFaqs(data || []))
      .catch((error) => console.error("❌ Error fetching homepage FAQs:", error))
      .finally(() => setLoading(false));
  }, [initialData, viTri]);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <TieuDeMuc tieuDe={tieuDe} moTa={moTa ?? MO_TA_MAC_DINH[viTri]} />

        {loading ? (
          <FaqAccordionSkeleton />
        ) : faqs.length === 0 ? (
          <div className={styles.row2}>
            <HelpCircle size={18} />
            <span>
              Chưa có câu hỏi thường gặp nào được thiết lập cho {TEN_KHU_VUC[viTri]}.
            </span>
          </div>
        ) : (
          // Khung rong het be ngang noi dung (truoc day chi 56rem, chua trong
          // 1-2 cot ben phai). Rieng CAU TRA LOI van gioi han ~80 ky tu moi
          // dong (.text) - van ban chay doc de nhat o do dai do.
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
