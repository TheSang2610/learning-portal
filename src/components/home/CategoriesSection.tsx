"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, Category } from "@/src/services/categoryService";

function CategoriesSkeleton() {
  return (
    <section className="animate-pulse bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* Tiêu đề giả lập */}
        <div className="mb-6 h-5 w-48 rounded bg-slate-200"></div>

        {/* Danh sách các nút danh mục giả lập (Pills) */}
        <div className="flex flex-wrap gap-2 px-2">
          {["w-24", "w-32", "w-28", "w-36", "w-20", "w-40", "w-24", "w-32", "w-28"].map(
            (widthClass, index) => (
              <div
                key={index}
                className={`${widthClass} flex h-9 items-center justify-center rounded-full border border-slate-200/60 bg-white shadow-sm`}
              >
                {/* Vệt xám giả lập chữ bên trong nút */}
                <div className="h-3 w-3/5 rounded bg-slate-200"></div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

interface Props {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/page.tsx).
   *
   * Co san thi KHONG goi API luc mount nua: noi dung nam thang trong HTML,
   * nguoi dung khong phai nhin khung xam, va may tim kiem doc duoc.
   * Bo trong thi component tu goi nhu cu - de con dung lai duoc o cho khac.
   */
  initialData?: Category[] | null;
}

export default function CategoriesSection({ initialData }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialData ?? []);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    getCategories()
      .then(setCategories)
      .catch((error) => console.error("Failed to fetch categories:", error))
      .finally(() => setLoading(false));
  }, [initialData]);

  if (loading) {
    return <CategoriesSkeleton />;
  }

  // Trường hợp không có dữ liệu
  if (categories.length === 0) return null;

  return (
    <section className="bg-[#f5f7fa]">
      <div className="mx-auto max-w-7xl px-6 py-6">
        {/* TITLE */}
        <div>
          <h3 className="md:text-md text-sm font-semibold text-[#1f1f1f]">
            Khám phá danh mục
          </h3>
        </div>

        {/* FLEX WRAPPER FOR PILLS */}
        <div className="mt-6 flex flex-wrap gap-2 px-2">
          {categories.map((category) => {
            const catSlug =
              category.slug || category.name.toLowerCase().replace(/ /g, "-");

            return (
              <Link
                href={`/courses?category=${catSlug}`}
                key={category._id}
                className="group flex min-w-fit cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-[#f0f6ff] px-4 py-2 shadow-sm transition duration-200 select-none hover:border-gray-400 hover:shadow-md"
              >
                <span className="md:text-md text-sm font-medium whitespace-nowrap text-gray-800 transition group-hover:text-blue-600">
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
