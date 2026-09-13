"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  Clock,
  AlignLeft,
  FileText,
  Paperclip,
  ListOrdered,
} from "lucide-react";

import { addLesson } from "@/src/services/lesson.api";
import { getCourseById } from "@/src/services/course";

function AdminLessonCreatePageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const courseId = params.get("courseId") || "";

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "", // Tren backend truong nay la 'content'
    videoUrl: "",
    documentUrl: "",
    duration: 0,
    order: 1,
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // Thu tu mac dinh la bai ke tiep. Truoc day o day ghi cung "1" cho moi bai,
  // nen ca khoa deu order = 1 va muc luc xep lung tung.
  const layThuTuKeTiep = useCallback(async () => {
    if (!courseId) return;
    try {
      const khoa = await getCourseById(courseId);
      const soBai = Array.isArray(khoa?.lessons) ? khoa.lessons.length : 0;
      setFormData((truoc) => ({ ...truoc, order: soBai + 1 }));
    } catch {
      // Khong lay duoc thi cu de 1, nguoi dung van sua tay duoc.
    }
  }, [courseId]);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang: goi thang thi setState nam
    // dong bo ngay trong than effect, React phai chay them mot vong ve lai
    // (rule react-hooks/set-state-in-effect). Cung cach lam voi trang
    // admin/lessons.
    void Promise.resolve().then(layThuTuKeTiep);
  }, [layThuTuKeTiep]);

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "duration" || name === "order" ? Number(value) : value,
    });
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("Vui lòng nhập tiêu đề bài học!");
    if (!courseId) return alert("Thiếu mã khóa học, hãy mở lại từ trang giáo trình.");

    try {
      setSubmitting(true);

      const dataToSend = new FormData();
      dataToSend.append("courseId", courseId);
      dataToSend.append("title", formData.title.trim());
      dataToSend.append("content", formData.description.trim());
      dataToSend.append("order", String(formData.order));

      // O nhap tinh bang PHUT cho de doc, nhung trang danh sach bai hoc chia
      // cho 60 roi ghi "x phut" - tuc la kho dang luu bang GIAY. Doi ngay tai
      // day de hai noi khong lech don vi.
      if (formData.duration > 0) {
        dataToSend.append("duration", String(Math.round(formData.duration * 60)));
      }

      // Co tep thi uu tien tep (backend day len Cloudinary roi lay duong dan);
      // khong co tep moi dung duong dan da dan san.
      if (videoFile) {
        dataToSend.append("video", videoFile);
      } else if (formData.videoUrl.trim()) {
        dataToSend.append("videoUrl", formData.videoUrl.trim());
      }

      if (documentFile) {
        dataToSend.append("document", documentFile);
      } else if (formData.documentUrl.trim()) {
        dataToSend.append("documentUrl", formData.documentUrl.trim());
      }

      await addLesson(dataToSend);

      alert("Thêm bài học mới thành công!");
      router.push(`/admin/lessons?courseId=${courseId}`);
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

  const oNhap =
    "w-full rounded-xl border border-slate-200 p-3 text-sm transition outline-none focus:border-blue-500";
  const oNhan = "mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-600";

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-4">
      {/* HEADER */}
      <div>
        <Link
          href={`/admin/lessons?courseId=${courseId}`}
          className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
        >
          <ArrowLeft size={16} /> Quay lại giáo trình
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
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
            <label className={oNhan}>
              <FileText size={14} className="text-blue-500" /> Tên bài học / Tiêu đề
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={changeHandler}
              placeholder="Ví dụ: Bài 1: Tổng quan cấu trúc và cài đặt môi trường"
              className={oNhap}
              required
            />
          </div>

          {/* Video: dán link hoặc tải tệp lên */}
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <label className={oNhan}>
              <Video size={14} className="text-blue-500" /> Video bài học
            </label>
            <input
              type="text"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={changeHandler}
              placeholder="Dán link: YouTube, Vimeo, Cloudinary..."
              className={oNhap}
              disabled={Boolean(videoFile)}
            />
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> hoặc tải tệp lên
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-blue-700"
            />
            {videoFile && (
              <p className="text-[11px] text-slate-500">
                Đã chọn <b>{videoFile.name}</b> — tệp này sẽ được dùng thay cho ô link ở
                trên.{" "}
                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  className="font-bold text-blue-600 underline"
                >
                  Bỏ chọn
                </button>
              </p>
            )}
          </div>

          {/* Tài liệu đính kèm */}
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <label className={oNhan}>
              <Paperclip size={14} className="text-blue-500" /> Tài liệu đính kèm
              <span className="font-normal text-slate-400">(không bắt buộc)</span>
            </label>
            <input
              type="text"
              name="documentUrl"
              value={formData.documentUrl}
              onChange={changeHandler}
              placeholder="Dán link tài liệu (PDF, slide, Google Drive...)"
              className={oNhap}
              disabled={Boolean(documentFile)}
            />
            <input
              type="file"
              onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)}
              className="w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-600 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-slate-700"
            />
            {documentFile && (
              <p className="text-[11px] text-slate-500">
                Đã chọn <b>{documentFile.name}</b>.{" "}
                <button
                  type="button"
                  onClick={() => setDocumentFile(null)}
                  className="font-bold text-blue-600 underline"
                >
                  Bỏ chọn
                </button>
              </p>
            )}
          </div>

          {/* Thời lượng và thứ tự */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={oNhan}>
                <Clock size={14} className="text-blue-500" /> Thời lượng (phút)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration || ""}
                onChange={changeHandler}
                min={0}
                placeholder="Ví dụ: 15"
                className={oNhap}
              />
            </div>
            <div>
              <label className={oNhan}>
                <ListOrdered size={14} className="text-blue-500" /> Thứ tự trong khóa
              </label>
              <input
                type="number"
                name="order"
                value={formData.order || ""}
                onChange={changeHandler}
                min={1}
                className={oNhap}
              />
            </div>
          </div>

          {/* Mô tả nội dung bài học */}
          <div>
            <label className={oNhan}>
              <AlignLeft size={14} className="text-blue-500" /> Tóm tắt nội dung bài học
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={changeHandler}
              rows={4}
              placeholder="Ghi chú những phần kiến thức cốt lõi học viên sẽ nhận được sau bài học này..."
              className={oNhap}
            />
          </div>

          {/* Nút bấm Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              href={`/admin/lessons?courseId=${courseId}`}
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
