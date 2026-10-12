"use client";

import { useEffect, useState } from "react";

import { faqService, type FaqItem } from "@/src/services/faq";

/** Cau hoi thuong gap cua mot khoa. */
export function useCourseFaqs(courseId: string | undefined) {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState<boolean>(false);

  useEffect(() => {
    if (!courseId) return;

    const loadCourseFaqs = async () => {
      try {
        setLoadingFaqs(true);
        const faqsData = await faqService.getFaqsByCourse(courseId);
        setFaqs(faqsData || []);
      } catch (err) {
        console.error("Không thể tải danh sách câu hỏi FAQ của khóa học:", err);
      } finally {
        setLoadingFaqs(false);
      }
    };

    // Goi qua mot vong microtask de setState khong nam dong bo trong than
    // effect (rule react-hooks/set-state-in-effect).
    void Promise.resolve().then(loadCourseFaqs);
  }, [courseId]);

  return { faqs, loadingFaqs };
}
