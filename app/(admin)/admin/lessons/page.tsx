"use client";


import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Video, Edit2, Trash2, CheckCircle2, XCircle, FileQuestion } from "lucide-react";
import { getCourseById } from "@/src/services/course"; 
import { deleteLesson } from "@/src/services/lesson.api"; 
import { getCourseQuizzes, deleteQuiz, publishQuiz, Quiz } from "@/src/services/quizService"; // Tích hợp API Quiz

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
  const fetchData = async () => {
    if (!courseId || courseId === "undefined") return;
    try {
      setLoading(true);

      // Gọi song song cả API Khóa học & API danh sách Quiz để tối ưu tốc độ
      const [courseResponse, quizzesResponse] = await Promise.all([
        getCourseById(courseId),
        getCourseQuizzes(courseId)
      ]);

      // Xử lý dữ liệu Khóa học
      const courseData = (courseResponse as any)?.data || (courseResponse as any)?.course || courseResponse;
      if (courseData) {
        setCourseTitle(courseData.title || "Khóa học");
        if (Array.isArray(courseData.lessons)) {
          setLessons(courseData.lessons);
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
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  // Xử lý xóa bài học (Lesson)
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài học này khỏi giáo trình?")) return;
    try {
      await deleteLesson(lessonId);
      setLessons(lessons.filter((l) => l._id !== lessonId));
      alert("Xóa bài học thành công!");
    } catch (error) {
      alert("Xóa bài học thất bại.");
    }
  };

  // 🎯 Xử lý xóa bài tập (Quiz)
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa HOÀN TOÀN bài trắc nghiệm này không?")) return;
    try {
      await deleteQuiz(quizId);
      setQuizzes(quizzes.filter((q) => q._id !== quizId));
      alert("Xóa bài tập trắc nghiệm thành công!");
    } catch (error) {
      alert("Không thể xóa bài tập này.");
    }
  };

  // 🎯 Xử lý bật/tắt Publish bài tập (Quiz) trực tiếp trên bảng dữ liệu
  const handleTogglePublishQuiz = async (quizId: string) => {
    try {
      const response = await publishQuiz(quizId);
      // Cập nhật lại trạng thái ngay trên State local để UI thay đổi lập tức
      setQuizzes(quizzes.map((q) => q._id === quizId ? { ...q, isPublished: !q.isPublished } : q));
      alert(response?.message || "Cập nhật trạng thái hiển thị thành công!");
    } catch (error) {
      alert("Lỗi thao tác trạng thái công bố.");
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Đang tải giáo trình bài học...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4 px-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <Link href={`/admin/course-detail?courseId=${courseId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition mb-2">
            <ArrowLeft size={16} /> Quay lại chi tiết khóa học
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quản Lý Bài Học</h1>
          <p className="text-sm text-slate-500 mt-1">Khóa học: <span className="font-semibold text-blue-600">{courseTitle}</span></p>
        </div>

        <Link
          href={`/admin/lesson-create?courseId=${courseId}`}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm w-fit"
        >
          <Plus size={16} /> Thêm bài học mới
        </Link>
      </div>

      {/* DANH SÁCH BẢNG */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên bài học</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời lượng</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái bài tập (Quiz)</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lessons.length > 0 ? (
              lessons.map((lesson, index) => {
                // 🔎 Tìm kiếm bài kiểm tra tương ứng với bài học hiện tại
                const matchingQuiz = quizzes.find((q) => {
                  const qLessonId = typeof q.lesson === "object" ? q.lesson?._id : q.lesson;
                  return qLessonId === lesson._id;
                });

                return (
                  <tr key={lesson._id} className="hover:bg-slate-50/50 transition">
                    {/* TÊN BÀI HỌC */}
                    <td className="p-5 font-medium text-slate-900 flex items-center gap-3">
                      <span className="text-slate-500 font-mono text-sm">#{index + 1}</span>
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                        <Video size={16} />
                      </div>
                      <span className="truncate max-w-xs md:max-w-md">{lesson.title}</span>
                    </td>

                    {/* THỜI LƯỢNG */}
                    <td className="p-5 text-slate-600 text-sm">
                      {lesson.duration ? `${Math.round(Number(lesson.duration) / 60)} phút` : "--:--"}
                    </td>

                    {/* TRẠNG THÁI QUIZ */}
                    <td className="p-5">
                      {matchingQuiz ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${
                            matchingQuiz.isPublished 
                              ? "bg-green-50 text-green-700 border border-green-100" 
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            <FileQuestion size={12} />
                            {matchingQuiz.isPublished ? "Đang Công Bố" : "Bản Nháp (Ẩn)"}
                          </span>
                          <span className="text-xs text-slate-500">({matchingQuiz.questions?.length || 0} câu hỏi)</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Chưa có bài tập</span>
                      )}
                    </td>

                    {/* HÀNH ĐỘNG DÀNH CHO LESSON & QUIZ */}
                    <td className="p-5 text-right space-y-2 lg:space-y-0 lg:space-x-2 block lg:table-cell">
                      {/* --- PHẦN QUẢN LÝ QUIZ --- */}
                      {!matchingQuiz ? (
                        // Nút Tạo nếu chưa có Quiz
                        <Link 
                          href={`/admin/quiz-create?courseId=${courseId}&lessonId=${lesson._id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-xs border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition"
                        >
                          <Plus size={12} /> Thêm Quiz
                        </Link>
                      ) : (
                        // Chuỗi nút xử lý nếu đã tồn tại Quiz độc lập
                        <>
                          <Link 
                            href={`/admin/quiz-edit?courseId=${courseId}&lessonId=${lesson._id}`}
                            className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 font-bold text-xs border border-amber-200 px-3 py-1.5 rounded-xl hover:bg-amber-50 transition"
                          >
                            <Edit2 size={12} /> Sửa Quiz
                          </Link>
                          
                          <button
                            type="button"
                            onClick={() => handleTogglePublishQuiz(matchingQuiz._id)}
                            className={`inline-flex items-center gap-1 font-bold text-xs border px-3 py-1.5 rounded-xl transition ${
                              matchingQuiz.isPublished
                                ? "text-slate-600 border-slate-200 hover:bg-slate-100"
                                : "text-green-600 border-green-200 hover:bg-green-50"
                            }`}
                          >
                            {matchingQuiz.isPublished ? <XCircle size={12} /> : <CheckCircle2 size={12} />}
                            {matchingQuiz.isPublished ? "Ẩn Quiz" : "Hiện Quiz"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteQuiz(matchingQuiz._id)}
                            className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-bold text-xs border border-purple-200 px-3 py-1.5 rounded-xl hover:bg-purple-50 transition"
                          >
                            <Trash2 size={12} /> Xóa Quiz
                          </button>
                        </>
                      )}

                      {/* Vạch chia nhẹ phân biệt giữa cấu hình Quiz và cấu hình cốt lõi Lesson */}
                      <span className="text-slate-400 hidden lg:inline mx-1">|</span>

                      {/* --- PHẦN QUẢN LÝ LESSON --- */}
                      <Link
                        href={`/admin/lesson-detail?courseId=${courseId}&lessonId=${lesson._id}`}
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-900 font-bold text-xs border border-slate-300 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition"
                      >
                        Sửa Bài
                      </Link>
                      <button
                        onClick={() => handleDeleteLesson(lesson._id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-bold text-xs border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition"
                      >
                        Xóa Bài
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-16 text-center text-slate-500 text-sm">
                  📭 Giáo trình trống. Vui lòng bấm nút phía trên để thêm bài giảng đầu tiên!
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
