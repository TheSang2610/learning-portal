"use client";

import { useCallback, useEffect, useState } from "react";

import { getCourseById } from "@/src/services/course";
import { deleteLesson } from "@/src/services/lesson.api";
import {
  deleteQuiz,
  getCourseQuizzes,
  publishQuiz,
  Quiz,
} from "@/src/services/quizService";
import type { LessonRow } from "@/src/types/lesson";

export interface CourseLessonsMessages {
  courseFallback: string;
  loadErrorLog: string;
  confirmDeleteLesson: string;
  lessonDeleted: string;
  lessonDeleteFailed: string;
  quizToggled: string;
  quizToggleFailed: string;
  confirmDeleteQuiz?: string;
  quizDeleted?: string;
  quizDeleteFailed?: string;
}

/**
 * Giao trinh cua mot khoa: bai hoc + quiz gan voi tung bai, xoa bai, bat/tat
 * quiz, xoa quiz. Dung chung cho /admin/lessons va /instructor/lessons.
 */
export function useCourseLessons(courseId: string, messages: CourseLessonsMessages) {
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const { courseFallback, loadErrorLog } = messages;

  const fetchData = useCallback(async () => {
    if (!courseId || courseId === "undefined") return;
    try {
      setLoading(true);
      // Goi song song khoa hoc va danh sach quiz
      const [courseResponse, quizzesResponse] = await Promise.all([
        getCourseById(courseId),
        getCourseQuizzes(courseId),
      ]);

      // GET /courses/:id tra thang ban ghi khoa hoc, khong boc trong { data }
      // hay { course } - hai nhanh du phong cu chua bao gio chay.
      const courseData = courseResponse;
      if (courseData) {
        setCourseTitle(courseData.title || courseFallback);
        if (Array.isArray(courseData.lessons)) {
          setLessons(courseData.lessons as LessonRow[]);
        }
      }
      if (Array.isArray(quizzesResponse)) {
        setQuizzes(quizzesResponse);
      }
    } catch (error) {
      console.error(loadErrorLog, error);
    } finally {
      setLoading(false);
    }
  }, [courseId, courseFallback, loadErrorLog]);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm(messages.confirmDeleteLesson)) return;
    try {
      await deleteLesson(lessonId);
      setLessons(lessons.filter((l) => l._id !== lessonId));
      alert(messages.lessonDeleted);
    } catch {
      alert(messages.lessonDeleteFailed);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm(messages.confirmDeleteQuiz)) return;
    try {
      await deleteQuiz(quizId);
      setQuizzes(quizzes.filter((q) => q._id !== quizId));
      alert(messages.quizDeleted);
    } catch {
      alert(messages.quizDeleteFailed);
    }
  };

  // Bat/tat cong bo quiz, doi state tai cho de giao dien doi ngay
  const handleTogglePublishQuiz = async (quizId: string) => {
    try {
      const response = await publishQuiz(quizId);
      setQuizzes(
        quizzes.map((q) =>
          q._id === quizId ? { ...q, isPublished: !q.isPublished } : q,
        ),
      );
      alert(response?.message || messages.quizToggled);
    } catch {
      alert(messages.quizToggleFailed);
    }
  };

  /** Quiz gan voi bai hoc (q.lesson co the la id hoac doi tuong da populate). */
  const quizOfLesson = (lessonId: string) =>
    quizzes.find(
      (q) => (typeof q.lesson === "object" ? q.lesson?._id : q.lesson) === lessonId,
    );

  return {
    lessons,
    courseTitle,
    loading,
    quizOfLesson,
    handleDeleteLesson,
    handleDeleteQuiz,
    handleTogglePublishQuiz,
  };
}
