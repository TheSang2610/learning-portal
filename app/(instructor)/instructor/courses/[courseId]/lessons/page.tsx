"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Video, Edit2, Trash2, FileQuestion, CheckCircle2, XCircle, BarChart2 } from "lucide-react"; // 🎯 Thêm BarChart2
import { getCourseById } from "@/src/services/course"; 
import { deleteLesson } from "@/src/services/lesson.api"; 
import { getCourseQuizzes, deleteQuiz, publishQuiz, Quiz } from "@/src/services/quizService";

interface Lesson {
  _id: string;
  title: string;
  videoUrl?: string;
  duration?: number | string;
  isFreePreview?: boolean;
}

export default function InstructorLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!courseId || courseId === "undefined") return;
    try {
      setLoading(true);
      const [courseResponse, quizzesResponse] = await Promise.all([
        getCourseById(courseId),
        getCourseQuizzes(courseId)
      ]);

      const courseData = (courseResponse as any)?.data || (courseResponse as any)?.course || courseResponse;
      if (courseData) {
        setCourseTitle(courseData.title || "Khóa học");
        if (Array.isArray(courseData.lessons)) {
          setLessons(courseData.lessons);
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
  };

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài học này khỏi giáo trình?")) return;
    try {
      await deleteLesson(lessonId);
      setLessons(lessons.filter((l) => l._id !== lessonId));
      alert("Xóa bài học thành công!");
    } catch (error) {
      alert("Xóa bài học thất bại.");
    }
  };

  const handleTogglePublishQuiz = async (quizId: string) => {
    try {
      const response = await publishQuiz(quizId);
      setQuizzes(quizzes.map((q) => q._id === quizId ? { ...q, isPublished: !q.isPublished } : q));
      alert(response?.message || "Cập nhật trạng thái thành công!");
    } catch (error) {
      alert("Lỗi cập nhật trạng thái hiển thị Quiz.");
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Đang tải giáo trình bài học...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4 px-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <Link href={`/instructor/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition mb-2">
            <ArrowLeft size={16} /> Quay lại thông tin chung
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản Lý Giáo Trình Bài Học</h1>
          <p className="text-xs text-slate-500 mt-1">Khóa học: <span className="font-semibold text-blue-600">{courseTitle}</span></p>
        </div>

        <Link
          href={`/instructor/courses/${courseId}/lessons/create`}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm w-fit"
        >
          <Plus size={16} /> Thêm bài học mới
        </Link>
      </div>

      {/* TABLE DATA */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Tên bài giảng</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Thời lượng</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Bài tập (Quiz)</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lessons.length > 0 ? (
              lessons.map((lesson, index) => {
                const matchingQuiz = quizzes.find((q) => (typeof q.lesson === "object" ? q.lesson?._id : q.lesson) === lesson._id);

                return (
                  <tr key={lesson._id} className="hover:bg-slate-50/50 transition text-sm">
                    <td className="p-4 font-medium text-slate-900 flex items-center gap-3">
                      <span className="text-slate-400 font-mono">#{index + 1}</span>
                      <div className="bg-blue-50 text-blue-600 p-2 rounded-lg"><Video size={14} /></div>
                      <span className="truncate max-w-xs">{lesson.title}</span>
                    </td>

                    <td className="p-4 text-slate-600">
                      {lesson.duration ? `${Math.round(Number(lesson.duration) / 60)} phút` : "--:--"}
                    </td>

                    <td className="p-4">
                      {matchingQuiz ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${matchingQuiz.isPublished ? "bg-green-50 text-green-700 border border-green-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                            <FileQuestion size={10} />
                            {matchingQuiz.isPublished ? "Đang mở" : "Ẩn"}
                          </span>
                          <span className="text-xs text-slate-400">({matchingQuiz.questions?.length || 0} câu)</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Chưa có</span>
                      )}
                    </td>

                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      {/* TÁC VỤ QUIZ */}
                      {!matchingQuiz ? (
                        <Link href={`/instructor/courses/${courseId}/lessons/${lesson._id}/quiz/create`} className="inline-flex text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 border border-blue-200 rounded-lg text-xs font-bold">
                          + Quiz
                        </Link>
                      ) : (
                        <>
                          {/* 🎯 NÚT XEM THỐNG KÊ & RESET BÀI LÀM MỚI BỔ SUNG */}
                          <Link 
                            href={`/instructor/courses/${courseId}/lessons/${lesson._id}/quiz/stats?quizId=${matchingQuiz._id}`} 
                            className="inline-flex items-center gap-1 text-emerald-600 hover:bg-emerald-50 px-2.5 py-1.5 border border-emerald-200 rounded-lg text-xs font-bold transition"
                          >
                            <BarChart2 size={12} /> Xem điểm
                          </Link>

                          <Link href={`/instructor/courses/${courseId}/lessons/${lesson._id}/quiz/edit`} className="inline-flex text-amber-600 hover:bg-amber-50 px-2.5 py-1.5 border border-amber-200 rounded-lg text-xs font-bold">
                            Sửa Quiz
                          </Link>

                          <button onClick={() => handleTogglePublishQuiz(matchingQuiz._id)} className="inline-flex text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold">
                            {matchingQuiz.isPublished ? "Ẩn" : "Hiện"}
                          </button>
                        </>
                      )}
                      
                      <span className="text-slate-200">|</span>

                      {/* TÁC VỤ LESSON */}
                      <Link href={`/instructor/courses/${courseId}/lessons/${lesson._id}`} className="inline-flex text-slate-700 hover:bg-slate-100 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold">
                        Sửa Bài
                      </Link>
                      <button onClick={() => handleDeleteLesson(lesson._id)} className="inline-flex text-red-600 hover:bg-red-50 px-2.5 py-1.5 border border-red-200 rounded-lg text-xs font-bold">
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-400 text-xs">📭 Chưa có bài giảng nào trong hệ thống cấu trúc nháp này.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}