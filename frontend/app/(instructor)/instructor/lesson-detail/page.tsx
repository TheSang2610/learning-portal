"use client";

import { Suspense, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Trash2, Save, X } from "lucide-react";
// 🎯 Giữ nguyên các hàm xử lý dữ liệu từ Service chung
import { getLessonById, updateLesson, deleteLesson } from "@/src/services/lesson.api";

import styles from "./page.module.scss";
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
    return <div className={styles.box}>Đang tải thông tin bài học...</div>;
  }

  return (
    <div className={styles.container}>
      {/* BANNER CẢNH BÁO CHẾ ĐỘ INSTRUCTOR */}
      <div className={styles.card}>
        <AlertCircle size={18} className={styles.box2} />
        <div className={styles.box3}>
          <p className={styles.text}>Chế độ Giảng viên (Instructor Mode)</p>
          <p className={styles.text2}>
            Mọi chỉnh sửa hoặc xóa bài học tại đây sẽ trực tiếp thay đổi nội dung học liệu
            bản nháp của bạn.
          </p>
        </div>
      </div>

      {/* Nút quay lại liên kết trực tiếp với phân hệ Instructor */}
      <div>
        <button
          onClick={() => router.push(`/instructor/lessons?courseId=${courseId}`)}
          className={styles.button}
        >
          <ArrowLeft size={16} /> Quay lại giáo trình
        </button>
        <h1 className={styles.title}>Chỉnh Sửa Bài Học</h1>
        <p className={styles.text3}>
          Cập nhật chi tiết nội dung, thứ tự xuất hiện và luồng video.
        </p>
      </div>

      <div className={styles.card2}>
        {/* KHU VỰC THÔNG TIN TIÊU ĐỀ & NÚT XÓA */}
        <div className={styles.col}>
          <div>
            <h3 className={styles.subheading}>Thông tin bài học</h3>
            <p className={styles.text4}>
              ID bài học hiện tại: <span className={styles.label}>{lessonId}</span>
            </p>
          </div>

          {/* NÚT XÓA BÀI HỌC DÀNH CHO INSTRUCTOR */}
          <button
            type="button"
            disabled={deleting || submitting}
            onClick={deleteHandler}
            className={styles.button2}
          >
            <Trash2 size={14} />
            {deleting ? "Đang xóa..." : "Xóa bài học"}
          </button>
        </div>

        {/* FORM BIỂU MẪU CHỈNH SỬA */}
        <form onSubmit={saveHandler} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.box4}>
              <label className={styles.fieldLabel}>Tên bài học / Tiêu đề</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.box5}>
              <label className={styles.fieldLabel}>Thứ tự hiển thị</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className={styles.input}
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className={styles.fieldLabel}>Đường dẫn Video bài học (URL)</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Ví dụ: https://www.youtube.com/watch?v=..."
              className={styles.input2}
            />
          </div>

          <div>
            <label className={styles.fieldLabel}>Tóm tắt nội dung bài học</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              placeholder="Ghi chú nội dung cốt lõi, tài liệu đính kèm hoặc văn bản hướng dẫn bài học..."
              className={styles.textarea}
            />
          </div>

          {/* NHÓM NÚT ĐIỀU HƯỚNG FORM */}
          <div className={styles.row}>
            <button
              type="button"
              disabled={submitting || deleting}
              onClick={() => router.push(`/instructor/lessons?courseId=${courseId}`)}
              className={styles.button3}
            >
              <X size={14} /> Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={submitting || deleting}
              className={styles.button4}
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
        <div className={styles.row2}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <InstructorEditLessonPageContent />
    </Suspense>
  );
}
