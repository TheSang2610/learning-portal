"use client";

import { useSearchParams } from "next/navigation";

import { INSTRUCTOR_LESSONS as C } from "@/src/constants/instructor/lessons-page";
import { useCourseLessons } from "@/src/hooks/useCourseLessons";

/** Bai hoc + quiz cua khoa (?courseId=), xoa bai va bat/tat quiz. */
export function useInstructorLessons() {
  const params = useSearchParams();
  const courseId = params.get("courseId") || "";

  const data = useCourseLessons(courseId, {
    courseFallback: C.courseFallback,
    loadErrorLog: "Lỗi lấy dữ liệu:",
    confirmDeleteLesson: C.messages.confirmDelete,
    lessonDeleted: C.messages.deleted,
    lessonDeleteFailed: C.messages.deleteFailed,
    quizToggled: C.messages.quizToggled,
    quizToggleFailed: C.messages.quizToggleFailed,
  });

  return { courseId, ...data };
}
