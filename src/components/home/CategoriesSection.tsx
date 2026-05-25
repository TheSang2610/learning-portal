"use client";

import { useEffect, useState } from "react";
import { getCategories, Category } from "@/src/services/categoryService";

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

  // Trạng thái đang tải dữ liệu
  if (loading) {
    return (
      <section className="bg-[#f5f7fa]">
        <div className="max-w-7xl mx-auto px-6 py-10 text-center text-sm text-gray-500">
          Loading categories...
        </div>
      </section>
    );
  }

  // Trường hợp không có dữ liệu
  if (categories.length === 0) return null;

  return (
    <section className="bg-[#f5f7fa]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        
        {/* TITLE */}
        <div>
          <h3 className="text-sm md:text-md font-semibold text-[#1f1f1f]">
            Explore Categories
          </h3>
        </div>

        {/* FLEX WRAPPER FOR PILLS (Tự động xuống hàng, dữ liệu động) */}
        <div className="flex flex-wrap px-2 gap-2 mt-6">
          {categories.map((category) => (
            <div
              // Sử dụng ID từ database (_id) làm key để tối ưu hiệu năng render của React
              key={category._id}
              className="min-w-fit bg-[#f0f6ff] rounded-full border border-gray-200 px-4 py-2 flex items-center justify-center shadow-sm hover:shadow-md hover:border-gray-400 transition duration-200 cursor-pointer select-none"
            >
              {/* Hiển thị icon nếu có cấu hình trong database */}
              {/* {category.icon && (
                <span className="mr-2 text-sm text-blue-600 font-mono">
                  {category.icon}
                </span>
              )} */}
              
              <span className="text-sm md:text-md font-medium text-gray-800 whitespace-nowrap">
                {category.name}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}