"use client";
/* eslint-disable @next/next/no-img-element --
   Anh xem truoc o trang nay lay tu URL.createObjectURL nen la URL blob: cuc bo.
   next/image khong toi uu duoc blob vi no phai di qua /_next/image tren may chu,
   nen dung the <img> o day moi dung. */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createCourse } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { getUsers, User } from "@/src/services/userApi";
// 🎯 BỔ SUNG: Import API lấy danh sách đối tác và icon Building2
import { getProviders, ProviderData } from "@/src/services/provider";
import {
  ArrowLeft,
  Sparkles,
  User as UserIcon,
  Tag,
  Check,
  ImageIcon,
  Image as ImageIcon2,
  Building2,
} from "lucide-react";
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
    providerId: "", // 🎯 BỔ SUNG: Lưu ID của đối tác/trường học được chọn
    level: "beginner",
  });

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]); // 🎯 BỔ SUNG: State lưu danh sách đối tác
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // 🎯 BỔ SUNG: Đồng bộ gọi thêm API lấy danh sách đối tác/trường học liên kết
        const [categoriesData, usersData, providersData] = await Promise.all([
          getCategories(),
          getUsers(),
          getProviders(),
        ]);

        setCategories(categoriesData);
        setProviders(providersData); // 🎯 BỔ SUNG: Lưu danh sách đối tác vào State

        const instructorList = (usersData || []).filter(
          (u: User) => u.role === "instructor",
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

  const changeHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "price" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
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
    if (formData.category.length === 0)
      return alert("Vui lòng chọn ít nhất một danh mục!");
    if (!formData.instructor) return alert("Vui lòng gán giảng viên đảm nhiệm!");
    if (!thumbnailFile)
      return alert("Vui lòng tải lên ảnh bìa (Thumbnail) cho khóa học!");

    try {
      setLoading(true);

      const dataToSend = new FormData();
      dataToSend.append("title", formData.title);
      dataToSend.append("slug", formData.slug);
      dataToSend.append("description", formData.description);
      dataToSend.append("price", String(formData.price));
      dataToSend.append("level", formData.level);
      dataToSend.append("instructorId", formData.instructor);
      dataToSend.append("providerId", formData.providerId); // 🎯 BỔ SUNG: Gửi thêm Provider ID lên Backend khi tạo mới

      formData.category.forEach((id) => {
        dataToSend.append("category", id);
      });

      dataToSend.append("thumbnail", thumbnailFile);

      await createCourse(dataToSend);

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
    return (
      <div className="animate-pulse p-12 text-center font-medium text-slate-500">
        Đang tải biểu mẫu...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft size={16} /> Quay lại danh sách
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Thêm Khóa Học Mới
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cấu hình thông tin cơ bản, chọn nhiều danh mục tags và phân bổ giảng viên.
        </p>
      </div>

      <form
        onSubmit={submitHandler}
        className="space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        {/* UPLOAD THUMBNAIL */}
        <div>
          <label className="mb-2 block flex items-center gap-2 text-sm font-semibold text-slate-700">
            <ImageIcon size={16} className="text-blue-500" />
            Ảnh bìa khóa học (Thumbnail)
          </label>

          <div className="grid grid-cols-1 items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 md:grid-cols-3">
            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-200 md:col-span-1">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="p-2 text-center text-slate-500">
                  <ImageIcon2 size={24} className="mx-auto mb-1 opacity-60" />
                  <span className="block text-[10px]">Chưa có ảnh</span>
                </div>
              )}
            </div>

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
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50"
              >
                Chọn tệp ảnh từ máy tính
              </label>
              <p className="mt-2 text-[11px] text-slate-500">
                Chấp nhận định dạng định dạng JPG, PNG, WEBP. Tối đa 5MB.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Tiêu đề khóa học
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            className="w-full rounded-2xl border border-slate-200 p-4 text-sm transition outline-none focus:border-blue-500"
            placeholder="Ví dụ: Lập trình Fullstack Next.js Masterclass"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Đường dẫn SEO (Slug)
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: convertToSlug(e.target.value) })
            }
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs text-slate-600 transition outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Mô tả tóm tắt
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={changeHandler}
            rows={4}
            className="w-full rounded-2xl border border-slate-200 p-4 text-sm transition outline-none focus:border-blue-500"
            placeholder="Mô tả nội dung cốt lõi của khóa học..."
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Giá bán (VND)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={changeHandler}
              className="w-full rounded-2xl border border-slate-200 p-4 text-sm transition outline-none focus:border-blue-500"
              min={0}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Trình độ học viên
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={changeHandler}
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm transition outline-none focus:border-blue-500"
            >
              <option value="beginner">Cơ bản (Beginner)</option>
              <option value="intermediate">Trung cấp (Intermediate)</option>
              <option value="advanced">Nâng cao (Advanced)</option>
            </select>
          </div>
        </div>

        {/* 🎯 BỔ SUNG: KHU VỰC CHỌN ĐỐI TÁC / TRƯỜNG HỌC LIÊN KẾT (Giống hệt bên Edit) */}
        <div className="border-t pt-4">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Building2 size={16} className="text-violet-500" />
            Đơn vị đối tác / Trường học liên kết
          </label>
          <select
            name="providerId"
            value={formData.providerId}
            onChange={changeHandler}
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 transition outline-none focus:border-blue-500"
          >
            <option value="">-- Hệ thống LMS cấp chứng chỉ độc lập --</option>
            {providers.map((prov) => (
              <option key={prov._id} value={prov._id}>
                {prov.type === "university" ? "[Trường học] " : "[Doanh nghiệp] "}{" "}
                {prov.name}
              </option>
            ))}
          </select>
        </div>

        {/* CHỌN GIẢNG VIÊN */}
        <div className="border-t pt-4">
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <UserIcon size={16} className="text-blue-500" />
            Giảng viên phụ trách khóa học
          </label>
          <select
            name="instructor"
            value={formData.instructor}
            onChange={changeHandler}
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-800 transition outline-none focus:border-blue-500"
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
            <p className="mt-1 text-xs text-amber-600">
              Lưu ý: Không tìm thấy tài khoản nào có vai trò Giảng viên (Instructor).
            </p>
          )}
        </div>

        {/* CHỌN NHIỀU CATEGORIES */}
        <div className="border-t pt-4">
          <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Tag size={16} className="text-emerald-500" />
            Danh mục liên kết (Có thể chọn nhiều)
          </label>
          <div className="flex flex-wrap gap-2.5 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            {categories.map((cat) => {
              const active = formData.category.includes(cat._id);
              return (
                <button
                  type="button"
                  key={cat._id}
                  onClick={() => handleCategoryToggle(cat._id)}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
                    active
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-600/10"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
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
          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold text-white transition ${
            loading
              ? "cursor-not-allowed bg-blue-400"
              : "bg-blue-600 shadow-lg shadow-blue-600/10 hover:bg-blue-700"
          }`}
        >
          <Sparkles size={16} />
          {loading ? "Đang xử lý..." : "Tạo & Lưu Khóa Học"}
        </button>
      </form>
    </div>
  );
}
