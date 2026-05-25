"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Video, Edit2, Trash2 } from "lucide-react";
import { getCourseById } from "@/src/services/course"; 
import { deleteLesson } from "@/src/services/lesson.api"; 

interface Lesson {
  _id: string;
  title: string;
  videoUrl?: string;
  duration?: number | string;
  isFreePreview?: boolean;
}

export default function AdminLessonsPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseTitle, setCourseTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessonsData = async () => {
      if (!courseId || courseId === "undefined") return;

      try {
        setLoading(true);

        // 🎯 Lấy trực tiếp từ API Khóa học (đã được backend populate sẵn lessons)
        const response = await getCourseById(courseId) as any;
        
        // Bóc tách phòng hờ dữ liệu bị bọc trong thuộc tính .data hoặc .course của API
        const courseData = response?.data ? response.data : (response?.course ? response.course : response);

        if (courseData) {
          setCourseTitle(courseData.title || "Khóa học");
          
          // Gán mảng bài học đã populate từ khóa học vào state
          if (Array.isArray(courseData.lessons)) {
            setLessons(courseData.lessons);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách bài học từ Khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonsData();
  }, [courseId]);

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

  if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Đang tải giáo trình bài học...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4 px-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <Link href={`/admin/courses/${courseId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition mb-2">
            <ArrowLeft size={16} /> Quay lại chi tiết khóa học
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quản Lý Bài Học</h1>
          <p className="text-sm text-slate-500 mt-1">Khóa học: <span className="font-semibold text-blue-600">{courseTitle}</span></p>
        </div>

        <Link
          href={`/admin/courses/${courseId}/lessons/create`}
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm w-fit"
        >
          <Plus size={16} /> Thêm bài học mới
        </Link>
      </div>

      {/* DANH SÁCH BẢNG */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tên bài học</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời lượng</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Xem thử (Preview)</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lessons.length > 0 ? (
              lessons.map((lesson, index) => (
                <tr key={lesson._id} className="hover:bg-slate-50/50 transition">
                  <td className="p-5 font-medium text-slate-900 flex items-center gap-3">
                    <span className="text-slate-400 font-mono text-sm">#{index + 1}</span>
                    <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                      <Video size={16} />
                    </div>
                    <span className="truncate max-w-md">{lesson.title}</span>
                  </td>
                  <td className="p-5 text-slate-600 text-sm">
                    {lesson.duration ? `${Math.round(Number(lesson.duration) / 60)} phút` : "--:--"}
                  </td>
                  <td className="p-5">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      lesson.isFreePreview 
                        ? "bg-green-50 text-green-700 border border-green-100" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {lesson.isFreePreview ? "Cho xem miễn phí" : "Khóa"}
                    </span>
                  </td>
                  <td className="p-5 text-right space-x-2">
                    <Link
                      href={`/admin/courses/${courseId}/lessons/${lesson._id}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold text-xs border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-50 transition"
                    >
                      <Edit2 size={12} /> Sửa
                    </Link>
                    <button
                      onClick={() => handleDeleteLesson(lesson._id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-bold text-xs border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition"
                    >
                      <Trash2 size={12} /> Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-16 text-center text-slate-400 text-sm">
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