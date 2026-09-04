"use client";

import { Suspense, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useSearchParams, useRouter } from "next/navigation";
import { getLessonById, updateLesson, deleteLesson } from "@/src/services/lesson.api";

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
    return (
      <div className="p-20 text-center font-medium text-slate-500">
        Loading lesson details...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl py-10">
      <button
        onClick={() => router.push(`/admin/course-detail?courseId=${courseId}`)}
        className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
      >
        ← Back to Course Structure
      </button>

      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold text-slate-800">
              Edit Lesson Content
            </h1>
            <p className="text-sm text-slate-500">
              Modify details, video pathways, and course documentation.
            </p>
          </div>

          <button
            type="button"
            disabled={deleting || submitting}
            onClick={deleteHandler}
            className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400"
          >
            {deleting ? "Deleting..." : "Delete Lesson"}
          </button>
        </div>

        <form onSubmit={saveHandler} className="space-y-5">
          <div className="grid grid-cols-4 gap-5">
            <div className="col-span-3">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Lesson Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border p-4 transition outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Order Position
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full rounded-2xl border p-4 transition outline-none focus:border-blue-500"
                min={1}
                required
              />
            </div>
          </div>

          {/* 🎯 PHẦN UPLOAD/DÁN LINK VIDEO */}
          <div className="rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 p-6">
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                📹 Video Resource (Upload or Paste Link)
              </label>
              <p className="mb-4 text-xs text-slate-500">
                Choose one: Upload MP4 file directly OR paste video URL
              </p>

              {/* 🎯 UPLOAD VIDEO FILE */}
              <div className="mb-4 rounded-xl border border-blue-200 bg-white p-4">
                <label className="mb-3 block text-sm font-semibold text-slate-700">
                  📁 Upload Video File
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleVideoFileChange}
                  disabled={submitting || deleting}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700 disabled:opacity-50"
                />
                <p className="mt-2 text-xs text-slate-500">
                  ✓ Supported: MP4, WebM, OGG, MOV (Max 500MB)
                </p>
              </div>

              {/* 🎯 PREVIEW VIDEO FILE */}
              {videoPreview && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-green-700">
                    ✓ Video Selected
                  </p>
                  <video
                    src={videoPreview}
                    controls
                    className="max-h-48 w-full rounded-lg bg-black object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearVideoFile}
                    className="mt-3 text-sm font-semibold text-red-600 underline hover:text-red-700"
                  >
                    ✕ Remove this video
                  </button>
                </div>
              )}

              {/* 🎯 DÁN LINK VIDEO */}
              <div className="rounded-xl border border-amber-200 bg-white p-4">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  🔗 Or Paste Video URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={videoFile ? true : false}
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  className={`w-full rounded-xl border p-3 font-mono text-sm transition outline-none focus:border-blue-500 ${
                    videoFile
                      ? "cursor-not-allowed bg-slate-100 text-slate-500"
                      : "text-slate-600"
                  }`}
                />
                {videoFile && (
                  <p className="mt-2 text-xs text-amber-600">
                    💡 URL field disabled (file upload takes priority)
                  </p>
                )}
                {!videoFile && videoUrl && (
                  <p className="mt-2 text-xs text-green-600">✓ URL will be saved</p>
                )}
              </div>
            </div>
          </div>

          {/* TEXT CONTENT */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Text Content / Study Guide
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Write lesson notes, markdown guidelines, or text exercises here..."
              className="w-full rounded-2xl border p-4 leading-relaxed text-slate-700 transition outline-none focus:border-blue-500"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-4 border-t pt-4">
            <button
              type="button"
              disabled={submitting || deleting}
              onClick={() => router.push(`/admin/course-detail?courseId=${courseId}`)}
              className="rounded-2xl border px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || deleting}
              className="rounded-2xl bg-blue-600 px-8 py-3.5 font-semibold text-white shadow-md shadow-blue-600/10 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      }
    >
      <AdminEditLessonPageContent />
    </Suspense>
  );
}
