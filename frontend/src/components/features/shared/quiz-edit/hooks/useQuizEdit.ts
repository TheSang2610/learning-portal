"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  QUIZ_EDIT as C,
  QUIZ_EDIT_ROLE,
  type QuizEditRole,
} from "@/src/constants/shared/quiz-edit-page";
import { useQuizQuestions } from "@/src/hooks/useQuizQuestions";
import { defaultQuizConfig, questionsPayload, toDraft } from "@/src/lib/quiz-draft";
import { getErrorMessage } from "@/src/services/apiHelper";
import { getCourseQuizzes, updateQuiz } from "@/src/services/quizService";
import type { QuizConfigDraft } from "@/src/types/quiz-draft";

/** Nap quiz cua bai hoc (?courseId=&lessonId=) va luu thay doi. */
export function useQuizEdit(role: QuizEditRole) {
  const params = useSearchParams();
  const router = useRouter();

  const courseId = params.get("courseId") || "";
  const lessonId = params.get("lessonId") || "";

  const [targetQuizId, setTargetQuizId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizConfig, setQuizConfig] = useState<QuizConfigDraft>(defaultQuizConfig());
  const editor = useQuizQuestions([], C.messages.atLeastOne);
  const { setQuestions } = editor;

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        setLoading(true);
        const dataList = await getCourseQuizzes(courseId, lessonId);

        const currentQuiz = Array.isArray(dataList)
          ? dataList.find((q) => {
              const qLessonId = typeof q.lesson === "object" ? q.lesson?._id : q.lesson;
              return qLessonId === lessonId;
            })
          : null;

        if (currentQuiz) {
          setTargetQuizId(currentQuiz._id);
          setQuizConfig({
            title: currentQuiz.title || "",
            description: currentQuiz.description || "",
            lessonId: lessonId,
            passingScore: currentQuiz.passingScore || 70,
            timeLimit: currentQuiz.timeLimit || 15,
            attempts: currentQuiz.attempts || 1,
          });
          setQuestions(toDraft(currentQuiz.questions || []));
        } else {
          alert(C.messages.notFound);
          router.push(QUIZ_EDIT_ROLE[role].lessonsHref(courseId));
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin chi tiết Quiz:", err);
        alert(C.messages.loadFailed);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && lessonId) {
      fetchQuizDetails();
    }
  }, [courseId, lessonId, router, setQuestions, role]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizConfig.title.trim()) return alert(C.messages.needTitle);
    if (!targetQuizId) return alert(C.messages.noQuizId);

    try {
      setSubmitting(true);
      const payload = {
        title: quizConfig.title.trim(),
        description: quizConfig.description.trim(),
        passingScore: Number(quizConfig.passingScore),
        timeLimit: quizConfig.timeLimit ? Number(quizConfig.timeLimit) : null,
        attempts: Number(quizConfig.attempts),
        questions: questionsPayload(editor.questions),
      };

      await updateQuiz(targetQuizId, payload);
      alert(C.messages.success);

      router.push(QUIZ_EDIT_ROLE[role].lessonsHref(courseId));
    } catch (error) {
      alert(C.messages.failure(getErrorMessage(error, C.messages.fallbackError)));
    } finally {
      setSubmitting(false);
    }
  };

  return {
    courseId,
    loading,
    submitting,
    quizConfig,
    setQuizConfig,
    editor,
    handleFormSubmit,
  };
}
