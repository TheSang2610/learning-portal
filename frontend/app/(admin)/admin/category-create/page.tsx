"use client";

import { useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useRouter } from "next/navigation";
import { createCategory } from "@/src/services/categoryService";
import { ArrowLeft } from "lucide-react";

import styles from "./page.module.scss";
// Hàm helper để convert Tên tiếng Việt thành Slug chuẩn SEO
const convertToSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // Xóa ký tự đặc biệt
    .replace(/\s+/g, "-") // Thay khoảng trắng bằng dấu -
    .replace(/-+/g, "-") // Tránh lặp lại dấu -
    .trim();
};

export default function CreateCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Xử lý khi đổi Name: Tự động điền Slug tương ứng
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setSlug(convertToSlug(value));
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter category name");
    if (!slug.trim()) return alert("Please enter category slug");

    try {
      setSubmitting(true);
      // Gọi service gửi name và slug (Đã loại bỏ icon)
      await createCategory({ name, slug: slug.trim() });
      alert("Category created successfully!");

      // Chuyển hướng Admin quay lại trang danh sách sau khi tạo xong
      router.push("/admin/categories");
    } catch (error) {
      alert(getErrorMessage(error, "Create failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.stack}>
      {/* NÚT BACK QUAY LẠI */}
      <button onClick={() => router.push("/admin/categories")} className={styles.button}>
        <ArrowLeft size={16} />
        Back to Categories
      </button>

      <div>
        <h1 className={styles.title}>Create Category</h1>
        <p className={styles.text}>
          Add a new category to classify your academic courses
        </p>
      </div>

      {/* FORM TẠO */}
      <div className={styles.card}>
        <form onSubmit={submitHandler} className={styles.form}>
          {/* FIELD: NAME */}
          <div>
            <label className={styles.fieldLabel}>Category Name</label>
            <input
              type="text"
              placeholder="e.g. Lập trình Web, Thiết kế Đồ họa..."
              value={name}
              onChange={handleNameChange}
              className={styles.input}
              required
            />
          </div>

          {/* FIELD: SLUG (THAY THẾ CHO ICON) */}
          <div>
            <label className={styles.fieldLabel}>Category Slug</label>
            <input
              type="text"
              placeholder="e.g. lap-trinh-web, thiet-ke-do-hoa"
              value={slug}
              onChange={(e) => setSlug(convertToSlug(e.target.value))} // Đảm bảo người dùng nhập tay vẫn ra format slug chuẩn
              className={styles.input}
              required
            />
          </div>

          <button type="submit" disabled={submitting} className={styles.button2}>
            {submitting ? "Creating..." : "Publish Category"}
          </button>
        </form>
      </div>
    </div>
  );
}
