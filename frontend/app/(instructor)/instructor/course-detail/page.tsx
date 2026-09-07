"use client";
/* eslint-disable @next/next/no-img-element --
   Anh xem truoc o trang nay lay tu URL.createObjectURL nen la URL blob: cuc bo.
   next/image khong toi uu duoc blob vi no phai di qua /_next/image tren may chu,
   nen dung the <img> o day moi dung. */

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Tag,
  Check,
  Image as ImageIcon,
  Video,
  Building2,
  AlertTriangle,
} from "lucide-react";
import { getCourseById, updateCourse, layIdChuDe } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { getProviders, ProviderData } from "@/src/services/provider";

function InstructorCourseDetailsPageContent() {
  const params = useSearchParams();
  const courseId = params.get("courseId") || "";

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

        // layIdChuDe nhan ca ba hinh dang cua category (mang id, mang doi tuong
        // da populate, hoac dang { $oid } cua ban ghi cu).
        const normalizedCategories: string[] = layIdChuDe(courseData.category);

        const normalizedProvider = courseData.provider
          ? typeof courseData.provider === "object"
            ? courseData.provider._id
            : courseData.provider
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
      } finally {
        setLoading(false);
      }
    };
    if (courseId) fetchCourseAndMetadata();
  }, [courseId]);

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
    if (formData.category.length === 0)
      return alert("Vui lòng chọn ít nhất một danh mục!");

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

  if (loading)
    return (
      <div className="animate-pulse py-20 text-center text-slate-500">
        Đang tải cấu trúc dữ liệu khóa học...
      </div>
    );

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-4">
      {/* HEADER */}
      <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/instructor/courses"
            className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Thiết Kế Khóa Học
          </h1>
        </div>

        {/* HIỂN THỊ TRẠNG THÁI KHÔNG CHO PHÉP ĐỔI TỰ DO */}
        <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600">
          Trạng thái:{" "}
          <span className={isPublished ? "text-emerald-600" : "text-amber-600"}>
            {isPublished ? "Đang Công Khai" : "Bản Nháp (Chờ duyệt)"}
          </span>
        </div>
      </div>

      {/* BANNER CẢNH BÁO */}
      <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
        <AlertTriangle size={16} className="shrink-0 text-amber-600" />
        <span>
          Bạn có quyền chỉnh sửa toàn bộ nội dung khóa học và bài giảng. Trạng thái hiển
          thị chính thức trên website sẽ do <strong>Admin kiểm duyệt</strong>.
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={updateCourseHandler} className="space-y-5">
          {/* UPLOAD THUMBNAIL */}
          <div className="max-w-md">
            <label className="mb-2 block flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <ImageIcon size={14} className="text-blue-500" /> Ảnh đại diện (Thumbnail)
            </label>
            <div className="relative mb-3 flex h-[180px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Thumbnail"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-xs text-slate-500">Chưa có ảnh đại diện</div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full cursor-pointer text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-blue-700"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Tiêu đề khóa học
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={changeHandler}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm transition outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Giá bán (VND)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={changeHandler}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm transition outline-none focus:border-blue-500"
                min={0}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Mô tả khóa học
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={changeHandler}
              rows={4}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Trình độ
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={changeHandler}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
              >
                <option value="beginner">Cơ bản (Beginner)</option>
                <option value="intermediate">Trung cấp (Intermediate)</option>
                <option value="advanced">Nâng cao (Advanced)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Building2 size={14} className="text-violet-500" /> Đơn vị cấp chứng chỉ
                liên kết
              </label>
              <select
                name="providerId"
                value={formData.providerId}
                onChange={changeHandler}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
              >
                <option value="">-- Hệ thống LMS cấp độc lập --</option>
                {providers.map((p) => (
                  <option key={p._id} value={p._id}>
                    {(p.type === "university" ? "[Trường] " : "[DN] ") + p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CHỌN DANH MỤC */}
          <div className="border-t pt-4">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Tag size={14} className="text-emerald-500" /> Danh mục phân loại
            </label>
            <div className="flex flex-wrap gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3">
              {categories.map((cat) => {
                const active = formData.category.includes(cat._id);
                return (
                  <button
                    type="button"
                    key={cat._id}
                    onClick={() => handleCategoryToggle(cat._id)}
                    className={`flex items-center gap-1 rounded-lg border px-3.5 py-2 text-xs font-semibold transition-all ${active ? "border-emerald-600 bg-emerald-600 text-white shadow-sm" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
                  >
                    {cat.name} {active && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* HÀNH ĐỘNG ĐIỀU HƯỚNG */}
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row">
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              Lưu thay đổi khóa học
            </button>

            {/* NÚT SANG TRANG QUẢN LÝ BÀI HỌC CỦA INSTRUCTOR */}
            <Link
              href={`/instructor/lessons?courseId=${courseId}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-800"
            >
              <Video size={14} /> Quản lý giáo trình bài học & Quiz
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
// Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
export default function InstructorCourseDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      }
    >
      <InstructorCourseDetailsPageContent />
    </Suspense>
  );
}
