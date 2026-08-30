"use client";


import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCourseById, updateCourse, updateCoursePublishStatus } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { getUsers, User } from "@/src/services/userApi";
import { getProviders, ProviderData } from "@/src/services/provider";
import { LayoutGrid, ArrowLeft, User as UserIcon, Tag, Check, Image as ImageIcon, Eye, EyeOff, Video, Building2 } from "lucide-react";
import Link from "next/link";

// 🎯 HÀM CHUYỂN ĐỔI SLUG ĐỒNG BỘ TỪ TRANG CREATE
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

function AdminCourseDetailsPageContent() {
  const params = useSearchParams();
  const courseId = params.get("courseId") || "";

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [categories, setCategories] = useState<Category[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]); 

  const [formData, setFormData] = useState({
    title: "",
    slug: "", // 🎯 Đảm bảo slug có trong cấu trúc state form
    description: "",
    price: 0,
    category: [] as string[],
    instructorId: "",
    providerId: "", 
    level: "",
  });

  const [isPublished, setIsPublished] = useState(false); 
  const [publishingLoading, setPublishingLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    const fetchCourseAndMetadata = async () => {
      try {
        const userFake: User = { _id: "current_user_id", name: "Quản trị viên", email: "admin@gmail.com", role: "admin" }; 
        setCurrentUser(userFake);

        const [courseData, categoriesData, usersData, providersData] = await Promise.all([
          getCourseById(courseId),
          getCategories(),
          getUsers(),
          getProviders(), 
        ]);
        
        setCategories(categoriesData);
        setProviders(providersData); 

        const instructorList = (usersData || []).filter((u: User) => u.role === "instructor");
        setInstructors(instructorList);

        let normalizedCategories: string[] = [];
        if (Array.isArray(courseData.category)) {
          normalizedCategories = courseData.category.map((cat: any) => typeof cat === "object" ? cat._id : cat);
        }

        const normalizedInstructor = courseData.instructor 
          ? (typeof courseData.instructor === "object" ? courseData.instructor._id : courseData.instructor)
          : "";

        const normalizedProvider = courseData.provider
          ? (typeof courseData.provider === "object" ? courseData.provider._id : courseData.provider)
          : "";

        setFormData({
          title: courseData.title || "",
          slug: courseData.slug || convertToSlug(courseData.title || ""), // 🎯 Đồng bộ nạp slug cũ từ DB
          description: courseData.description || "",
          price: courseData.price || 0,
          category: normalizedCategories,
          instructorId: normalizedInstructor,
          providerId: normalizedProvider || "", 
          level: courseData.level || "beginner",
        });

        setIsPublished(courseData.isPublished || false);

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
    fetchCourseAndMetadata();
  }, [courseId]);

  // 🎯 TỰ ĐỘNG NHẢY SLUG REALTIME KHI THAY ĐỔI TIÊU ĐỀ
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
      data.append("slug", formData.slug); // 🎯 ĐÍNH KÈM SLUG ĐỂ KHÔNG BỊ BÁO LỖI 500 VALIDATION
      data.append("description", formData.description);
      data.append("price", String(formData.price));
      data.append("instructorId", formData.instructorId);
      data.append("providerId", formData.providerId); 
      data.append("level", formData.level);

      formData.category.forEach((id) => data.append("category", id));

      if (thumbnailFile) {
        data.append("thumbnail", thumbnailFile);
      }

      await updateCourse(courseId, data);
      alert("Cập nhật thông tin khóa học thành công!");
    } catch (error) {
      console.error(error);
      alert("Cập nhật thông tin thất bại.");
    }
  };

  const togglePublishStatus = async () => {
    if (currentUser?.role !== "admin") {
      return alert("Hành động bị từ chối: Chỉ quản trị viên tối cao (Admin) mới có quyền thay đổi trạng thái hiển thị khóa học!");
    }

    try {
      setPublishingLoading(true);
      const nextStatus = !isPublished;
      await updateCoursePublishStatus(courseId, nextStatus);
      setIsPublished(nextStatus);
      alert(`Đã chuyển khóa học sang trạng thái: ${nextStatus ? "CÔNG KHAI" : "BẢN NHÁP"}`);
    } catch (error) {
      console.error(error);
      alert("Lỗi phân quyền hoặc đường truyền không thể cập nhật trạng thái xuất bản.");
    } finally {
      setPublishingLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 animate-pulse">Đang tải cấu trúc dữ liệu khóa học...</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-4">
        <div>
          <Link href="/admin/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition mb-2">
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Studio Quản Lý Khóa Học</h1>
        </div>

        <div className="bg-slate-100 p-2 rounded-2xl flex items-center gap-3 border border-slate-200">
          <div className="pl-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Trạng thái hiển thị</p>
            <p className={`text-xs font-bold ${isPublished ? "text-emerald-600" : "text-amber-600"}`}>
              {isPublished ? "Đang Công Khai" : "Bản Nháp (Ẩn)"}
            </p>
          </div>
          
          <button
            type="button"
            onClick={togglePublishStatus}
            disabled={publishingLoading || currentUser?.role !== "admin"}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              currentUser?.role !== "admin"
                ? "bg-slate-200 text-slate-500 cursor-not-allowed" 
                : isPublished
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            }`}
          >
            {isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
            {publishingLoading ? "Đang xử lý..." : isPublished ? "Gỡ bài xuống (Draft)" : "Phát hành (Publish)"}
          </button>
        </div>
      </div>

      {currentUser?.role !== "admin" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 text-xs font-medium">
          ⚠️ Bạn đang đăng nhập dưới quyền **Giảng viên (Instructor)**. Bạn có toàn quyền sửa đổi nội dung bài giảng, ảnh bìa và giá bán, nhưng quyền **Xét duyệt công khai** khóa học lên trang chủ thuộc về Admin.
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
          <LayoutGrid size={18} className="text-blue-500" />
          Thông tin chi tiết cấu hình khóa học
        </h2>
        
        <form onSubmit={updateCourseHandler} className="space-y-5">
          {/* UPLOAD THUMBNAIL */}
          <div className="max-w-md">
            <label className="block mb-2 text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <ImageIcon size={14} className="text-blue-500" />
              Ảnh đại diện khóa học (Thumbnail)
            </label>
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 mb-3 max-h-[180px] flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Course thumbnail" className="w-full h-full object-cover" />
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">Chưa có ảnh đại diện</div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 🎯 Ô NHẬP TIÊU ĐỀ: Sử dụng handleTitleChange để tự sinh slug */}
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-600">Tiêu đề khóa học</label>
              <input type="text" name="title" value={formData.title} onChange={handleTitleChange} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition" required />
            </div>
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-600">Giá bán (VND)</label>
              <input type="number" name="price" value={formData.price} onChange={changeHandler} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-blue-500 transition" min={0} required />
            </div>
          </div>

          {/* 🎯 Ô HIỂN THỊ SLUG ĐƯỢC THÊM VÀO GIỐNG BÊN TRANG CREATE */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-600">Đường dẫn SEO (Slug)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: convertToSlug(e.target.value) })}
              className="w-full border border-slate-200 rounded-xl p-3 text-xs font-mono bg-slate-50 text-slate-600 outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-600">Mô tả chi tiết khóa học</label>
            <textarea name="description" value={formData.description} onChange={changeHandler} rows={4} className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-xs font-semibold text-slate-600">Trình độ học viên hướng tới</label>
              <select name="level" value={formData.level} onChange={changeHandler} className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white">
                <option value="beginner">Cơ bản (Beginner)</option>
                <option value="intermediate">Trung cấp (Intermediate)</option>
                <option value="advanced">Nâng cao (Advanced)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Building2 size={14} className="text-violet-500" />
                Đơn vị đối tác / Trường học liên kết
              </label>
              <select
                name="providerId"
                value={formData.providerId}
                onChange={changeHandler}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white text-slate-800"
              >
                <option value="">-- Hệ thống LMS cấp chứng chỉ độc lập --</option>
                {providers.map((prov) => (
                  <option key={prov._id} value={prov._id}>
                    {prov.type === "university" ? "[Trường học] " : "[Doanh nghiệp] "} {prov.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CHỌN GIẢNG VIÊN */}
          <div className="border-t pt-4">
            <label className="mb-2 text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <UserIcon size={14} className="text-blue-500" />
              Giảng viên phụ trách khóa học
            </label>
            <select
              name="instructorId"
              value={formData.instructorId}
              onChange={changeHandler}
              disabled={currentUser?.role !== "admin"}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
              required
            >
              <option value="">-- Chọn giảng viên --</option>
              {instructors.map((ins) => (
                <option key={ins._id} value={ins._id}>
                  {ins.name} ({ins.email})
                </option>
              ))}
            </select>
          </div>

          {/* CHỌN DANH MỤC */}
          <div className="border-t pt-4">
            <label className="mb-2 text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Tag size={14} className="text-emerald-500" />
              Danh mục liên kết phân loại (Chọn nhiều)
            </label>
            <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {categories.map((cat) => {
                const active = formData.category.includes(cat._id);
                return (
                  <button
                    type="button"
                    key={cat._id}
                    onClick={() => handleCategoryToggle(cat._id)}
                    className={`flex items-center gap-1 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      active ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cat.name}
                    {active && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TÁC VỤ ĐIỀU HƯỚNG */}
          <div className="pt-4 border-t flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition shadow-md sm:w-auto text-center"
            >
              Lưu thay đổi khóa học
            </button>

            <Link
              href={`/admin/lessons?courseId=${courseId}`}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
            >
              <Video size={14} /> Quản lý giáo trình bài học (Nội dung)
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

// useSearchParams() phai nam trong Suspense thi Next moi prerender tinh duoc.
// Co boundary -> khung trang di tu CDN, khong ton mot lan chay serverless moi luot xem.
export default function AdminCourseDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
        </div>
      }
    >
      <AdminCourseDetailsPageContent />
    </Suspense>
  );
}
