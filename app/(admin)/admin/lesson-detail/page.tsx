"use client";


import { Suspense, useEffect, useState } from "react";
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
      } catch (error: any) {
        console.error(error);
        alert(error.message || "Failed to load lesson details");
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
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file');
        return;
      }
      
      // Kiểm tra kích thước (giới hạn 500MB)
      if (file.size > 500 * 1024 * 1024) {
        alert('Video size must be less than 500MB');
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

      // 🎯 LẤY LẠI DỮ LIỆU LESSON MỚI ĐỂ CẬP NHẬT VIDEOURL TỪ CLOUDINARY
      try {
        const updatedLesson = await getLessonById(lessonId);
        console.log("✅ Updated lesson with new videoUrl:", updatedLesson.videoUrl);
      } catch (refreshErr) {
        console.warn("⚠️ Could not refresh lesson data, but save was successful:", refreshErr);
      }

      alert("Lesson updated successfully!");
      router.push(`/admin/course-detail?courseId=${courseId}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to update lesson");
    } finally {
      setSubmitting(false);
    }
  };

  // 🎯 Hàm xử lý xóa bài học
  const deleteHandler = async () => {
    const isConfirmed = window.confirm(
      "⚠️ Bạn có chắc chắn muốn xóa bài học này?\nHành động này sẽ gỡ bài học khỏi khóa học và không thể hoàn tác!"
    );
    if (!isConfirmed) return;

    try {
      setDeleting(true);
      await deleteLesson(lessonId);
      alert("Lesson deleted successfully!");
      router.push(`/admin/course-detail?courseId=${courseId}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to delete lesson");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-slate-500 font-medium">Loading lesson details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <button
        onClick={() => router.push(`/admin/course-detail?courseId=${courseId}`)}
        className="mb-5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-2"
      >
        ← Back to Course Structure
      </button>

      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-slate-800">Edit Lesson Content</h1>
            <p className="text-sm text-slate-500">Modify details, video pathways, and course documentation.</p>
          </div>
          
          <button
            type="button"
            disabled={deleting || submitting}
            onClick={deleteHandler}
            className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-4 py-2 rounded-xl text-sm transition disabled:bg-slate-100 disabled:text-slate-400"
          >
            {deleting ? "Deleting..." : "Delete Lesson"}
          </button>
        </div>
        
        <form onSubmit={saveHandler} className="space-y-5">
          <div className="grid grid-cols-4 gap-5">
            <div className="col-span-3">
              <label className="block mb-2 font-semibold text-sm text-slate-700">Lesson Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition"
                required
              />
            </div>

            <div className="col-span-1">
              <label className="block mb-2 font-semibold text-sm text-slate-700">Order Position</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition"
                min={1}
                required
              />
            </div>
          </div>

          {/* 🎯 PHẦN UPLOAD/DÁN LINK VIDEO */}
          <div className="border-2 border-dashed border-blue-300 rounded-2xl p-6 bg-blue-50">
            <div className="mb-5">
              <label className="block mb-2 font-semibold text-sm text-slate-700">
                📹 Video Resource (Upload or Paste Link)
              </label>
              <p className="text-xs text-slate-500 mb-4">
                Choose one: Upload MP4 file directly OR paste video URL
              </p>

              {/* 🎯 UPLOAD VIDEO FILE */}
              <div className="mb-4 p-4 border border-blue-200 rounded-xl bg-white">
                <label className="block mb-3 font-semibold text-sm text-slate-700">
                  📁 Upload Video File
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleVideoFileChange}
                  disabled={submitting || deleting}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
                />
                <p className="text-xs text-slate-500 mt-2">
                  ✓ Supported: MP4, WebM, OGG, MOV (Max 500MB)
                </p>
              </div>

              {/* 🎯 PREVIEW VIDEO FILE */}
              {videoPreview && (
                <div className="mb-4 p-4 border border-green-200 rounded-xl bg-green-50">
                  <p className="text-sm font-semibold text-green-700 mb-3">✓ Video Selected</p>
                  <video
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg max-h-48 object-cover bg-black"
                  />
                  <button
                    type="button"
                    onClick={clearVideoFile}
                    className="mt-3 text-sm text-red-600 hover:text-red-700 font-semibold underline"
                  >
                    ✕ Remove this video
                  </button>
                </div>
              )}

              {/* 🎯 DÁN LINK VIDEO */}
              <div className="p-4 border border-amber-200 rounded-xl bg-white">
                <label className="block mb-2 font-semibold text-sm text-slate-700">
                  🔗 Or Paste Video URL
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  disabled={videoFile ? true : false}
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                  className={`w-full border rounded-xl p-3 outline-none focus:border-blue-500 transition font-mono text-sm ${
                    videoFile ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'text-slate-600'
                  }`}
                />
                {videoFile && (
                  <p className="text-xs text-amber-600 mt-2">
                    💡 URL field disabled (file upload takes priority)
                  </p>
                )}
                {!videoFile && videoUrl && (
                  <p className="text-xs text-green-600 mt-2">✓ URL will be saved</p>
                )}
              </div>
            </div>
          </div>

          {/* TEXT CONTENT */}
          <div>
            <label className="block mb-2 font-semibold text-sm text-slate-700">Text Content / Study Guide</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Write lesson notes, markdown guidelines, or text exercises here..."
              className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition text-slate-700 leading-relaxed"
            />
          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 pt-4 border-t justify-end">
            <button
              type="button"
              disabled={submitting || deleting}
              onClick={() => router.push(`/admin/course-detail?courseId=${courseId}`)}
              className="border hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-2xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || deleting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-2xl transition shadow-md shadow-blue-600/10 disabled:bg-slate-300 disabled:cursor-not-allowed"
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
