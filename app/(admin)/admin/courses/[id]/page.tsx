"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCourseById, updateCourse } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { addLesson } from "@/src/services/lesson.api";

interface Lesson {
  _id: string;
  title: string;
  content?: string;
  videoUrl?: string;
  order?: number;
}

// Hàm helper biến đổi Tiếng Việt thành Slug chuẩn SEO
const convertToSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export default function AdminCourseDetailsPage() {
  const params = useParams();
  const courseId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Đã bổ sung thêm thuộc tính slug vào formData
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: 0,
    category: "",
    level: "",
    isPublished: false,
  });

  const [lessonData, setLessonData] = useState({
    title: "",
    content: "",
    videoUrl: "",
    order: 1,
  });

  const fetchCourseAndCategories = async () => {
    try {
      const [courseData, categoriesData] = await Promise.all([
        getCourseById(courseId),
        getCategories(),
      ]);

      setCategories(categoriesData);
      setCourse(courseData);

      setFormData({
        title: courseData.title || "",
        slug: courseData.slug || "", // Nhận dữ liệu slug hiện tại từ Backend
        description: courseData.description || "",
        price: courseData.price || 0,
        // Hết lỗi đỏ: TypeScript đã hiểu category có thể là Object
        category: courseData.category 
          ? (typeof courseData.category === "object" ? courseData.category._id : courseData.category)
          : "", 
        level: courseData.level || "beginner",
        isPublished: courseData.isPublished || false,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to load component data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseAndCategories();
  }, [courseId]);

  // Xử lý khi Admin thay đổi Title -> Tự động sinh Slug đi kèm
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      title: value,
      slug: convertToSlug(value),
    });
  };

  const updateCourseHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await updateCourse(courseId, formData);
      setCourse(updated);
      alert("Course updated successfully!");
    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };

  const addLessonHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonData.title) return alert("Please enter a lesson title");

    try {
      await addLesson({
        courseId,
        title: lessonData.title,
        content: lessonData.content,
        videoUrl: lessonData.videoUrl,
        order: lessonData.order,
      });

      alert("Lesson added successfully!");
      setLessonData({ title: "", content: "", videoUrl: "", order: course?.lessons?.length + 2 || 1 });
      
      const updatedCourse = await getCourseById(courseId);
      setCourse(updatedCourse);
    } catch (error) {
      console.error(error);
      alert("Add lesson failed");
    }
  };

  if (loading) {
    return <div className="text-center py-20 font-medium">Loading details...</div>;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold">Course Details</h1>
        <p className="text-gray-500 mt-2">Edit course settings and build curriculum</p>
      </div>

      {/* BIỂU MẪU CẬP NHẬT KHÓA HỌC */}
      <div className="bg-white rounded-3xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold mb-6">General Information</h2>
        <form onSubmit={updateCourseHandler} className="space-y-5">
          {/* FIELD: TITLE */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange} // Gọi hàm thay đổi tự động điền slug
              className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          {/* FIELD MỚI THÊM: SLUG */}
          <div>
            <label className="block mb-2 font-medium text-slate-700">Course Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: convertToSlug(e.target.value) })}
              className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition font-mono text-sm bg-slate-50 text-slate-600"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          <div className="grid grid-cols-4 gap-5">
            <div>
              <label className="block mb-2 font-medium text-slate-700">Price (VND)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition"
                min={0}
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">Category</label>
              <select
                value={formData.category} 
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition bg-white text-slate-800"
                required
              >
                <option value="">-- Select Category --</option>
                {categories && categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition bg-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">Visibility</label>
              <select
                value={String(formData.isPublished)}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === "true" })}
                className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition bg-white"
              >
                <option value="false">Draft (Hidden)</option>
                <option value="true">Published (Public)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3.5 rounded-2xl transition"
          >
            Save Course Settings
          </button>
        </form>
      </div>

      {/* THÊM BÀI HỌC MỚI */}
      <div className="bg-white rounded-3xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold mb-6">Add New Lesson</h2>
        <form onSubmit={addLessonHandler} className="space-y-5">
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2">
              <input
                type="text"
                placeholder="Lesson title"
                value={lessonData.title}
                onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Order"
                value={lessonData.order}
                onChange={(e) => setLessonData({ ...lessonData, order: Number(e.target.value) })}
                className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition"
                min={1}
              />
            </div>
          </div>

          <textarea
            placeholder="Lesson content summary or text details..."
            value={lessonData.content}
            onChange={(e) => setLessonData({ ...lessonData, content: e.target.value })}
            rows={3}
            className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition"
          />

          <input
            type="text"
            placeholder="Video URL (e.g., https://example.com/video.mp4)"
            value={lessonData.videoUrl}
            onChange={(e) => setLessonData({ ...lessonData, videoUrl: e.target.value })}
            className="w-full border rounded-2xl p-4 outline-none focus:border-blue-500 transition"
          />

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3.5 rounded-2xl transition"
          >
            Publish Lesson
          </button>
        </form>
      </div>

      {/* DANH SÁCH BÀI HỌC HIỆN TẠI */}
      <div className="bg-white rounded-3xl shadow-sm border p-8">
        <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
        <div className="space-y-3">
          {course?.lessons?.length > 0 ? (
            [...course.lessons]
              .sort((a: Lesson, b: Lesson) => (a.order || 0) - (b.order || 0))
              .map((lesson: Lesson) => (
                <div
                  key={lesson._id}
                  className="border border-slate-100 rounded-2xl p-5 flex items-center justify-between hover:bg-slate-50/50 transition bg-slate-50/20"
                >
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">
                      {lesson.order}. {lesson.title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1 font-mono truncate max-w-xl">
                      {lesson.videoUrl || "📄 No video attached (Text/Document only)"}
                    </p>
                  </div>
                  
                  <a
                    href={`/admin/lessons/${lesson._id}?courseId=${courseId}`}
                    className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-sm"
                  >
                    Edit Content
                  </a>
                </div>
              ))
          ) : (
            <p className="text-slate-400 py-4">No lessons added to this curriculum yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}