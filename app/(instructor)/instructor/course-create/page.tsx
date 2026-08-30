"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Save, Building2, Tag, Check, ImageIcon, Image as ImageIcon2, Sparkles } from "lucide-react";
import Link from "next/link";
import { createCourse } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { getProviders, ProviderData } from "@/src/services/provider";

// Hàm hỗ trợ tạo link SEO (slug) sạch
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

export default function InstructorCreateCoursePage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: 0,
    category: [] as string[], // Đã chuyển sang dạng Mảng (Array string) giống Admin
    providerId: "", 
    level: "beginner",
  });
  
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Đồng bộ danh mục và đối tác từ hệ thống backend
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [categoriesData, providersData] = await Promise.all([
          getCategories(),
          getProviders()
        ]);
        setCategories(categoriesData || []);
        setProviders(providersData || []);

        // 💡 AUTO-FILL: Nếu Instructor đã cấu hình đối tác sẵn trong hồ sơ cá nhân, tự động điền providerId
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) {
          const parsedUser = JSON.parse(userInfo);
          if (parsedUser.provider) {
            const pId = typeof parsedUser.provider === "object" ? parsedUser.provider._id : parsedUser.provider;
            setFormData(prev => ({ ...prev, providerId: pId || "" }));
          }
        }
      } catch (error) {
        console.error("Lỗi đồng bộ metadata cấu hình:", error);
      } finally {
        setLoadingMetadata(false);
      }
    };
    fetchMetadata();
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      title: value,
      slug: convertToSlug(value),
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === "price" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 🎯 ĐỒNG BỘ: Hàm xử lý chọn nhiều danh mục (Multi-select Tags) tương tự Admin
  const handleCategoryToggle = (catId: string) => {
    const current = [...formData.category];
    if (current.includes(catId)) {
      setFormData({ ...formData, category: current.filter((id) => id !== catId) });
    } else {
      setFormData({ ...formData, category: [...current, catId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category.length === 0) return alert("Vui lòng chọn ít nhất một danh mục phân loại!");
    if (!thumbnail) return alert("Vui lòng đính kèm ảnh bìa khóa học!");

    try {
      setLoading(true);

      // 1. Khởi tạo đối tượng FormData sạch
      const dataToSend = new FormData();
      dataToSend.append("title", formData.title);
      dataToSend.append("slug", formData.slug);
      dataToSend.append("description", formData.description);
      dataToSend.append("price", String(formData.price));
      dataToSend.append("level", formData.level);
      dataToSend.append("providerId", formData.providerId);
      dataToSend.append("thumbnail", thumbnail);

      // 2. 🎯 ĐỒNG BỘ: Sử dụng vòng lặp forEach gửi mảng giống hệt bên Admin
      formData.category.forEach((id) => {
        dataToSend.append("category", id);
      });

      // 3. 🎯 THAY ĐỔI QUAN TRỌNG: Dùng hàm dịch vụ createCourse thay cho fetch thủ công
      // Hàm này đồng bộ cơ chế xử lý token, URL đích (cổng 5000) y hệt trang Admin
      const result = await createCourse(dataToSend as any);
      
      alert("Khởi tạo cấu trúc khóa học thành công! (Trạng thái: Bản nháp chờ duyệt)");
      router.push(`/instructor/course-detail?courseId=${result._id}`);

    } catch (err) {
      console.error("Lỗi khởi tạo phía Instructor:", err);
      alert("Xử lý biểu mẫu thất bại. Vui lòng kiểm tra lại kết nối hoặc dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingMetadata) {
    return <div className="text-center py-20 text-slate-500 animate-pulse text-sm font-medium">Đang đồng bộ biểu mẫu hệ thống...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <div className="flex items-center gap-3">
        <Link href="/instructor/courses" className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h3 className="text-xl font-bold text-slate-800">Tạo khóa học mới</h3>
          <p className="text-sm text-slate-500">Bước 1: Thiết lập các thông tin hiển thị cơ bản bên ngoài.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-8 space-y-5 shadow-sm">
        
        {/* THUMBNAIL UPLOAD (Giao diện đồng bộ bản mới gọn gàng hơn) */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-700 flex items-center gap-2">
            <ImageIcon size={16} className="text-blue-500" />
            Ảnh bìa khóa học (Thumbnail) *
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300">
            <div className="aspect-video md:col-span-1 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative border border-slate-200">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-slate-500 p-2">
                  <ImageIcon2 size={24} className="mx-auto mb-1 opacity-60" />
                  <span className="text-[10px] block">Khung xem trước</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <input
                type="file"
                id="instructor-thumb-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="instructor-thumb-upload"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all"
              >
                Chọn tệp ảnh từ máy tính
              </label>
              <p className="text-[11px] text-slate-500 mt-2">Hỗ trợ định dạng JPG, PNG, WEBP. Tỉ lệ khuyên dùng 16:9.</p>
            </div>
          </div>
        </div>

        {/* TÊN KHÓA HỌC */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Tiêu đề khóa học *</label>
          <input
            type="text"
            required
            name="title"
            placeholder="Ví dụ: Lập trình Fullstack Next.js Masterclass"
            className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition"
            value={formData.title}
            onChange={handleTitleChange}
          />
        </div>

        {/* ĐƯỜNG DẪN SEO SLUG */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Đường dẫn SEO (Slug)</label>
          <input
            type="text"
            required
            name="slug"
            className="w-full border border-slate-200 rounded-2xl p-4 text-xs font-mono bg-slate-50 text-slate-600 outline-none focus:border-blue-500 transition"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: convertToSlug(e.target.value) })}
          />
        </div>

        {/* GIÁ CẢ & TRÌNH ĐỘ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Giá bán (VND) *</label>
            <input
              type="number"
              required
              name="price"
              min="0"
              className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition"
              value={formData.price}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Trình độ học viên hướng tới</label>
            <select
              name="level"
              className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition bg-white text-slate-800"
              value={formData.level}
              onChange={handleInputChange}
            >
              <option value="beginner">Cơ bản (Beginner)</option>
              <option value="intermediate">Trung cấp (Intermediate)</option>
              <option value="advanced">Nâng cao (Advanced)</option>
            </select>
          </div>
        </div>

        {/* ĐỐI TÁC CẤP CHỨNG CHỈ */}
        <div className="border-t pt-4 space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Building2 size={16} className="text-violet-500" />
            Đơn vị đối tác / Trường học liên kết công tác
          </label>
          <select
            name="providerId"
            className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition bg-white text-slate-800"
            value={formData.providerId}
            onChange={handleInputChange}
          >
            <option value="">-- Hệ thống LMS cấp độc lập --</option>
            {providers.map((prov) => (
              <option key={prov._id} value={prov._id}>
                {prov.type === "university" ? "[Trường học] " : "[Doanh nghiệp] "} {prov.name}
              </option>
            ))}
          </select>
        </div>

        {/* MÔ TẢ TỔNG QUAN */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">Mô tả tóm tắt</label>
          <textarea
            rows={4}
            name="description"
            placeholder="Mô tả nội dung cốt lõi của khóa học..."
            className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        {/* 🎯 ĐỒNG BỘ: CHỌN NHIỀU CATEGORIES (Multi-select y hệt Admin) */}
        <div className="border-t pt-4">
          <label className="mb-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Tag size={16} className="text-emerald-500" />
            Danh mục liên kết học thuật (Có thể chọn nhiều) *
          </label>
          <div className="flex flex-wrap gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {categories.map((cat) => {
              const active = formData.category.includes(cat._id);
              return (
                <button
                  type="button"
                  key={cat._id}
                  onClick={() => handleCategoryToggle(cat._id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    active
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/10"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {cat.name}
                  {active && <Check size={14} className="stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* NÚT SUBMIT ĐỒNG BỘ STYLE */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white px-6 py-4 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/10"
            }`}
          >
            <Sparkles size={16} />
            {loading ? "Đang xử lý..." : "Khởi tạo & Tiếp tục xây dựng giáo trình"}
          </button>
        </div>
      </form>
    </div>
  );
}