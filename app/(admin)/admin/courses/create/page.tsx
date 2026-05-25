"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createCourse } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { getUsers, User } from "@/src/services/userApi"; 
import { ArrowLeft, Sparkles, User as UserIcon, Tag, Check, ImageIcon, Image as ImageIcon2 } from "lucide-react";
import Link from "next/link";

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

export default function CreateCoursePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    price: 0,
    category: [] as string[], 
    instructor: "", 
    level: "beginner",
  });

  // 🔥 1. BỔ SUNG STATE LƯU FILE ẢNH VÀ LINK XEM TRƯỚC (PREVIEW)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]); 
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [categoriesData, usersData] = await Promise.all([
          getCategories(),
          getUsers(), 
        ]);

        setCategories(categoriesData);
        
        const instructorList = (usersData || []).filter(
          (u: User) => u.role === "instructor"
        );
        setInstructors(instructorList);
      } catch (error) {
        console.error("Lỗi tải metadata hệ thống:", error);
      } finally {
        setLoadingData(false);
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

  const changeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === "price" ? Number(e.target.value) : e.target.value,
    });
  };

  // 🔥 2. HÀM XỬ LÝ KHI NGƯỜI DÙNG CHỌN FILE ẢNH
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      // Tạo đường dẫn ảo để hiển thị ảnh lên màn hình ngay lập tức
      setImagePreview(URL.createObjectURL(file));
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

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.category.length === 0) return alert("Vui lòng chọn ít nhất một danh mục!");
    if (!formData.instructor) return alert("Vui lòng gán giảng viên đảm nhiệm!");
    if (!thumbnailFile) return alert("Vui lòng tải lên ảnh bìa (Thumbnail) cho khóa học!");

    try {
      setLoading(true);

      // 🔥 3. CHUYỂN ĐỔI SANG FORMDATA ĐỂ GỬI ĐƯỢC FILE LÊN BACKEND
      const dataToSend = new FormData();
      dataToSend.append("title", formData.title);
      dataToSend.append("slug", formData.slug);
      dataToSend.append("description", formData.description);
      dataToSend.append("price", String(formData.price));
      dataToSend.append("level", formData.level);
      dataToSend.append("instructorId", formData.instructor); // Khớp với trường 'instructorId' ở Backend tạo

      // Duyệt mảng gửi lên nhiều category trùng key để Backend hứng mảng
      formData.category.forEach((id) => {
        dataToSend.append("category", id);
      });

      // Đính kèm file ảnh vật lý
      dataToSend.append("thumbnail", thumbnailFile);

      // Gọi API gửi khối FormData này đi
      const course = await createCourse(dataToSend as any);
      
      alert("Tạo khóa học thành công!");
      router.push(`/admin/courses`);
    } catch (error) {
      console.error(error);
      alert("Tạo khóa học thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="p-12 text-center font-medium text-slate-500 animate-pulse">Đang tải biểu mẫu...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <Link href="/admin/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition">
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>
      
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Thêm Khóa Học Mới</h1>
        <p className="text-slate-500 text-sm mt-1">Cấu hình thông tin cơ bản, chọn nhiều danh mục tags và phân bổ giảng viên.</p>
      </div>

      <form onSubmit={submitHandler} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 space-y-5">
        
        {/* 🔥 4. GIAO DIỆN KHU VỰC UPLOAD THUMBNAIL */}
        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-700 flex items-center gap-2">
            <ImageIcon size={16} className="text-blue-500" />
            Ảnh bìa khóa học (Thumbnail)
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300">
            {/* Khung hiển thị ảnh xem trước */}
            <div className="aspect-video md:col-span-1 bg-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative border border-slate-200">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-slate-400 p-2">
                  <ImageIcon2 size={24} className="mx-auto mb-1 opacity-60" />
                  <span className="text-[10px] block">Chưa có ảnh</span>
                </div>
              )}
            </div>

            {/* Nút bấm chọn file */}
            <div className="md:col-span-2">
              <input
                type="file"
                id="thumbnail-upload"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="thumbnail-upload"
                className="inline-flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all"
              >
                Chọn tệp ảnh từ máy tính
              </label>
              <p className="text-[11px] text-slate-400 mt-2">Chấp nhận định dạng định dạng JPG, PNG, WEBP. Tối đa 5MB.</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-700">Tiêu đề khóa học</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition"
            placeholder="Ví dụ: Lập trình Fullstack Next.js Masterclass"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-700">Đường dẫn SEO (Slug)</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: convertToSlug(e.target.value) })}
            className="w-full border border-slate-200 rounded-2xl p-4 text-xs font-mono bg-slate-50 text-slate-600 outline-none focus:border-blue-500 transition"
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-semibold text-slate-700">Mô tả tóm tắt</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={changeHandler}
            rows={4}
            className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition"
            placeholder="Mô tả nội dung cốt lõi của khóa học..."
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">Giá bán (VND)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={changeHandler}
              className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition"
              min={0}
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-slate-700">Trình độ học viên</label>
            <select
              name="level"
              value={formData.level}
              onChange={changeHandler}
              className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition bg-white"
            >
              <option value="beginner">Cơ bản (Beginner)</option>
              <option value="intermediate">Trung cấp (Intermediate)</option>
              <option value="advanced">Nâng cao (Advanced)</option>
            </select>
          </div>
        </div>

        {/* CHỌN GIẢNG VIÊN */}
        <div className="border-t pt-4">
          <label className="mb-2 text-sm font-semibold text-slate-700 flex items-center gap-2">
            <UserIcon size={16} className="text-blue-500" />
            Giảng viên phụ trách khóa học
          </label>
          <select
            name="instructor"
            value={formData.instructor}
            onChange={changeHandler}
            className="w-full border border-slate-200 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition bg-white text-slate-800"
            required
          >
            <option value="">-- Chọn Giảng viên phụ trách --</option>
            {instructors.map((ins) => (
              <option key={ins._id} value={ins._id}>
                {ins.name} ({ins.email})
              </option>
            ))}
          </select>
          {instructors.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">Lưu ý: Không tìm thấy tài khoản nào có vai trò Giảng viên (Instructor).</p>
          )}
        </div>

        {/* CHỌN NHIỀU CATEGORIES */}
        <div className="border-t pt-4">
          <label className="mb-3 text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Tag size={16} className="text-emerald-500" />
            Danh mục liên kết (Có thể chọn nhiều)
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

        <button
          disabled={loading}
          className={`w-full text-white px-6 py-4 rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2 ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/10"
          }`}
        >
          <Sparkles size={16} />
          {loading ? "Đang xử lý..." : "Tạo & Lưu Khóa Học"}
        </button>
      </form>
    </div>
  );
}