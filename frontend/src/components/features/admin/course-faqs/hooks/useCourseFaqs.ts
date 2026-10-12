"use client";

import { useSearchParams } from "next/navigation";

import { ADMIN_COURSE_FAQS as C } from "@/src/constants/admin/course-faqs-page";
import { useFaqManager } from "@/src/hooks/useFaqManager";
import { faqService } from "@/src/services/faq";

const loadForCourse = (courseId: string) => faqService.getFaqsByCourse(courseId);

// Tao moi thi gui kem courseId cua khoa dang mo
const createForCourse = (courseId: string, question: string, answer: string) =>
  faqService.createFaq({ courseId, question, answer });

/** FAQ cua khoa lay tu query string: /admin/course-faqs?courseId=... */
export function useCourseFaqs() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId") || "";

  const manager = useFaqManager({
    scope: courseId,
    load: loadForCourse,
    create: createForCourse,
    enabled: Boolean(courseId),
    messages: C.messages,
  });

  return { courseId, ...manager };
}
