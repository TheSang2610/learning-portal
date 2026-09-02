"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Video, FileQuestion, BarChart2 } from "lucide-react"; // 🎯 Thêm BarChart2
import { getCourseById } from "@/src/services/course";
import { deleteLesson } from "@/src/services/lesson.api";
import { getCourseQuizzes, publishQuiz, Quiz } from "@/src/services/quizService";

interface Lesson {
  _id: string;
  title: string;
  videoUrl?: string;
  duration?: number | string;
  isFreePreview?: boolean;
}

function InstructorLessonsPageContent() {
  const params = useSearchParams();
  const courseId = params.get("courseId") || "";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!courseId || courseId === "undefined") return;
    try {
      setLoading(true);
      const [courseResponse, quizzesResponse] = await Promise.all([
        getCourseById(courseId),
        getCourseQuizzes(courseId),
      ]);

      // GET /courses/:id tra thang ban ghi khoa hoc, khong boc trong { data }
      // hay { course } - hai nhanh du phong cu chua bao gio chay.
      const courseData = courseResponse;
      if (courseData) {
        setCourseTitle(courseData.title || "Khóa học");
        if (Array.isArray(courseData.lessons)) {
          setLessons(courseData.lessons as Lesson[]);
        }
      }
      if (Array.isArray(quizzesResponse)) {
        setQuizzes(quizzesResponse);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(fetchData);
  }, [fetchData]);

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài học này khỏi giáo trình?")) return;
    try {
      await deleteLesson(lessonId);
      setLessons(lessons.filter((l) => l._id !== lessonId));
      alert("Xóa bài học thành công!");
    } catch {
      alert("Xóa bài học thất bại.");
    }
  };

  const handleTogglePublishQuiz = async (quizId: string) => {
    try {
      const response = await publishQuiz(quizId);
      setQuizzes(
        quizzes.map((q) =>
          q._id === quizId ? { ...q, isPublished: !q.isPublished } : q,
        ),
      );
      alert(response?.message || "Cập nhật trạng thái thành công!");
    } catch {
      alert("Lỗi cập nhật trạng thái hiển thị Quiz.");
    }
  };

  if (loading)
    return (
      <div className="animate-pulse py-20 text-center text-slate-500">
        Đang tải giáo trình bài học...
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-4">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href={`/instructor/course-detail?courseId=${courseId}`}
            className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft size={16} /> Quay lại thông tin chung
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Giáo Trình Bài Học
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Khóa học: <span className="font-semibold text-blue-600">{courseTitle}</span>
          </p>
        </div>

        <Link
          href={`/instructor/lesson-create?courseId=${courseId}`}
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={16} /> Thêm bài học mới
        </Link>
      </div>

      {/* TABLE DATA */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                Tên bài giảng
              </th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                Thời lượng
              </th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">
                Bài tập (Quiz)
              </th>
              <th className="p-4 text-right text-xs font-bold text-slate-500 uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lessons.length > 0 ? (
              lessons.map((lesson, index) => {
                const matchingQuiz = quizzes.find(
                  (q) =>
                    (typeof q.lesson === "object" ? q.lesson?._id : q.lesson) ===
                    lesson._id,
                );

                return (
                  <tr
                    key={lesson._id}
                    className="text-sm transition hover:bg-slate-50/50"
                  >
                    <td className="flex items-center gap-3 p-4 font-medium text-slate-900">
                      <span className="font-mono text-slate-500">#{index + 1}</span>
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <Video size={14} />
                      </div>
                      <span className="max-w-xs truncate">{lesson.title}</span>
                    </td>

                    <td className="p-4 text-slate-600">
                      {lesson.duration
                        ? `${Math.round(Number(lesson.duration) / 60)} phút`
                        : "--:--"}
                    </td>

                    <td className="p-4">
                      {matchingQuiz ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${matchingQuiz.isPublished ? "border border-green-100 bg-green-50 text-green-700" : "border border-amber-100 bg-amber-50 text-amber-700"}`}
                          >
                            <FileQuestion size={10} />
                            {matchingQuiz.isPublished ? "Đang mở" : "Ẩn"}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({matchingQuiz.questions?.length || 0} câu)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Chưa có</span>
                      )}
                    </td>

                    <td className="space-x-1 p-4 text-right whitespace-nowrap">
                      {/* TÁC VỤ QUIZ */}
                      {!matchingQuiz ? (
                        <Link
                          href={`/instructor/quiz-create?courseId=${courseId}&lessonId=${lesson._id}`}
                          className="inline-flex rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50"
                        >
                          + Quiz
                        </Link>
                      ) : (
                        <>
                          {/* 🎯 NÚT XEM THỐNG KÊ & RESET BÀI LÀM MỚI BỔ SUNG */}
                          <Link
                            href={`/instructor/quiz-stats?courseId=${courseId}&lessonId=${lesson._id}&quizId=${matchingQuiz._id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-50"
                          >
                            <BarChart2 size={12} /> Xem điểm
                          </Link>

                          <Link
                            href={`/instructor/quiz-edit?courseId=${courseId}&lessonId=${lesson._id}`}
                            className="inline-flex rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-bold text-amber-600 hover:bg-amber-50"
                          >
                            Sửa Quiz
                          </Link>

                          <button
                            onClick={() => handleTogglePublishQuiz(matchingQuiz._id)}
                            className="inline-flex rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
                          >
                            {matchingQuiz.isPublished ? "Ẩn" : "Hiện"}
                          </button>
                        </>
                      )}

                      <span className="text-slate-400">|</span>

                      {/* TÁC VỤ LESSON */}
                      <Link
                        href={`/instructor/lesson-detail?courseId=${courseId}&lessonId=${lesson._id}`}
                        className="inline-flex rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                      >
                        Sửa Bài
                      </Link>
                      <button
                        onClick={() => handleDeleteLesson(lesson._id)}
                        className="inline-flex rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-12 text-center text-xs text-slate-500">
                  📭 Chưa có bài giảng nào trong hệ thống cấu trúc nháp này.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
// Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
export default function InstructorLessonsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      }
    >
      <InstructorLessonsPageContent />
    </Suspense>
  );
}
