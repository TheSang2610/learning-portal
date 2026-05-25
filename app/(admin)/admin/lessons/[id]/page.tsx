"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
// Import các hàm API chuẩn từ file service
import { getLessonById, updateLesson } from "@/src/services/lesson.api";

export default function AdminEditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // Trạng thái khi đang bấm Save

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
        
        // Sử dụng hàm service mới cập nhật
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

  // Hàm xử lý gửi dữ liệu cập nhật lên Backend
  const saveHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert("Please enter a lesson title");

    try {
      setSubmitting(true);

      // Sử dụng hàm service cập nhật mới
      await updateLesson(lessonId, {
        title,
        content,
        videoUrl,
        order,
      });

      alert("Lesson updated successfully!");
      router.back(); // Quay ngược lại trang chi tiết khóa học
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Failed to update lesson");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-slate-500 font-medium">Loading lesson details...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Nút quay lại nhanh */}
      <button
        onClick={() => router.back()}
        className="mb-5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-2"
      >
        ← Back to Course Structure
      </button>

      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <h1 className="text-3xl font-bold mb-1 text-slate-800">Edit Lesson Content</h1>
        <p className="text-sm text-slate-400 mb-6">Modify details, video pathways, and course documentation.</p>
        
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

          <div>
            <label className="block mb-2 font-semibold text-sm text-slate-700">Video Resource URL</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition font-mono text-sm text-slate-600"
            />
          </div>

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

          <div className="flex gap-4 pt-4 border-t justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="border hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-2xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-2xl transition shadow-md shadow-blue-600/10 disabled:bg-slate-200 disabled:text-slate-400"
            >
              {submitting ? "Saving changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}