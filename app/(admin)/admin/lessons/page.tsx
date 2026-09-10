"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Video,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FileQuestion,
} from "lucide-react";
import { getCourseById } from "@/src/services/course";
import { deleteLesson } from "@/src/services/lesson.api";
import {
  getCourseQuizzes,
  deleteQuiz,
  publishQuiz,
  Quiz,
} from "@/src/services/quizService"; // Tích hợp API Quiz

interface Lesson {
  _id: string;
  title: string;
  videoUrl?: string;
  duration?: number | string;
  isFreePreview?: boolean;
}

function AdminLessonsPageContent() {
  const params = useSearchParams();
  const courseId = params.get("courseId") || "";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]); // Lưu danh sách Quiz của khóa học
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Hàm gom chung để fetch lại toàn bộ dữ liệu đồng bộ
  const fetchData = useCallback(async () => {
    if (!courseId || courseId === "undefined") return;
    try {
      setLoading(true);

      // Gọi song song cả API Khóa học & API danh sách Quiz để tối ưu tốc độ
      const [courseResponse, quizzesResponse] = await Promise.all([
        getCourseById(courseId),
        getCourseQuizzes(courseId),
      ]);

      // Xử lý dữ liệu Khóa học
      // GET /courses/:id tra thang ban ghi khoa hoc, khong boc trong { data }
      // hay { course } - hai nhanh du phong cu chua bao gio chay.
      const courseData = courseResponse;
      if (courseData) {
        setCourseTitle(courseData.title || "Khóa học");
        if (Array.isArray(courseData.lessons)) {
          setLessons(courseData.lessons as Lesson[]);
        }
      }

      // Xử lý dữ liệu Quizzes
      if (Array.isArray(quizzesResponse)) {
        setQuizzes(quizzesResponse);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu quản trị:", error);
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

  // Xử lý xóa bài học (Lesson)
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài học này khỏi giáo trình?")) return;
    try {
      await deleteLesson(lessonId);
      setLessons(lessons.filter((l) => l._id !== lessonId));
      alert("Xóa bài học thành công!");
    } catch {
      alert("Xóa bài học thất bại.");
    }
  };

  // 🎯 Xử lý xóa bài tập (Quiz)
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa HOÀN TOÀN bài trắc nghiệm này không?"))
      return;
    try {
      await deleteQuiz(quizId);
      setQuizzes(quizzes.filter((q) => q._id !== quizId));
      alert("Xóa bài tập trắc nghiệm thành công!");
    } catch {
      alert("Không thể xóa bài tập này.");
    }
  };

  // 🎯 Xử lý bật/tắt Publish bài tập (Quiz) trực tiếp trên bảng dữ liệu
  const handleTogglePublishQuiz = async (quizId: string) => {
    try {
      const response = await publishQuiz(quizId);
      // Cập nhật lại trạng thái ngay trên State local để UI thay đổi lập tức
      setQuizzes(
        quizzes.map((q) =>
          q._id === quizId ? { ...q, isPublished: !q.isPublished } : q,
        ),
      );
      alert(response?.message || "Cập nhật trạng thái hiển thị thành công!");
    } catch {
      alert("Lỗi thao tác trạng thái công bố.");
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
            href={`/admin/course-detail?courseId=${courseId}`}
            className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft size={16} /> Quay lại chi tiết khóa học
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Quản Lý Bài Học
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Khóa học: <span className="font-semibold text-blue-600">{courseTitle}</span>
          </p>
        </div>

        <Link
          href={`/admin/lesson-create?courseId=${courseId}`}
          className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={16} /> Thêm bài học mới
        </Link>
      </div>

      {/* DANH SÁCH BẢNG */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              <th className="p-5 text-xs font-bold tracking-wider text-slate-500 uppercase">
                Tên bài học
              </th>
              <th className="p-5 text-xs font-bold tracking-wider text-slate-500 uppercase">
                Thời lượng
              </th>
              <th className="p-5 text-xs font-bold tracking-wider text-slate-500 uppercase">
                Trạng thái bài tập (Quiz)
              </th>
              <th className="p-5 text-right text-xs font-bold tracking-wider text-slate-500 uppercase">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lessons.length > 0 ? (
              lessons.map((lesson, index) => {
                // 🔎 Tìm kiếm bài kiểm tra tương ứng với bài học hiện tại
                const matchingQuiz = quizzes.find((q) => {
                  const qLessonId =
                    typeof q.lesson === "object" ? q.lesson?._id : q.lesson;
                  return qLessonId === lesson._id;
                });

                return (
                  <tr key={lesson._id} className="transition hover:bg-slate-50/50">
                    {/* TÊN BÀI HỌC */}
                    <td className="flex items-center gap-3 p-5 font-medium text-slate-900">
                      <span className="font-mono text-sm text-slate-500">
                        #{index + 1}
                      </span>
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <Video size={16} />
                      </div>
                      <span className="max-w-xs truncate md:max-w-md">
                        {lesson.title}
                      </span>
                    </td>

                    {/* THỜI LƯỢNG */}
                    <td className="p-5 text-sm text-slate-600">
                      {lesson.duration
                        ? `${Math.round(Number(lesson.duration) / 60)} phút`
                        : "--:--"}
                    </td>

                    {/* TRẠNG THÁI QUIZ */}
                    <td className="p-5">
                      {matchingQuiz ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              matchingQuiz.isPublished
                                ? "border border-green-100 bg-green-50 text-green-700"
                                : "border border-amber-100 bg-amber-50 text-amber-700"
                            }`}
                          >
                            <FileQuestion size={12} />
                            {matchingQuiz.isPublished ? "Đang Công Bố" : "Bản Nháp (Ẩn)"}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({matchingQuiz.questions?.length || 0} câu hỏi)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">
                          Chưa có bài tập
                        </span>
                      )}
                    </td>

                    {/* HÀNH ĐỘNG DÀNH CHO LESSON & QUIZ */}
                    <td className="block space-y-2 p-5 text-right lg:table-cell lg:space-y-0 lg:space-x-2">
                      {/* --- PHẦN QUẢN LÝ QUIZ --- */}
                      {!matchingQuiz ? (
                        // Nút Tạo nếu chưa có Quiz
                        <Link
                          href={`/admin/quiz-create?courseId=${courseId}&lessonId=${lesson._id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                        >
                          <Plus size={12} /> Thêm Quiz
                        </Link>
                      ) : (
                        // Chuỗi nút xử lý nếu đã tồn tại Quiz độc lập
                        <>
                          <Link
                            href={`/admin/quiz-edit?courseId=${courseId}&lessonId=${lesson._id}`}
                            className="inline-flex items-center gap-1 rounded-xl border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-600 transition hover:bg-amber-50 hover:text-amber-800"
                          >
                            <Edit2 size={12} /> Sửa Quiz
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleTogglePublishQuiz(matchingQuiz._id)}
                            className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                              matchingQuiz.isPublished
                                ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                                : "border-green-200 text-green-600 hover:bg-green-50"
                            }`}
                          >
                            {matchingQuiz.isPublished ? (
                              <XCircle size={12} />
                            ) : (
                              <CheckCircle2 size={12} />
                            )}
                            {matchingQuiz.isPublished ? "Ẩn Quiz" : "Hiện Quiz"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuiz(matchingQuiz._id)}
                            className="inline-flex items-center gap-1 rounded-xl border border-purple-200 px-3 py-1.5 text-xs font-bold text-purple-600 transition hover:bg-purple-50 hover:text-purple-800"
                          >
                            <Trash2 size={12} /> Xóa Quiz
                          </button>
                        </>
                      )}

                      {/* Vạch chia nhẹ phân biệt giữa cấu hình Quiz và cấu hình cốt lõi Lesson */}
                      <span className="mx-1 hidden text-slate-400 lg:inline">|</span>

                      {/* --- PHẦN QUẢN LÝ LESSON --- */}
                      <Link
                        href={`/admin/lesson-detail?courseId=${courseId}&lessonId=${lesson._id}`}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        Sửa Bài
                      </Link>
                      <button
                        onClick={() => handleDeleteLesson(lesson._id)}
                        className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 hover:text-red-800"
                      >
                        Xóa Bài
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-16 text-center text-sm text-slate-500">
                  📭 Giáo trình trống. Vui lòng bấm nút phía trên để thêm bài giảng đầu
                  tiên!
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
export default function AdminLessonsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      }
    >
      <AdminLessonsPageContent />
    </Suspense>
  );
}
