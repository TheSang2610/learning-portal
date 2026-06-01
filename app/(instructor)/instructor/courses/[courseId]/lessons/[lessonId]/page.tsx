"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Trash2, Save, X } from "lucide-react";
// 🎯 Giữ nguyên các hàm xử lý dữ liệu từ Service chung
import { getLessonById, updateLesson, deleteLesson } from "@/src/services/lesson.api";

export default function InstructorEditLessonPage() {
  const params = useParams();
  const router = useRouter();
  
  // 🎯 Lấy đồng thời cả courseId và lessonId từ URL
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); 
  const [deleting, setDeleting] = useState(false);

  // States quản lý form bài học
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [order, setOrder] = useState(1);

  // Gọi API lấy dữ liệu bài học khi trang vừa load
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true);
        const lesson = await getLessonById(lessonId);
        
        setTitle(lesson.title || "");
        setContent(lesson.content || "");
        setVideoUrl(lesson.videoUrl || "");
        setOrder(lesson.order || 1);
      } catch (error: any) {
        console.error(error);
        alert(error.message || "Không thể tải thông tin bài học");
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  // 🎯 Hàm xử lý cập nhật bài học
  const saveHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Vui lòng nhập tiêu đề bài học!");

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("videoUrl", videoUrl.trim());
      formData.append("order", String(order));

      await updateLesson(lessonId, formData);

      alert("Cập nhật bài học thành công!");
      // 🎯 ĐIỀU HƯỚNG VỀ PHÂN HỆ INSTRUCTOR (Quản lý giáo trình bài học)
      router.push(`/instructor/courses/${courseId}/lessons`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gặp lỗi khi cập nhật bài học");
    } finally {
      setSubmitting(false);
    }
  };

  // 🎯 Hàm xử lý xóa bài học
  const deleteHandler = async () => {
    const isConfirmed = window.confirm(
      "⚠️ Bạn có chắc chắn muốn xóa bài học này?\nHành động này sẽ gỡ bài học khỏi giáo trình của bạn và không thể hoàn tác!"
    );
    if (!isConfirmed) return;

    try {
      setDeleting(true);
      await deleteLesson(lessonId);
      alert("Xóa bài học thành công!");
      // 🎯 ĐIỀU HƯỚNG AN TOÀN VỀ LẠI PHÂN HỆ INSTRUCTOR
      router.push(`/instructor/courses/${courseId}/lessons`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gặp lỗi khi xóa bài học");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center text-slate-500 font-medium text-sm animate-pulse">
        Đang tải thông tin bài học...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 px-4 space-y-6">
      {/* BANNER CẢNH BÁO CHẾ ĐỘ INSTRUCTOR */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-amber-800">
        <AlertCircle size={18} className="shrink-0 mt-0.5 text-amber-600" />
        <div className="text-xs">
          <p className="font-bold">Chế độ Giảng viên (Instructor Mode)</p>
          <p className="text-amber-600 mt-0.5">
            Mọi chỉnh sửa hoặc xóa bài học tại đây sẽ trực tiếp thay đổi nội dung học liệu bản nháp của bạn.
          </p>
        </div>
      </div>

      {/* Nút quay lại liên kết trực tiếp với phân hệ Instructor */}
      <div>
        <button
          onClick={() => router.push(`/instructor/courses/${courseId}/lessons`)}
          className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-2 mb-2"
        >
          <ArrowLeft size={16} /> Quay lại giáo trình
        </button>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chỉnh Sửa Bài Học</h1>
        <p className="text-xs text-slate-400 mt-1">Cập nhật chi tiết nội dung, thứ tự xuất hiện và luồng video.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        {/* KHU VỰC THÔNG TIN TIÊU ĐỀ & NÚT XÓA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Thông tin bài học</h3>
            <p className="text-xs text-slate-400">ID bài học hiện tại: <span className="font-mono text-slate-500">{lessonId}</span></p>
          </div>
          
          {/* NÚT XÓA BÀI HỌC DÀNH CHO INSTRUCTOR */}
          <button
            type="button"
            disabled={deleting || submitting}
            onClick={deleteHandler}
            className="inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2.5 rounded-xl text-xs transition disabled:bg-slate-100 disabled:text-slate-400 self-start sm:self-auto"
          >
            <Trash2 size={14} />
            {deleting ? "Đang xóa..." : "Xóa bài học"}
          </button>
        </div>
        
        {/* FORM BIỂU MẪU CHỈNH SỬA */}
        <form onSubmit={saveHandler} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block mb-1.5 font-bold text-xs text-slate-600">Tên bài học / Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="block mb-1.5 font-bold text-xs text-slate-600">Thứ tự hiển thị</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition"
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-xs text-slate-600">Đường dẫn Video bài học (URL)</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Ví dụ: https://www.youtube.com/watch?v=..."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition font-mono text-slate-600"
            />
          </div>

          <div>
            <label className="block mb-1.5 font-bold text-xs text-slate-600">Tóm tắt nội dung bài học</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Ghi chú nội dung cốt lõi, tài liệu đính kèm hoặc văn bản hướng dẫn bài học..."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition text-slate-700 leading-relaxed"
            />
          </div>

          {/* NHÓM NÚT ĐIỀU HƯỚNG FORM */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 justify-end">
            <button
              type="button"
              disabled={submitting || deleting}
              onClick={() => router.push(`/instructor/courses/${courseId}/lessons`)}
              className="inline-flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-5 py-3 rounded-xl text-xs transition"
            >
              <X size={14} /> Hủy bỏ
            </button>
            
            <button
              type="submit"
              disabled={submitting || deleting}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md disabled:bg-slate-200 disabled:text-slate-400"
            >
              <Save size={14} />
              {submitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}