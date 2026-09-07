"use client";

import { useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import { useRouter } from "next/navigation";
import { createCategory } from "@/src/services/categoryService";
import { ArrowLeft } from "lucide-react";

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
    <div className="max-w-xl space-y-6">
      {/* NÚT BACK QUAY LẠI */}
      <button
        onClick={() => router.push("/admin/categories")}
        className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft size={16} />
        Back to Categories
      </button>

      <div>
        <h1 className="text-4xl font-bold text-slate-800">Create Category</h1>
        <p className="mt-1 text-gray-500">
          Add a new category to classify your academic courses
        </p>
      </div>

      {/* FORM TẠO */}
      <div className="rounded-3xl border bg-white p-8 shadow-sm">
        <form onSubmit={submitHandler} className="space-y-5">
          {/* FIELD: NAME */}
          <div>
            <label className="mb-2 block font-medium text-slate-700">Category Name</label>
            <input
              type="text"
              placeholder="e.g. Lập trình Web, Thiết kế Đồ họa..."
              value={name}
              onChange={handleNameChange}
              className="w-full rounded-2xl border p-4 transition outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* FIELD: SLUG (THAY THẾ CHO ICON) */}
          <div>
            <label className="mb-2 block font-medium text-slate-700">Category Slug</label>
            <input
              type="text"
              placeholder="e.g. lap-trinh-web, thiet-ke-do-hoa"
              value={slug}
              onChange={(e) => setSlug(convertToSlug(e.target.value))} // Đảm bảo người dùng nhập tay vẫn ra format slug chuẩn
              className="w-full rounded-2xl border p-4 transition outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-blue-600 p-4 font-medium text-white transition hover:bg-blue-700 disabled:bg-slate-300"
          >
            {submitting ? "Creating..." : "Publish Category"}
          </button>
        </form>
      </div>
    </div>
  );
}
