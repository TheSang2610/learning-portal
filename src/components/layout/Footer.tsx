"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, Category } from "@/src/services/categoryService";
import { getHomeSections, Course } from "@/src/services/course";
import { getProviders, ProviderData } from "@/src/services/provider";

interface Props {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/layout.tsx).
   *
   * Footer nam duoi MOI trang portal, nen truoc day moi trang deu keo theo ba
   * luot goi API va ba khung xam o chan trang. Co san thi khong goi nua.
   * Bo trong thi tu goi nhu cu - de backend chet van con duong lui.
   */
  initialCategories?: Category[] | null;
  initialPopular?: Course[] | null;
  initialProviders?: ProviderData[] | null;
}

export default function Footer({
  initialCategories,
  initialPopular,
  initialProviders,
}: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const [popularCourses, setPopularCourses] = useState<Course[]>(initialPopular ?? []);
  const [providers, setProviders] = useState<ProviderData[]>(initialProviders ?? []);
  const [loading, setLoading] = useState(!initialCategories);

  useEffect(() => {
    if (initialCategories) return;

    Promise.all([getCategories(), getHomeSections(), getProviders()])
      .then(([categoriesData, homeSectionsData, providersData]) => {
        setCategories(categoriesData.slice(0, 5));
        if (homeSectionsData?.success && homeSectionsData?.data?.mostPopular) {
          setPopularCourses(homeSectionsData.data.mostPopular.slice(0, 5));
        }
        setProviders(providersData.slice(0, 5));
      })
      .catch((error) => console.error("Lỗi khi tải dữ liệu hệ thống tại Footer:", error))
      .finally(() => setLoading(false));
  }, [initialCategories]);

  return (
    <footer className="border-t border-slate-200 bg-[#f2f5fa] text-[#52565c]">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 py-14 md:grid-cols-5">
        {/* CỘT 1: THƯƠNG HIỆU PLATFORM */}
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          <Link
            href="/"
            className="font-sans text-2xl font-bold tracking-tight text-[#0056d2] transition hover:opacity-80"
          >
            coursera
          </Link>
          <p className="text-xs leading-relaxed font-normal text-[#6a6f7a] md:text-sm">
            Nền tảng đào tạo trực tuyến chuẩn hóa thế hệ mới. Học tập mọi lúc, mọi nơi
            cùng các chuyên gia và tổ chức uy tín hàng đầu.
          </p>
        </div>

        {/* CỘT 2: DANH MỤC KHÓA HỌC (DỮ LIỆU THỰC) */}
        <div>
          <h3 className="mb-4 font-sans text-sm font-bold tracking-wide text-[#1f2124]">
            Chủ đề học tập
          </h3>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-3.5 w-2/3 rounded bg-slate-200"></div>
              <div className="h-3.5 w-1/2 rounded bg-slate-200"></div>
              <div className="h-3.5 w-3/4 rounded bg-slate-200"></div>
            </div>
          ) : (
            <ul className="space-y-2.5 text-sm">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat._id}>
                    <Link
                      href={`/courses?category=${cat.slug}`}
                      className="block text-[#40444d] transition-all duration-150 hover:text-[#0056d2] hover:underline"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-xs font-light text-gray-500 italic">
                  Chưa có danh mục
                </li>
              )}
            </ul>
          )}
        </div>

        {/* CỘT 3: KHÓA HỌC NỔI BẬT (DỮ LIỆU THỰC) */}
        <div>
          <h3 className="mb-4 font-sans text-sm font-bold tracking-wide text-[#1f2124]">
            Khóa học phổ biến
          </h3>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-3.5 w-3/4 rounded bg-slate-200"></div>
              <div className="h-3.5 w-2/3 rounded bg-slate-200"></div>
              <div className="h-3.5 w-4/5 rounded bg-slate-200"></div>
            </div>
          ) : (
            <ul className="space-y-2.5 text-sm">
              {popularCourses.length > 0 ? (
                popularCourses.map((course) => (
                  <li key={course._id}>
                    <Link
                      href={`/course?slug=${course.slug}`}
                      className="block truncate text-[#40444d] transition-all duration-150 hover:text-[#0056d2] hover:underline"
                      title={course.title}
                    >
                      {course.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-xs font-light text-gray-500 italic">
                  Chưa cập nhật khóa học
                </li>
              )}
            </ul>
          )}
        </div>

        {/* CỘT 4: ĐỐI TÁC ĐÀO TẠO (DỮ LIỆU THỰC) */}
        <div>
          <h3 className="mb-4 font-sans text-sm font-bold tracking-wide text-[#1f2124]">
            Đối tác liên kết
          </h3>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-3.5 w-1/2 rounded bg-slate-200"></div>
              <div className="h-3.5 w-2/3 rounded bg-slate-200"></div>
            </div>
          ) : (
            <ul className="space-y-2.5 text-sm">
              {providers.length > 0 ? (
                providers.map((prov) => (
                  <li key={prov._id} className="flex items-center gap-2">
                    <span className="block truncate text-[#40444d] transition-all duration-150 hover:text-[#0056d2] hover:underline">
                      {prov.name}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-xs font-light text-gray-500 italic">
                  Chưa có đối tác liên kết
                </li>
              )}
            </ul>
          )}
        </div>

        {/* CỘT 5: THÀNH VIÊN NHÓM */}
        <div>
          <h3 className="mb-4 font-sans text-sm font-bold tracking-wide text-[#1f2124]">
            Các thành viên nhóm
          </h3>
          <ul className="space-y-2.5 text-sm text-[#40444d]">
            <li className="flex items-center gap-1.5">
              <span>Nguyễn Thế Sang</span>
              <span className="rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                FullStack
              </span>
              {/* <span className="text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-medium border border-red-100">Leader</span> */}
            </li>
            <li className="flex items-center gap-1.5">
              <span>Nguyễn Thanh Sang</span>
              <span className="rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                FullStack
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* DÒNG BẢN QUYỀN DƯỚI CÙNG */}
      <div className="border-t border-slate-200/80 py-6 text-sm text-[#6a6f7a]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="text-xs font-normal md:text-sm">
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-[#1f2124]">coursera</span> Inc. All rights
            reserved.
          </div>
          <div className="flex gap-6 text-xs font-normal">
            <Link
              href="/terms"
              className="text-[#40444d] transition hover:text-[#0056d2] hover:underline"
            >
              Điều khoản dịch vụ
            </Link>
            <Link
              href="/privacy"
              className="text-[#40444d] transition hover:text-[#0056d2] hover:underline"
            >
              Chính sách bảo mật
            </Link>
            <Link
              href="/help"
              className="text-[#40444d] transition hover:text-[#0056d2] hover:underline"
            >
              Trung tâm trợ giúp
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
