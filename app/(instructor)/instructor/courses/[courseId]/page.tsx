"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutGrid, ArrowLeft, Tag, Check, Image as ImageIcon, Video, Building2, AlertTriangle } from "lucide-react";
import { getCourseById, updateCourse } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { getProviders, ProviderData } from "@/src/services/provider";

export default function InstructorCourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    category: [] as string[],
    providerId: "",
    level: "",
  });

  const [isPublished, setIsPublished] = useState(false); 
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    const fetchCourseAndMetadata = async () => {
      try {
        const [courseData, categoriesData, providersData] = await Promise.all([
          getCourseById(courseId),
          getCategories(),
          getProviders(), 
        ]);
        
        setCategories(categoriesData);
        setProviders(providersData);
        setIsPublished(courseData.isPublished || false);

        let normalizedCategories: string[] = [];
        if (Array.isArray(courseData.category)) {
          normalizedCategories = courseData.category.map((cat: any) => typeof cat === "object" ? cat._id : cat);
        }

        const normalizedProvider = courseData.provider
          ? (typeof courseData.provider === "object" ? courseData.provider._id : courseData.provider)
          : "";

        setFormData({
          title: courseData.title || "",
          description: courseData.description || "",
          price: courseData.price || 0,
          category: normalizedCategories,
          providerId: normalizedProvider || "",
          level: courseData.level || "beginner",
        });

        if (courseData.thumbnail) {
          setPreviewUrl(courseData.thumbnail);
        }
      } catch (error) {
        console.error(error);
        alert("Lỗi đồng bộ dữ liệu hệ thống.");
      }   finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourseAndMetadata();
  }, [courseId]);

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === "price" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCategoryToggle = (catId: string) => {
    const current = [...formData.category];
    if (current.includes(catId)) {
      setFormData({ ...formData, category: current.filter((id) => id !== catId) });
    } else {
      setFormData({ ...formData, category: [...current, catId] });
    }
  };

  const updateCourseHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category.length === 0) return alert("Vui lòng chọn ít nhất một danh mục!");

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", String(formData.price));
      data.append("providerId", formData.providerId);
      data.append("level", formData.level);
      formData.category.forEach((id) => data.append("category", id));

      if (thumbnailFile) {
        data.append("thumbnail", thumbnailFile);
      }

      await updateCourse(courseId, data);
      alert("Cập nhật thông tin khóa học thành công! Chờ Admin phê duyệt.");
    } catch (error) {
      console.error(error);
      alert("Cập nhật thông tin thất bại.");
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Đang tải cấu trúc dữ liệu khóa học...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4 px-4">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <Link href="/instructor/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition mb-2">
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Thiết Kế Khóa Học</h1>
        </div>

        {/* HIỂN THỊ TRẠNG THÁI KHÔNG CHO PHÉP ĐỔI TỰ DO */}
        <div className="bg-slate-100 py-2 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
          Trạng thái: <span className={isPublished ? "text-emerald-600" : "text-amber-600"}>{isPublished ? "Đang Công Khai" : "Bản Nháp (Chờ duyệt)"}</span>
        </div>
      </div>

      {/* BANNER CẢNH BÁO */}
      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs flex items-center gap-2">
        <AlertTriangle size={16} className="text-amber-600 shrink-0" />
        <span>Bạn có quyền chỉnh sửa toàn bộ nội dung khóa học và bài giảng. Trạng thái hiển thị chính thức trên website sẽ do <strong>Admin kiểm duyệt</strong>.</span>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={updateCourseHandler} className="space-y-5">
          {/* UPLOAD THUMBNAIL */}
          <div className="max-w-md">
            <label className="block mb-2 text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-blue-500" /> Ảnh đại diện (Thumbnail)
            </label>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 mb-3 h-[180px] flex items-center justify-center">
              {previewUrl ? <img src={previewUrl} alt="Thumbnail" className="w-full h-full object-cover" /> : <div className="text-slate-400 text-xs">Chưa có ảnh đại diện</div>}
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 cursor-pointer" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-600">Tiêu đề khóa học</label>
              <input type="text" name="title" value={formData.title} onChange={changeHandler} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition" required />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-600">Giá bán (VND)</label>
              <input type="number" name="price" value={formData.price} onChange={changeHandler} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition" min={0} required />
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-600">Mô tả khóa học</label>
            <textarea name="description" value={formData.description} onChange={changeHandler} rows={4} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-600">Trình độ</label>
              <select name="level" value={formData.level} onChange={changeHandler} className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white">
                <option value="beginner">Cơ bản (Beginner)</option>
                <option value="intermediate">Trung cấp (Intermediate)</option>
                <option value="advanced">Nâng cao (Advanced)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 text-xs font-semibold text-slate-600 flex items-center gap-1.5"><Building2 size={14} className="text-violet-500" /> Đơn vị cấp chứng chỉ liên kết</label>
              <select name="providerId" value={formData.providerId} onChange={changeHandler} className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white">
                <option value="">-- Hệ thống LMS cấp độc lập --</option>
                {providers.map((p) => <option key={p._id} value={p._id}>{(p.type === "university" ? "[Trường] " : "[DN] ") + p.name}</option>)}
              </select>
            </div>
          </div>

          {/* CHỌN DANH MỤC */}
          <div className="border-t pt-4">
            <label className="mb-2 text-xs font-bold text-slate-600 flex items-center gap-1.5"><Tag size={14} className="text-emerald-500" /> Danh mục phân loại</label>
            <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {categories.map((cat) => {
                const active = formData.category.includes(cat._id);
                return (
                  <button type="button" key={cat._id} onClick={() => handleCategoryToggle(cat._id)} className={`flex items-center gap-1 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${active ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"}`}>
                    {cat.name} {active && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* HÀNH ĐỘNG ĐIỀU HƯỚNG */}
          <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition shadow-md">
              Lưu thay đổi khóa học
            </button>

            {/* NÚT SANG TRANG QUẢN LÝ BÀI HỌC CỦA INSTRUCTOR */}
            <Link
              href={`/instructor/courses/${courseId}/lessons`}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <Video size={14} /> Quản lý giáo trình bài học & Quiz
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}