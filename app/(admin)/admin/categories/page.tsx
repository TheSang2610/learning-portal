"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, Category } from "@/src/services/categoryService";
import { Plus } from "lucide-react"; // Đảm bảo bạn đã cài lucide-react, nếu không có thì xóa dòng này đi

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCats = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  if (loading) return <div className="p-8 font-medium text-center">Loading categories...</div>;

  return (
    <div className="space-y-6">
      {/* TIÊU ĐỀ & NÚT TẠO MỚI */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Categories</h1>
          <p className="text-gray-500 mt-1">Manage course categories and classifications</p>
        </div>
        <Link
          href="/admin/categories/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-3 rounded-2xl transition flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          Create Category
        </Link>
      </div>

      {/* BẢNG DANH SÁCH */}
      <div className="bg-white border overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="border-b">
              <th className="text-left p-5 text-sm font-semibold text-slate-600 w-24">Icon</th>
              <th className="text-left p-5 text-sm font-semibold text-slate-600">Name</th>
              <th className="text-left p-5 text-sm font-semibold text-slate-600">Slug (Auto)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {categories.map((cat) => (
              <tr key={cat._id} className="hover:bg-slate-50/50 transition">
                {/* <td className="p-5 font-mono text-blue-600">{cat.icon || "—"}</td> */}
                <td className="p-5 font-bold text-slate-800">{cat.name}</td>
                <td className="p-5 text-slate-500">{cat.slug}</td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="p-10 text-center text-slate-400">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}