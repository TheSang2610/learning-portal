"use client";

import { useEffect, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { faqService, FaqItem } from "@/src/services/faq";

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
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* TÊN TIÊU ĐỀ */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[#1f1f1f] md:text-3xl">
            Câu hỏi thường gặp
          </h2>
        </div>

        {/* ĐIỀU KIỆN HIỂN THỊ: LOADING HOẶC DATA THẬT */}
        {loading ? (
          <FaqAccordionSkeleton />
        ) : faqs.length === 0 ? (
          /* TRẠNG THÁI KHÔNG CÓ DỮ LIỆU */
          <div className="flex items-center gap-2 border-t border-gray-200 py-10 text-sm text-gray-500">
            <HelpCircle size={18} />
            <span>Chưa có câu hỏi thường gặp nào được thiết lập cho Trang chủ.</span>
          </div>
        ) : (
          /* ĐỔ DỮ LIỆU THẬT RA ACCORDION */
          <div className="border-t border-gray-200">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div key={faq._id || index} className="border-b border-gray-200">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="group flex w-full items-center justify-between py-5 text-left select-none"
                  >
                    <span className="pr-4 text-base font-semibold text-[#1f1f1f] transition-colors group-hover:text-blue-700 md:text-lg">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`flex-shrink-0 text-gray-500 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-blue-700" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] pb-5 opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm leading-relaxed text-gray-600 md:text-base">
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
