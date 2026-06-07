"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, Category } from "@/src/services/categoryService";

function CategoriesSkeleton() {
  return (
    <section className="bg-[#f5f7fa] animate-pulse">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tiêu đề giả lập */}
        <div className="h-5 bg-slate-200 rounded w-48 mb-6"></div>

        {/* Danh sách các nút danh mục giả lập (Pills) */}
        <div className="flex flex-wrap px-2 gap-2">
          {[
            "w-24", "w-32", "w-28", "w-36", "w-20", 
            "w-40", "w-24", "w-32", "w-28"
          ].map((widthClass, index) => (
            <div
              key={index}
              className={`${widthClass} h-9 bg-white border border-slate-200/60 rounded-full flex items-center justify-center shadow-sm`}
            >
              {/* Vệt xám giả lập chữ bên trong nút */}
              <div className="h-3 bg-slate-200 rounded w-3/5"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Gọi API lấy danh sách categories khi component render
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCats();
  }, []);

  if (loading) {
    return <CategoriesSkeleton />;
  }

  // Trường hợp không có dữ liệu
  if (categories.length === 0) return null;

  return (
    <section className="bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* TITLE */}
        <div>
          <h3 className="text-sm md:text-md font-semibold text-[#1f1f1f]">
            Khám phá danh mục
          </h3>
        </div>

        {/* FLEX WRAPPER FOR PILLS */}
        <div className="flex flex-wrap px-2 gap-2 mt-6">
          {categories.map((category) => {
            const catSlug = category.slug || category.name.toLowerCase().replace(/ /g, "-");

            return (
              <Link
                href={`/${catSlug}`}
                key={category._id}
                className="min-w-fit bg-[#f0f6ff] rounded-full border border-gray-200 px-4 py-2 flex items-center justify-center shadow-sm hover:shadow-md hover:border-gray-400 transition duration-200 cursor-pointer select-none group"
              >
                <span className="text-sm md:text-md font-medium text-gray-800 whitespace-nowrap group-hover:text-blue-600 transition">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}