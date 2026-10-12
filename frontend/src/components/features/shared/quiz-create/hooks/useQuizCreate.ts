"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  QUIZ_CREATE as C,
  QUIZ_CREATE_ROLE,
  type QuizCreateRole,
} from "@/src/constants/shared/quiz-create-page";
import { useQuizQuestions } from "@/src/hooks/useQuizQuestions";
import {
  defaultQuizConfig,
  questionsPayload,
  emptyQuestion,
  findEmptySlot,
} from "@/src/lib/quiz-draft";
import { getErrorMessage } from "@/src/services/apiHelper";
import { getCourseById } from "@/src/services/course";
import { createQuiz } from "@/src/services/quizService";
import type { LessonOption, QuizConfigDraft } from "@/src/types/quiz-draft";

/** Soan va luu quiz moi cho khoa ?courseId= (co the gan san ?lessonId=). */
export function useQuizCreate(role: QuizCreateRole) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get("courseId") || "";
  const defaultLessonId = searchParams.get("lessonId") || "";

  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [quizConfig, setQuizConfig] = useState<QuizConfigDraft>(
    defaultQuizConfig(defaultLessonId),
  );
  const editor = useQuizQuestions([emptyQuestion()], C.messages.atLeastOne);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        // GET /courses/:id tra thang ban ghi khoa hoc, khong boc them lop nao.
        const courseData = await getCourseById(courseId);
        if (courseData && Array.isArray(courseData.lessons)) {
          setLessons(courseData.lessons as LessonOption[]);
        }
      } catch (err) {
        console.error("Không tải được danh sách bài học:", err);
      }
    };
    fetchCourseData();
  }, [courseId]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizConfig.title.trim()) return alert(C.messages.needTitle);

    const formError = findEmptySlot(editor.questions);
    if (formError) return alert(formError);

    try {
      setSubmitting(true);

      const payload = {
        courseId,
        lessonId: quizConfig.lessonId || undefined,
        title: quizConfig.title.trim(),
        description: quizConfig.description.trim(),
        passingScore: Number(quizConfig.passingScore),
        timeLimit: quizConfig.timeLimit ? Number(quizConfig.timeLimit) : null,
        attempts: Number(quizConfig.attempts),
        questions: questionsPayload(editor.questions),
      };

      await createQuiz(payload);
      alert(C.messages.success);

      router.push(QUIZ_CREATE_ROLE[role].lessonsHref(courseId));
    } catch (error) {
      console.error("Chi tiết lỗi nhận diện tại Frontend:", error);
      const errorMessage =
        getErrorMessage(error) || String(error) || C.messages.unknownError;
      alert(C.messages.failure(errorMessage));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    courseId,
    lessons,
    submitting,
    quizConfig,
    setQuizConfig,
    editor,
    handleFormSubmit,
  };
}
