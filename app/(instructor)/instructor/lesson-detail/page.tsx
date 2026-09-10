"use client";

import { Suspense, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Trash2, Save, X } from "lucide-react";
// 🎯 Giữ nguyên các hàm xử lý dữ liệu từ Service chung
import { getLessonById, updateLesson, deleteLesson } from "@/src/services/lesson.api";

function InstructorEditLessonPageContent() {
  const params = useSearchParams();
  const router = useRouter();

  // 🎯 Lấy đồng thời cả courseId và lessonId từ URL
  const courseId = params.get("courseId") || "";
  const lessonId = params.get("lessonId") || "";

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
      } catch (error) {
        console.error(error);
        alert(getErrorMessage(error, "Không thể tải thông tin bài học"));
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
      router.push(`/instructor/lessons?courseId=${courseId}`);
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, "Gặp lỗi khi cập nhật bài học"));
    } finally {
      setSubmitting(false);
    }
  };

  // 🎯 Hàm xử lý xóa bài học
  const deleteHandler = async () => {
    const isConfirmed = window.confirm(
      "⚠️ Bạn có chắc chắn muốn xóa bài học này?\nHành động này sẽ gỡ bài học khỏi giáo trình của bạn và không thể hoàn tác!",
    );
    if (!isConfirmed) return;

    try {
      setDeleting(true);
      await deleteLesson(lessonId);
      alert("Xóa bài học thành công!");
      // 🎯 ĐIỀU HƯỚNG AN TOÀN VỀ LẠI PHÂN HỆ INSTRUCTOR
      router.push(`/instructor/lessons?courseId=${courseId}`);
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, "Gặp lỗi khi xóa bài học"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-20 text-center text-sm font-medium text-slate-500">
        Đang tải thông tin bài học...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-4">
      {/* BANNER CẢNH BÁO CHẾ ĐỘ INSTRUCTOR */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="text-xs">
          <p className="font-bold">Chế độ Giảng viên (Instructor Mode)</p>
          <p className="mt-0.5 text-amber-600">
            Mọi chỉnh sửa hoặc xóa bài học tại đây sẽ trực tiếp thay đổi nội dung học liệu
            bản nháp của bạn.
          </p>
        </div>
      </div>

      {/* Nút quay lại liên kết trực tiếp với phân hệ Instructor */}
      <div>
        <button
          onClick={() => router.push(`/instructor/lessons?courseId=${courseId}`)}
          className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} /> Quay lại giáo trình
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Chỉnh Sửa Bài Học
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Cập nhật chi tiết nội dung, thứ tự xuất hiện và luồng video.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* KHU VỰC THÔNG TIN TIÊU ĐỀ & NÚT XÓA */}
        <div className="mb-5 flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Thông tin bài học</h3>
            <p className="text-xs text-slate-500">
              ID bài học hiện tại:{" "}
              <span className="font-mono text-slate-500">{lessonId}</span>
            </p>
          </div>

          {/* NÚT XÓA BÀI HỌC DÀNH CHO INSTRUCTOR */}
          <button
            type="button"
            disabled={deleting || submitting}
            onClick={deleteHandler}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400 sm:self-auto"
          >
            <Trash2 size={14} />
            {deleting ? "Đang xóa..." : "Xóa bài học"}
          </button>
        </div>

        {/* FORM BIỂU MẪU CHỈNH SỬA */}
        <form onSubmit={saveHandler} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-3">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Tên bài học / Tiêu đề
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm transition outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="md:col-span-1">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm transition outline-none focus:border-blue-500"
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              Đường dẫn Video bài học (URL)
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Ví dụ: https://www.youtube.com/watch?v=..."
              className="w-full rounded-xl border border-slate-200 p-3 font-mono text-sm text-slate-600 transition outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">
              Tóm tắt nội dung bài học
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Ghi chú nội dung cốt lõi, tài liệu đính kèm hoặc văn bản hướng dẫn bài học..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm leading-relaxed text-slate-700 transition outline-none focus:border-blue-500"
            />
          </div>

          {/* NHÓM NÚT ĐIỀU HƯỚNG FORM */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={submitting || deleting}
              onClick={() => router.push(`/instructor/lessons?courseId=${courseId}`)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <X size={14} /> Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={submitting || deleting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400"
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

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
// Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
export default function InstructorEditLessonPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      }
    >
      <InstructorEditLessonPageContent />
    </Suspense>
  );
}
