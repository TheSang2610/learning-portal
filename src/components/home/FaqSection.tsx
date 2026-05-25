"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is Coursera?",
    answer: "Coursera is an online learning platform offering courses, certificates, and degrees from top universities and companies.",
  },
  {
    question: "Are Coursera courses free?",
    answer: "Many courses can be audited for free, while certificates and full programs may require payment.",
  },
  {
    question: "Can I earn a certificate?",
    answer: "Yes. You can earn professional certificates and university credentials after completing eligible programs.",
  },
  {
    question: "How do I enroll in a course?",
    answer: "Simply create an account, choose a course, and click enroll to start learning immediately.",
  },
  {
    question: "Can I learn at my own pace?",
    answer: "Yes. Most courses are self-paced so you can study whenever and wherever you want.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1f1f1f] tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="border-t border-gray-200">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={faq.question} className="border-b border-gray-200">
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

      </div>
    </section>
  );
}