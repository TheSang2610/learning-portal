"use client";

import { Suspense, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Video, Clock, AlignLeft, FileText, AlertCircle } from "lucide-react";

// Import hàm addLesson từ service của bạn
import { addLesson } from "@/src/services/lesson.api";

function InstructorLessonCreatePageContent() {
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

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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

      // Chuyển đổi Object State thành FormData đúng chuẩn Backend yêu cầu
      const dataToSend = new FormData();
      dataToSend.append("courseId", courseId);
      dataToSend.append("title", formData.title.trim());
      dataToSend.append("content", formData.description.trim()); // Khớp 'content' của Backend
      dataToSend.append("videoUrl", formData.videoUrl.trim());
      dataToSend.append("order", "1"); // Tạm thời để mặc định là 1

      // Gọi API thực tế thông qua Service
      await addLesson(dataToSend);

      alert("Thêm bài học mới thành công!");

      // 🎯 ĐIỀU HƯỚNG VỀ LẠI PHÂN HỆ INSTRUCTOR (Thay vì admin)
      router.push(`/instructor/lessons?courseId=${courseId}`);
    } catch (error) {
      console.error("Lỗi tạo bài học:", error);
      alert(
        getErrorMessage(error) ||
          getErrorMessage(error, "Đã xảy ra lỗi khi tạo bài học mới."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-4">
      {/* BANNER THÔNG BÁO CHẾ ĐỘ INSTRUCTOR */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="text-xs">
          <p className="font-bold">Chế độ Giảng viên (Instructor Mode)</p>
          <p className="mt-0.5 text-amber-600">
            Bài học mới tạo sẽ nằm trong giáo trình bản nháp của bạn. Học viên chỉ có thể
            học khi khóa học tổng thể được Admin phê duyệt.
          </p>
        </div>
      </div>

      {/* HEADER */}
      <div>
        {/* 🎯 ĐỔI LINK QUAY LẠI SANG INSTRUCTOR */}
        <Link
          href={`/instructor/lessons?courseId=${courseId}`}
          className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} /> Quay lại giáo trình
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Thêm Bài Học Mới
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Thiết kế cấu trúc video bài giảng và nội dung đính kèm.
        </p>
      </div>

      {/* FORM NHẬP LIỆU */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={submitHandler} className="space-y-5">
          {/* Tiêu đề bài học */}
          <div>
            <label className="mb-1.5 block flex items-center gap-1 text-xs font-bold text-slate-600">
              <FileText size={14} className="text-blue-500" /> Tên bài học / Tiêu đề
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={changeHandler}
              placeholder="Ví dụ: Bài 1: Tổng quan cấu trúc và cài đặt môi trường"
              className="w-full rounded-xl border border-slate-200 p-3 text-sm transition outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Video URL & Thời lượng học */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-1.5 block flex items-center gap-1 text-xs font-bold text-slate-600">
                <Video size={14} className="text-blue-500" /> Link Video bài học (URL)
              </label>
              <input
                type="text"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={changeHandler}
                placeholder="Youtube, Vimeo, Cloudinary link..."
                className="w-full rounded-xl border border-slate-200 p-3 text-sm transition outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block flex items-center gap-1 text-xs font-bold text-slate-600">
                <Clock size={14} className="text-blue-500" /> Thời lượng (Phút)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration || ""}
                onChange={changeHandler}
                min={0}
                placeholder="Ví dụ: 15"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm transition outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Mô tả nội dung bài học */}
          <div>
            <label className="mb-1.5 block flex items-center gap-1 text-xs font-bold text-slate-600">
              <AlignLeft size={14} className="text-blue-500" /> Tóm tắt nội dung bài học
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={changeHandler}
              rows={4}
              placeholder="Ghi chú những phần kiến thức cốt lõi học viên sẽ nhận được sau bài học này..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm transition outline-none focus:border-blue-500"
            />
          </div>

          {/* Option xem trước miễn phí */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div>
              <label className="block text-xs font-bold text-slate-700">
                Chế độ xem trước bài học (Free Preview)
              </label>
              <span className="text-[11px] text-slate-500">
                Cho phép người dùng chưa mua khóa học được xem video này miễn phí.
              </span>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={formData.isFreePreview}
                onChange={(e) =>
                  setFormData({ ...formData, isFreePreview: e.target.checked })
                }
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-blue-600 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
            </label>
          </div>

          {/* Nút bấm Actions */}
          <div className="flex justify-end gap-3 pt-2">
            {/* 🎯 ĐỔI LINK HỦY BỎ SANG INSTRUCTOR */}
            <Link
              href={`/instructor/lessons?courseId=${courseId}`}
              className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 disabled:bg-blue-400"
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
export default function InstructorLessonCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      }
    >
      <InstructorLessonCreatePageContent />
    </Suspense>
  );
}
