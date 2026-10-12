"use client";

import { useState } from "react";

import { ADMIN_FAQS as C } from "@/src/constants/admin/faqs-page";
import { useFaqManager } from "@/src/hooks/useFaqManager";
import { faqService, type FaqArea } from "@/src/services/faq";

const loadForArea = (faqArea: FaqArea) =>
  faqArea === "taiLieu" ? faqService.getDocumentFaqs() : faqService.getHomepageFaqs();

// courseId null: day la FAQ khong gan khoa hoc
const createForArea = (faqArea: FaqArea, question: string, answer: string) =>
  faqService.createFaq({ courseId: null, viTri: faqArea, question, answer });

/** FAQ theo khu vuc (Trang chu / Chia se tai lieu). */
export function useAdminFaqs() {
  const [faqArea, setFaqArea] = useState<FaqArea>("trangChu");
  const area = C.areas.find((k) => k.khoa === faqArea);

  const manager = useFaqManager({
    scope: faqArea,
    load: loadForArea,
    create: createForArea,
    messages: { ...C.messages, created: C.messages.created(area?.nhan) },
  });

  return { faqArea, setFaqArea, area, ...manager };
}
