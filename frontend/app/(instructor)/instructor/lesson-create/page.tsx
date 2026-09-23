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
  AlertCircle,
} from "lucide-react";

import { addLesson } from "@/src/services/lesson.api";
import { getCourseById } from "@/src/services/course";

import styles from "./page.module.scss";
function InstructorLessonCreatePageContent() {
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

  const oNhap = styles.input3;
  const oNhan = styles.row4;

  return (
    <div className={styles.container}>
      {/* BANNER THÔNG BÁO CHẾ ĐỘ INSTRUCTOR */}
      <div className={styles.card}>
        <AlertCircle size={18} className={styles.box} />
        <div className={styles.box2}>
          <p className={styles.text}>Chế độ Giảng viên (Instructor Mode)</p>
          <p className={styles.text2}>
            Bài học mới tạo sẽ nằm trong giáo trình bản nháp của bạn. Học viên chỉ có thể
            học khi khóa học tổng thể được Admin phê duyệt.
          </p>
        </div>
      </div>

      {/* HEADER */}
      <div>
        <Link href={`/instructor/lessons?courseId=${courseId}`} className={styles.box3}>
          <ArrowLeft size={16} /> Quay lại giáo trình
        </Link>
        <h1 className={styles.title}>Thêm Bài Học Mới</h1>
        <p className={styles.text3}>
          Thiết kế cấu trúc video bài giảng và nội dung đính kèm.
        </p>
      </div>

      {/* FORM NHẬP LIỆU */}
      <div className={styles.card2}>
        <form onSubmit={submitHandler} className={styles.form}>
          {/* Tiêu đề bài học */}
          <div>
            <label className={oNhan}>
              <FileText size={14} className={styles.box4} /> Tên bài học / Tiêu đề
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
          <div className={styles.card3}>
            <label className={oNhan}>
              <Video size={14} className={styles.box4} /> Video bài học
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
            <div className={styles.row}>
              <span className={styles.label} /> hoặc tải tệp lên
              <span className={styles.label} />
            </div>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
              className={styles.input}
            />
            {videoFile && (
              <p className={styles.text4}>
                Đã chọn <b>{videoFile.name}</b> — tệp này sẽ được dùng thay cho ô link ở
                trên.{" "}
                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  className={styles.button}
                >
                  Bỏ chọn
                </button>
              </p>
            )}
          </div>

          {/* Tài liệu đính kèm */}
          <div className={styles.card3}>
            <label className={oNhan}>
              <Paperclip size={14} className={styles.box4} /> Tài liệu đính kèm
              <span className={styles.label2}>(không bắt buộc)</span>
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
              className={styles.input2}
            />
            {documentFile && (
              <p className={styles.text4}>
                Đã chọn <b>{documentFile.name}</b>.{" "}
                <button
                  type="button"
                  onClick={() => setDocumentFile(null)}
                  className={styles.button}
                >
                  Bỏ chọn
                </button>
              </p>
            )}
          </div>

          {/* Thời lượng và thứ tự */}
          <div className={styles.grid}>
            <div>
              <label className={oNhan}>
                <Clock size={14} className={styles.box4} /> Thời lượng (phút)
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
                <ListOrdered size={14} className={styles.box4} /> Thứ tự trong khóa
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
              <AlignLeft size={14} className={styles.box4} /> Tóm tắt nội dung bài học
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
          <div className={styles.row2}>
            <Link
              href={`/instructor/lessons?courseId=${courseId}`}
              className={styles.box5}
            >
              Hủy bỏ
            </Link>
            <button type="submit" disabled={submitting} className={styles.button2}>
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
        <div className={styles.row3}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <InstructorLessonCreatePageContent />
    </Suspense>
  );
}
