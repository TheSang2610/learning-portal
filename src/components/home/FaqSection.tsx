"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Minus, Plus } from "lucide-react";
import { faqService, FaqItem } from "@/src/services/faq";
import TieuDeMuc from "./TieuDeMuc";

function FaqAccordionSkeleton() {
  return (
    <div className="mt-2 animate-pulse border-t border-gray-200">
      {[1, 2, 3, 4].map((index) => (
        <div
          key={index}
          className="flex items-center justify-between border-b border-gray-200 py-5"
        >
          {/* Thanh câu hỏi dài giả lập */}
          <div className="h-4 w-3/4 rounded bg-slate-200 md:w-1/2"></div>
          {/* Vòng tròn icon mũi tên giả lập */}
          <div className="h-5 w-5 flex-shrink-0 rounded-full bg-slate-200"></div>
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
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <TieuDeMuc
          tieuDe="Câu hỏi thường gặp"
          moTa="Những thắc mắc hay gặp nhất về học phí, chứng nhận và cách khoá học vận hành."
        />

        {loading ? (
          <FaqAccordionSkeleton />
        ) : faqs.length === 0 ? (
          <div className="mt-8 flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-5 py-10 text-sm text-slate-500">
            <HelpCircle size={18} />
            <span>Chưa có câu hỏi thường gặp nào được thiết lập cho Trang chủ.</span>
          </div>
        ) : (
          // Cot hep hon phan con lai cua trang: cau hoi va cau tra loi la van
          // ban chay, doc de nhat trong khoang 70-75 ky tu moi dong. De tran
          // ra 1280px thi mat phai luot ca man hinh moi het mot dong.
          <div className="mt-8 max-w-4xl overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={faq._id || index}
                  className="border-b border-slate-100 last:border-b-0"
                >
                  <h3>
                    <button
                      onClick={() => toggleFaq(index)}
                      aria-expanded={isOpen}
                      className="group flex w-full items-start justify-between gap-4 px-5 py-5 text-left transition select-none hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none focus-visible:ring-inset md:px-6"
                    >
                      <span
                        className={`text-[16px] leading-snug font-semibold transition-colors md:text-[17px] ${
                          isOpen
                            ? "text-blue-700"
                            : "text-slate-900 group-hover:text-blue-700"
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
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                          isOpen
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600"
                        }`}
                      >
                        {isOpen ? <Minus size={15} /> : <Plus size={15} />}
                      </span>
                    </button>
                  </h3>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-[72ch] px-5 pb-5 text-[15px] leading-[1.75] text-slate-600 md:px-6">
                        {faq.answer}
                      </p>
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
