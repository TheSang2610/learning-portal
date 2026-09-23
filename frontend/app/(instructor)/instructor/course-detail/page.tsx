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

import styles from "./page.module.scss";
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
    return <div className={styles.box}>Đang tải cấu trúc dữ liệu khóa học...</div>;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.col}>
        <div>
          <Link href="/instructor/courses" className={styles.box2}>
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
          <h1 className={styles.title}>Thiết Kế Khóa Học</h1>
        </div>

        {/* HIỂN THỊ TRẠNG THÁI KHÔNG CHO PHÉP ĐỔI TỰ DO */}
        <div className={styles.card}>
          Trạng thái:{" "}
          <span className={isPublished ? styles.label : styles.label2}>
            {isPublished ? "Đang Công Khai" : "Bản Nháp (Chờ duyệt)"}
          </span>
        </div>
      </div>

      {/* BANNER CẢNH BÁO */}
      <div className={styles.card2}>
        <AlertTriangle size={16} className={styles.box3} />
        <span>
          Bạn có quyền chỉnh sửa toàn bộ nội dung khóa học và bài giảng. Trạng thái hiển
          thị chính thức trên website sẽ do <strong>Admin kiểm duyệt</strong>.
        </span>
      </div>

      <div className={styles.card3}>
        <form onSubmit={updateCourseHandler} className={styles.form}>
          {/* UPLOAD THUMBNAIL */}
          <div className={styles.box4}>
            <label className={styles.fieldLabel}>
              <ImageIcon size={14} className={styles.box5} /> Ảnh đại diện (Thumbnail)
            </label>
            <div className={styles.card4}>
              {previewUrl ? (
                <img src={previewUrl} alt="Thumbnail" className={styles.image} />
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
            <div>
              <label className={styles.fieldLabel2}>Tiêu đề khóa học</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={changeHandler}
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

          <div>
            <label className={styles.fieldLabel2}>Mô tả khóa học</label>
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
              <label className={styles.fieldLabel2}>Trình độ</label>
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
                <Building2 size={14} className={styles.box7} /> Đơn vị cấp chứng chỉ liên
                kết
              </label>
              <select
                name="providerId"
                value={formData.providerId}
                onChange={changeHandler}
                className={styles.select}
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
          <div className={styles.box8}>
            <label className={styles.fieldLabel4}>
              <Tag size={14} className={styles.box9} /> Danh mục phân loại
            </label>
            <div className={styles.card5}>
              {categories.map((cat) => {
                const active = formData.category.includes(cat._id);
                return (
                  <button
                    type="button"
                    key={cat._id}
                    onClick={() => handleCategoryToggle(cat._id)}
                    className={`${styles.button4} ${active ? styles.button : styles.button2}`}
                  >
                    {cat.name} {active && <Check size={12} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* HÀNH ĐỘNG ĐIỀU HƯỚNG */}
          <div className={styles.col2}>
            <button type="submit" className={styles.button3}>
              Lưu thay đổi khóa học
            </button>

            {/* NÚT SANG TRANG QUẢN LÝ BÀI HỌC CỦA INSTRUCTOR */}
            <Link
              href={`/instructor/lessons?courseId=${courseId}`}
              className={styles.card6}
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
        <div className={styles.row}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <InstructorCourseDetailsPageContent />
    </Suspense>
  );
}
