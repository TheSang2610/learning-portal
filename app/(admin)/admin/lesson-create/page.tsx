"use client";


import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Video, Clock, AlignLeft, FileText } from "lucide-react";

// 1. Import đúng hàm addLesson đã chuẩn bị từ service của bạn
import { addLesson } from "@/src/services/lesson.api"; 

function AdminLessonCreatePageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const courseId = params.get("courseId") || "";

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "", // Trên Backend trường này tương ứng với 'content'
    videoUrl: "",
    duration: 0,
    isFreePreview: false,
  });

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "duration" ? Number(value) : value,
    });
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("Vui lòng nhập tiêu đề bài học!");

    try {
      setSubmitting(true);
      
      // 2. Chuyển đổi Object State thành FormData đúng chuẩn Backend yêu cầu
      const dataToSend = new FormData();
      dataToSend.append("courseId", courseId);
      dataToSend.append("title", formData.title.trim());
      dataToSend.append("content", formData.description.trim()); // Khớp 'content' của Backend
      dataToSend.append("videoUrl", formData.videoUrl.trim());
      dataToSend.append("order", "1"); // Bạn có thể bổ sung trường nhập 'order' nếu cần, tạm thời để mặc định là 1

      // Nếu sau này bạn có input loại file (<input type="file" />), bạn sẽ append như sau:
      // dataToSend.append("video", videoFileObject);

      // 3. Gọi API thực tế thông qua Service
      await addLesson(dataToSend);

      alert("Thêm bài học mới thành công!");
      
      // 4. Điều hướng về trang danh sách giáo trình bài học
      router.push(`/admin/lessons?courseId=${courseId}`);
    } catch (error: any) {
      console.error("Lỗi tạo bài học:", error);
      alert(error.response?.data?.message || error.message || "Đã xảy ra lỗi khi tạo bài học mới.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-4 px-4">
      {/* HEADER */}
      <div>
        <Link href={`/admin/lessons?courseId=${courseId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition mb-2">
          <ArrowLeft size={16} /> Quay lại giáo trình
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Thêm Bài Học Mới</h1>
        <p className="text-xs text-slate-500 mt-1">Thiết kế cấu trúc video bài giảng và nội dung đính kèm.</p>
      </div>

      {/* FORM NHẬP LIỆU */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={submitHandler} className="space-y-5">
          {/* Tiêu đề bài học */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-600 flex items-center gap-1">
              <FileText size={14} className="text-blue-500" /> Tên bài học / Tiêu đề
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={changeHandler}
              placeholder="Ví dụ: Bài 1: Tổng quan cấu trúc và cài đặt môi trường"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* Video URL & Thời lượng học */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block mb-1.5 text-xs font-bold text-slate-600 flex items-center gap-1">
                <Video size={14} className="text-blue-500" /> Link Video bài học (URL)
              </label>
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={changeHandler}
                placeholder="Youtube, Vimeo, Cloudinary link..."
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-bold text-slate-600 flex items-center gap-1">
                <Clock size={14} className="text-blue-500" /> Thời lượng (Phút)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration || ""}
                onChange={changeHandler}
                min={0}
                placeholder="Ví dụ: 15"
                className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {/* Mô tả nội dung bài học */}
          <div>
            <label className="block mb-1.5 text-xs font-bold text-slate-600 flex items-center gap-1">
              <AlignLeft size={14} className="text-blue-500" /> Tóm tắt nội dung bài học
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={changeHandler}
              rows={4}
              placeholder="Ghi chú những phần kiến thức cốt lõi học viên sẽ nhận được sau bài học này..."
              className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Option xem trước miễn phí */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-slate-700 block">Chế độ xem trước bài học (Free Preview)</label>
              <span className="text-[11px] text-slate-500">Cho phép người dùng chưa mua khóa học được xem video này miễn phí.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFreePreview}
                onChange={(e) => setFormData({ ...formData, isFreePreview: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Nút bấm Submit */}
          <div className="pt-2 flex justify-end gap-3">
            <Link
              href={`/admin/lessons?courseId=${courseId}`}
              className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-5 py-3 rounded-xl text-xs transition"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md disabled:bg-blue-400"
            >
              {submitting ? "Đang tạo..." : "Xác nhận thêm bài học"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
// Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
export default function AdminLessonCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      }
    >
      <AdminLessonCreatePageContent />
    </Suspense>
  );
}
