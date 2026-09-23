"use client";

import { Suspense, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useSearchParams, useRouter } from "next/navigation";
import { getLessonById, updateLesson, deleteLesson } from "@/src/services/lesson.api";

import styles from "./page.module.scss";
function AdminEditLessonPageContent() {
  const params = useSearchParams();
  const router = useRouter();

  const courseId = params.get("courseId") || "";
  const lessonId = params.get("lessonId") || "";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // States quản lý form bài học
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>("");
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
        alert(getErrorMessage(error, "Failed to load lesson details"));
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLesson();
    }
  }, [lessonId]);

  // 🎯 Hàm xử lý chọn file video
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith("video/")) {
        alert("Please select a valid video file");
        return;
      }

      // Kiểm tra kích thước (giới hạn 500MB)
      if (file.size > 500 * 1024 * 1024) {
        alert("Video size must be less than 500MB");
        return;
      }

      setVideoFile(file);

      // Tạo preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);

      // Clear videoUrl nếu người dùng chọn upload file mới
      setVideoUrl("");
    }
  };

  // 🎯 Hàm xử lý xóa file video đã chọn
  const clearVideoFile = () => {
    setVideoFile(null);
    setVideoPreview("");
  };

  // 🎯 Hàm xử lý gửi dữ liệu cập nhật lên Backend
  const saveHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter a lesson title");

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("courseId", courseId);
      formData.append("title", title);
      formData.append("content", content);
      formData.append("order", String(order));

      // 🎯 Nếu có chọn file video mới, append vào FormData với key "video"
      if (videoFile) {
        formData.append("video", videoFile);
      } else if (videoUrl) {
        // 🎯 Nếu không upload file, dùng link video được dán
        formData.append("videoUrl", videoUrl);
      }

      await updateLesson(lessonId, formData);

      alert("Lesson updated successfully!");
      router.push(`/admin/course-detail?courseId=${courseId}`);
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, "Failed to update lesson"));
    } finally {
      setSubmitting(false);
    }
  };

  // 🎯 Hàm xử lý xóa bài học
  const deleteHandler = async () => {
    const isConfirmed = window.confirm(
      "⚠️ Bạn có chắc chắn muốn xóa bài học này?\nHành động này sẽ gỡ bài học khỏi khóa học và không thể hoàn tác!",
    );
    if (!isConfirmed) return;

    try {
      setDeleting(true);
      await deleteLesson(lessonId);
      alert("Lesson deleted successfully!");
      router.push(`/admin/course-detail?courseId=${courseId}`);
    } catch (error) {
      console.error(error);
      alert(getErrorMessage(error, "Failed to delete lesson"));
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className={styles.box}>Loading lesson details...</div>;
  }

  return (
    <div className={styles.container}>
      <button
        onClick={() => router.push(`/admin/course-detail?courseId=${courseId}`)}
        className={styles.button}
      >
        ← Back to Course Structure
      </button>

      <div className={styles.card}>
        <div className={styles.row}>
          <div>
            <h1 className={styles.title}>Edit Lesson Content</h1>
            <p className={styles.text}>
              Modify details, video pathways, and course documentation.
            </p>
          </div>

          <button
            type="button"
            disabled={deleting || submitting}
            onClick={deleteHandler}
            className={styles.button2}
          >
            {deleting ? "Deleting..." : "Delete Lesson"}
          </button>
        </div>

        <form onSubmit={saveHandler} className={styles.form}>
          <div className={styles.grid}>
            <div className={styles.box2}>
              <label className={styles.fieldLabel}>Lesson Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.box3}>
              <label className={styles.fieldLabel}>Order Position</label>
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

          {/* 🎯 PHẦN UPLOAD/DÁN LINK VIDEO */}
          <div className={styles.box4}>
            <div className={styles.box5}>
              <label className={styles.fieldLabel}>
                📹 Video Resource (Upload or Paste Link)
              </label>
              <p className={styles.text2}>
                Choose one: Upload MP4 file directly OR paste video URL
              </p>

              {/* 🎯 UPLOAD VIDEO FILE */}
              <div className={styles.card2}>
                <label className={styles.fieldLabel2}>📁 Upload Video File</label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleVideoFileChange}
                  disabled={submitting || deleting}
                  className={styles.input2}
                />
                <p className={styles.text3}>
                  ✓ Supported: MP4, WebM, OGG, MOV (Max 500MB)
                </p>
              </div>

              {/* 🎯 PREVIEW VIDEO FILE */}
              {videoPreview && (
                <div className={styles.card3}>
                  <p className={styles.text4}>✓ Video Selected</p>
                  <video src={videoPreview} controls className={styles.video} />
                  <button
                    type="button"
                    onClick={clearVideoFile}
                    className={styles.button3}
                  >
                    ✕ Remove this video
                  </button>
                </div>
              )}

              {/* 🎯 DÁN LINK VIDEO */}
              <div className={styles.card4}>
                <label className={styles.fieldLabel}>🔗 Or Paste Video URL</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={videoFile ? true : false}
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  className={`${styles.input5} ${
                    videoFile ? styles.input3 : styles.input4
                  }`}
                />
                {videoFile && (
                  <p className={styles.text5}>
                    💡 URL field disabled (file upload takes priority)
                  </p>
                )}
                {!videoFile && videoUrl && (
                  <p className={styles.text6}>✓ URL will be saved</p>
                )}
              </div>
            </div>
          </div>

          {/* TEXT CONTENT */}
          <div>
            <label className={styles.fieldLabel}>Text Content / Study Guide</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Write lesson notes, markdown guidelines, or text exercises here..."
              className={styles.textarea}
            />
          </div>

          {/* BUTTONS */}
          <div className={styles.row2}>
            <button
              type="button"
              disabled={submitting || deleting}
              onClick={() => router.push(`/admin/course-detail?courseId=${courseId}`)}
              className={styles.button4}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || deleting}
              className={styles.button5}
            >
              {submitting ? "💾 Saving..." : "✓ Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
// Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
export default function AdminEditLessonPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.row3}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <AdminEditLessonPageContent />
    </Suspense>
  );
}
