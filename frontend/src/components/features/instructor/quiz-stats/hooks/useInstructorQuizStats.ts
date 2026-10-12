"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { INSTRUCTOR_QUIZ_STATS as C } from "@/src/constants/instructor/quiz-stats-page";
import { getErrorMessage } from "@/src/services/apiHelper";
import { allowStudentRetry, getQuizStats, QuizStats } from "@/src/services/quizService";

export type StatsTab = "submitted" | "unsubmitted";

/**
 * Bao cao diem cua mot quiz va thao tac "cho lam lai" kem ly do.
 * Moi tham so deu lay tu query string:
 * /instructor/quiz-stats?courseId=...&lessonId=...&quizId=...
 */
export function useInstructorQuizStats() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get("courseId") || "";
  const quizId = searchParams.get("quizId");

  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatsTab>("submitted");

  // Mo lai bai kem ly do
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [retryReason, setRetryReason] = useState("");

  const loadStats = useCallback(async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      const data = await getQuizStats(quizId);
      setStats(data);
    } catch (err) {
      console.error("Lỗi lấy thống kê:", err);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) {
      // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
      // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
      // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
      // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
      // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
      void Promise.resolve().then(loadStats);
    }
  }, [loadStats, quizId]);

  /** Bam "Cho lam lai" -> mo hop nhap ly do (xoa ly do cu). */
  const openRetryModal = (studentId: string, studentName: string) => {
    setSelectedStudent({ id: studentId, name: studentName });
    setRetryReason("");
  };

  const handleConfirmRetry = async () => {
    if (!selectedStudent || !quizId) return;
    if (!retryReason.trim()) {
      alert(C.messages.needReason);
      return;
    }

    setSubmittingId(selectedStudent.id);
    try {
      const res = await allowStudentRetry(quizId, selectedStudent.id, retryReason);

      alert(res?.message || C.messages.retryOk(selectedStudent.name));
      setSelectedStudent(null);
      await loadStats();
    } catch (error) {
      alert(getErrorMessage(error, C.messages.retryFailed));
    } finally {
      setSubmittingId(null);
    }
  };

  return {
    quizId,
    stats,
    loading,
    activeTab,
    setActiveTab,
    submittingId,
    selectedStudent,
    closeRetryModal: () => setSelectedStudent(null),
    retryReason,
    setRetryReason,
    backToLessons: () => router.push(C.lessonsHref(courseId)),
    openRetryModal,
    handleConfirmRetry,
  };
}
