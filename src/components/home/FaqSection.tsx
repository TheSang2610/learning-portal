"use client";

import { useEffect, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { faqService, FaqItem } from "@/src/services/faq"; 

function FaqAccordionSkeleton() {
  return (
    <div className="border-t border-gray-200 mt-2 animate-pulse">
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className="border-b border-gray-200 py-5 flex items-center justify-between">
          {/* Thanh câu hỏi dài giả lập */}
          <div className="h-4 bg-slate-200 rounded w-3/4 md:w-1/2"></div>
          {/* Vòng tròn icon mũi tên giả lập */}
          <div className="w-5 h-5 bg-slate-200 rounded-full flex-shrink-0"></div>
        </div>
      ))}
    </div>
  );
}

export default function FaqSection() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Mặc định mở câu đầu tiên

  // Gọi API lấy dữ liệu FAQ Trang chủ thực tế từ Database
  useEffect(() => {
    const fetchHomepageFaqs = async () => {
      try {
        setLoading(true);
        const data = await faqService.getHomepageFaqs();
        setFaqs(data || []);
      } catch (error) {
        console.error("❌ Error fetching homepage FAQs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageFaqs();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* TÊN TIÊU ĐỀ */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1f1f1f] tracking-tight">
            Câu hỏi thường gặp
          </h2>
        </div>

        {/* ĐIỀU KIỆN HIỂN THỊ: LOADING HOẶC DATA THẬT */}
        {loading ? (
          <FaqAccordionSkeleton />
        ) : faqs.length === 0 ? (
          /* TRẠNG THÁI KHÔNG CÓ DỮ LIỆU */
          <div className="py-10 border-t border-gray-200 text-gray-500 flex items-center gap-2 text-sm">
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
                    className="w-full flex items-center justify-between py-5 text-left group select-none"
                  >
                    <span className="text-base md:text-lg font-semibold text-[#1f1f1f] pr-4 group-hover:text-blue-700 transition-colors">
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={20}
                      className={`text-gray-500 transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? "rotate-180 text-blue-700" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100 pb-5"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-sm md:text-base text-gray-600 leading-relaxed">
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