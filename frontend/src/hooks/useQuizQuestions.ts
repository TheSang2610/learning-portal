"use client";

import { useState } from "react";

import { emptyQuestion } from "@/src/lib/quiz-draft";
import type { DraftQuestion, Option } from "@/src/types/quiz-draft";

/**
 * State bo cau hoi dang soan cua mot quiz - dung chung cho trang tao va sua
 * quiz cua ca admin lan giang vien.
 *
 * @param initialize danh sach ban dau
 * @param requireAtLeastOneQuestion cau bao khi xoa cau cuoi cung (moi trang mot cach noi)
 */
export function useQuizQuestions(
  initialize: DraftQuestion[],
  requireAtLeastOneQuestion: string,
) {
  const [questions, setQuestions] = useState<DraftQuestion[]>(initialize);

  const addQuestion = () => {
    setQuestions([...questions, emptyQuestion()]);
  };

  const removeQuestion = (qIndex: number) => {
    if (questions.length === 1) return alert(requireAtLeastOneQuestion);
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  // Cap nhat noi dung cau hoi.
  //
  // Kieu generic K buoc field va value phai khop nhau: goi
  // handleQuestionChange(i, "points", "abc") se bi tu choi ngay luc bien dich.
  const handleQuestionChange = <K extends keyof DraftQuestion>(
    qIndex: number,
    field: K,
    value: DraftQuestion[K],
  ) => {
    setQuestions((before) =>
      before.map((q, idx) => (idx === qIndex ? { ...q, [field]: value } : q)),
    );
  };

  const handleOptionChange = <K extends keyof Option>(
    qIndex: number,
    oIndex: number,
    field: K,
    value: Option[K],
  ) => {
    setQuestions((before) =>
      before.map((q, idx) => {
        if (idx !== qIndex) return q;
        // Danh dau mot phuong an la dung -> tat cac phuong an dung khac cua
        // chinh cau hoi do, vi day la dang chon mot.
        if (field === "isCorrect" && value === true) {
          return {
            ...q,
            options: q.options.map((opt, i) => ({ ...opt, isCorrect: i === oIndex })),
          };
        }
        return {
          ...q,
          options: q.options.map((opt, i) =>
            i === oIndex ? { ...opt, [field]: value } : opt,
          ),
        };
      }),
    );
  };

  const addOption = (qIndex: number) => {
    setQuestions((before) =>
      before.map((q, idx) =>
        idx === qIndex
          ? { ...q, options: [...q.options, { text: "", isCorrect: false }] }
          : q,
      ),
    );
  };

  return {
    questions,
    setQuestions,
    addQuestion,
    removeQuestion,
    handleQuestionChange,
    handleOptionChange,
    addOption,
  };
}

export type QuizQuestionsEditor = ReturnType<typeof useQuizQuestions>;
