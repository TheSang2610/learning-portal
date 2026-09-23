"use client";
/* eslint-disable @next/next/no-img-element --
   Anh xem truoc o trang nay lay tu URL.createObjectURL nen la URL blob: cuc bo.
   next/image khong toi uu duoc blob vi no phai di qua /_next/image tren may chu,
   nen dung the <img> o day moi dung. */

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  getCourseById,
  updateCourse,
  updateCoursePublishStatus,
  layIdChuDe,
} from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { getUsers, User } from "@/src/services/userApi";
import { getProviders, ProviderData } from "@/src/services/provider";
import {
  LayoutGrid,
  ArrowLeft,
  User as UserIcon,
  Tag,
  Check,
  Image as ImageIcon,
  Eye,
  EyeOff,
  Video,
  Building2,
} from "lucide-react";
import Link from "next/link";

import styles from "./page.module.scss";
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
        const userFake: User = {
          _id: "current_user_id",
          name: "Quản trị viên",
          email: "admin@gmail.com",
          role: "admin",
        };
        setCurrentUser(userFake);

        const [courseData, categoriesData, usersData, providersData] = await Promise.all([
          getCourseById(courseId),
          getCategories(),
          getUsers(),
          getProviders(),
        ]);

        setCategories(categoriesData);
        setProviders(providersData);

        const instructorList = (usersData || []).filter(
          (u: User) => u.role === "instructor",
        );
        setInstructors(instructorList);

        // layIdChuDe nhan ca ba hinh dang cua category (mang id, mang doi tuong
        // da populate, hoac dang { $oid } cua ban ghi cu).
        const normalizedCategories: string[] = layIdChuDe(courseData.category);

        const normalizedInstructor = courseData.instructor
          ? typeof courseData.instructor === "object"
            ? courseData.instructor._id
            : courseData.instructor
          : "";

        const normalizedProvider = courseData.provider
          ? typeof courseData.provider === "object"
            ? courseData.provider._id
            : courseData.provider
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
      return alert(
        "Hành động bị từ chối: Chỉ quản trị viên tối cao (Admin) mới có quyền thay đổi trạng thái hiển thị khóa học!",
      );
    }

    try {
      setPublishingLoading(true);
      const nextStatus = !isPublished;
      await updateCoursePublishStatus(courseId, nextStatus);
      setIsPublished(nextStatus);
      alert(
        `Đã chuyển khóa học sang trạng thái: ${nextStatus ? "CÔNG KHAI" : "BẢN NHÁP"}`,
      );
    } catch (error) {
      console.error(error);
      alert("Lỗi phân quyền hoặc đường truyền không thể cập nhật trạng thái xuất bản.");
    } finally {
      setPublishingLoading(false);
    }
  };

  if (loading)
    return <div className={styles.box}>Đang tải cấu trúc dữ liệu khóa học...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.col}>
        <div>
          <Link href="/admin/courses" className={styles.box2}>
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
          <h1 className={styles.title}>Studio Quản Lý Khóa Học</h1>
        </div>

        <div className={styles.card}>
          <div className={styles.box3}>
            <p className={styles.text}>Trạng thái hiển thị</p>
            <p className={`${styles.text4} ${isPublished ? styles.text2 : styles.text3}`}>
              {isPublished ? "Đang Công Khai" : "Bản Nháp (Ẩn)"}
            </p>
          </div>

          <button
            type="button"
            onClick={togglePublishStatus}
            disabled={publishingLoading || currentUser?.role !== "admin"}
            className={`${styles.button7} ${
              currentUser?.role !== "admin"
                ? styles.button
                : isPublished
                  ? styles.button2
                  : styles.button3
            }`}
          >
            {isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
            {publishingLoading
              ? "Đang xử lý..."
              : isPublished
                ? "Gỡ bài xuống (Draft)"
                : "Phát hành (Publish)"}
          </button>
        </div>
      </div>

      {currentUser?.role !== "admin" && (
        <div className={styles.card2}>
          ⚠️ Bạn đang đăng nhập dưới quyền **Giảng viên (Instructor)**. Bạn có toàn quyền
          sửa đổi nội dung bài giảng, ảnh bìa và giá bán, nhưng quyền **Xét duyệt công
          khai** khóa học lên trang chủ thuộc về Admin.
        </div>
      )}

      <div className={styles.card3}>
        <h2 className={styles.heading}>
          <LayoutGrid size={18} className={styles.box4} />
          Thông tin chi tiết cấu hình khóa học
        </h2>

        <form onSubmit={updateCourseHandler} className={styles.form}>
          {/* UPLOAD THUMBNAIL */}
          <div className={styles.box5}>
            <label className={styles.fieldLabel}>
              <ImageIcon size={14} className={styles.box4} />
              Ảnh đại diện khóa học (Thumbnail)
            </label>
            <div className={styles.card4}>
              {previewUrl ? (
                <img src={previewUrl} alt="Course thumbnail" className={styles.image} />
              ) : (
                <div className={styles.box6}>Chưa có ảnh đại diện</div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.input}
            />
          </div>

          <div className={styles.grid}>
            {/* 🎯 Ô NHẬP TIÊU ĐỀ: Sử dụng handleTitleChange để tự sinh slug */}
            <div>
              <label className={styles.fieldLabel2}>Tiêu đề khóa học</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                className={styles.input2}
                required
              />
            </div>
            <div>
              <label className={styles.fieldLabel2}>Giá bán (VND)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={changeHandler}
                className={styles.input2}
                min={0}
                required
              />
            </div>
          </div>

          {/* 🎯 Ô HIỂN THỊ SLUG ĐƯỢC THÊM VÀO GIỐNG BÊN TRANG CREATE */}
          <div>
            <label className={styles.fieldLabel2}>Đường dẫn SEO (Slug)</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: convertToSlug(e.target.value) })
              }
              className={styles.input3}
              required
            />
          </div>

          <div>
            <label className={styles.fieldLabel2}>Mô tả chi tiết khóa học</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={changeHandler}
              rows={4}
              className={styles.textarea}
              required
            />
          </div>

          <div className={styles.grid}>
            <div>
              <label className={styles.fieldLabel2}>Trình độ học viên hướng tới</label>
              <select
                name="level"
                value={formData.level}
                onChange={changeHandler}
                className={styles.select}
              >
                <option value="beginner">Cơ bản (Beginner)</option>
                <option value="intermediate">Trung cấp (Intermediate)</option>
                <option value="advanced">Nâng cao (Advanced)</option>
              </select>
            </div>

            <div>
              <label className={styles.fieldLabel3}>
                <Building2 size={14} className={styles.box7} />
                Đơn vị đối tác / Trường học liên kết
              </label>
              <select
                name="providerId"
                value={formData.providerId}
                onChange={changeHandler}
                className={styles.select2}
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
          </div>

          {/* CHỌN GIẢNG VIÊN */}
          <div className={styles.box8}>
            <label className={styles.fieldLabel4}>
              <UserIcon size={14} className={styles.box4} />
              Giảng viên phụ trách khóa học
            </label>
            <select
              name="instructorId"
              value={formData.instructorId}
              onChange={changeHandler}
              disabled={currentUser?.role !== "admin"}
              className={styles.select3}
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
          <div className={styles.box8}>
            <label className={styles.fieldLabel4}>
              <Tag size={14} className={styles.box9} />
              Danh mục liên kết phân loại (Chọn nhiều)
            </label>
            <div className={styles.card5}>
              {categories.map((cat) => {
                const active = formData.category.includes(cat._id);
                return (
                  <button
                    type="button"
                    key={cat._id}
                    onClick={() => handleCategoryToggle(cat._id)}
                    className={`${styles.button8} ${
                      active ? styles.button4 : styles.button5
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
          <div className={styles.col2}>
            <button type="submit" className={styles.button6}>
              Lưu thay đổi khóa học
            </button>

            <Link href={`/admin/lessons?courseId=${courseId}`} className={styles.card6}>
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
        <div className={styles.row}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <AdminCourseDetailsPageContent />
    </Suspense>
  );
}
