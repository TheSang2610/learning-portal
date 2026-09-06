"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  Cloud,
  Code2,
  Cpu,
  LayoutGrid,
  Megaphone,
  PenTool,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { getCategories, Category } from "@/src/services/categoryService";
import TieuDeMuc from "./TieuDeMuc";

// Bieu tuong chon theo TU KHOA trong ten danh muc, khong theo truong icon cua
// ban ghi: truong do la o nhap tu do trong trang quan tri, admin go gi cung
// duoc, nen khong the dua vao no de chon dung mot component.
//
// Doi ten danh muc thi cung chi roi ve bieu tuong mac dinh, khong vo trang.
const BIEU_TUONG: [RegExp, LucideIcon][] = [
  [/web|front|html|css/i, Code2],
  [/devops|cloud|docker|kubernet/i, Cloud],
  [/mobile|android|ios|flutter/i, Smartphone],
  [/marketing|seo|quảng cáo/i, Megaphone],
  [/dữ liệu|data|phân tích|analytic/i, BarChart3],
  [/thiết kế|design|ui|ux/i, PenTool],
  [/ai|máy học|machine|khoa học/i, Cpu],
  [/bảo mật|security|an toàn/i, ShieldCheck],
];

function chonBieuTuong(ten: string): LucideIcon {
  for (const [mau, Icon] of BIEU_TUONG) if (mau.test(ten)) return Icon;
  return LayoutGrid;
}

function CategoriesSkeleton() {
  return (
    <section className="animate-pulse bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <div className="h-8 w-64 rounded bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5"
            >
              <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-20 rounded bg-slate-200" />
              </div>
            </div>
          ))}
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
  /**
   * So khoa hoc theo id danh muc, dem san o may chu.
   *
   * Khong bat buoc: thieu thi the chi hien ten danh muc. Co thi moi o tra loi
   * duoc cau hoi that su cua nguoi bam vao - "trong day co gi khong" - thay vi
   * bat ho bam vao roi moi biet muc do rong.
   */
  soKhoaTheoDanhMuc?: Record<string, number>;
}

export default function CategoriesSection({ initialData, soKhoaTheoDanhMuc }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialData ?? []);
  const [loading, setLoading] = useState(!initialData);

  useEffect(() => {
    if (initialData) return;

    getCategories()
      .then(setCategories)
      .catch((error) => console.error("Failed to fetch categories:", error))
      .finally(() => setLoading(false));
  }, [initialData]);

  if (loading) return <CategoriesSkeleton />;
  if (categories.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <TieuDeMuc
          tieuDe="Khám phá danh mục"
          moTa="Chọn lĩnh vực bạn muốn theo đuổi. Mỗi danh mục là một lộ trình từ khoá nhập môn tới khoá nâng cao."
          xemTatCa="/courses"
          chuXemTatCa="Xem toàn bộ khoá học"
        />

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const catSlug =
              category.slug || category.name.toLowerCase().replace(/ /g, "-");
            const Icon = chonBieuTuong(category.name);
            const soKhoa = soKhoaTheoDanhMuc?.[category._id];

            return (
              <Link
                href={`/courses?category=${catSlug}`}
                key={category._id}
                className="group flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_8px_24px_-12px_rgba(0,86,210,.35)] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={22} strokeWidth={1.75} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-slate-900">
                    {category.name}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-slate-500">
                    {soKhoa === undefined
                      ? "Xem khoá học"
                      : soKhoa === 0
                        ? "Sắp có khoá học"
                        : `${soKhoa} khoá học`}
                  </span>
                </span>

                <ArrowUpRight
                  size={18}
                  className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
