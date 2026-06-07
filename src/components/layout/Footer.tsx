"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, Category } from "@/src/services/categoryService"; 
import { getHomeSections, Course } from "@/src/services/course";     
import { getProviders, ProviderData } from "@/src/services/provider"; 

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        setLoading(true);
        const [categoriesData, homeSectionsData, providersData] = await Promise.all([
          getCategories(),
          getHomeSections(),
          getProviders(),
        ]);

        setCategories(categoriesData.slice(0, 5));
        if (homeSectionsData?.success && homeSectionsData?.data?.mostPopular) {
          setPopularCourses(homeSectionsData.data.mostPopular.slice(0, 5));
        }
        setProviders(providersData.slice(0, 5));
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu hệ thống tại Footer:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  return (
    <footer className="bg-[#f2f5fa] text-[#52565c] border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-5 gap-10">
        
        {/* CỘT 1: THƯƠNG HIỆU PLATFORM */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-3">
          <Link href="/" className="text-2xl font-bold text-[#0056d2] hover:opacity-80 transition font-sans tracking-tight">
            coursera
          </Link>
          <p className="text-xs md:text-sm text-[#6a6f7a] leading-relaxed font-normal">
            Nền tảng đào tạo trực tuyến chuẩn hóa thế hệ mới. Học tập mọi lúc, mọi nơi cùng các chuyên gia và tổ chức uy tín hàng đầu.
          </p>
        </div>

        {/* CỘT 2: DANH MỤC KHÓA HỌC (DỮ LIỆU THỰC) */}
        <div>
          <h3 className="font-bold text-[#1f2124] mb-4 tracking-wide text-sm font-sans">
            Chủ đề học tập
          </h3>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3.5 bg-slate-200 rounded w-2/3"></div>
              <div className="h-3.5 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
            </div>
          ) : (
            <ul className="space-y-2.5 text-sm">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat._id}>
                    <Link href={`/${cat.slug}`} className="hover:text-[#0056d2] hover:underline transition-all duration-150 block text-[#40444d]">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 text-xs italic font-light">Chưa có danh mục</li>
              )}
            </ul>
          )}
        </div>

        {/* CỘT 3: KHÓA HỌC NỔI BẬT (DỮ LIỆU THỰC) */}
        <div>
          <h3 className="font-bold text-[#1f2124] mb-4 tracking-wide text-sm font-sans">
            Khóa học phổ biến
          </h3>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3.5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3.5 bg-slate-200 rounded w-2/3"></div>
              <div className="h-3.5 bg-slate-200 rounded w-4/5"></div>
            </div>
          ) : (
            <ul className="space-y-2.5 text-sm">
              {popularCourses.length > 0 ? (
                popularCourses.map((course) => (
                  <li key={course._id}>
                    <Link href={`/general/${course.slug}`} className="hover:text-[#0056d2] hover:underline transition-all duration-150 block truncate text-[#40444d]" title={course.title}>
                      {course.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 text-xs italic font-light">Chưa cập nhật khóa học</li>
              )}
            </ul>
          )}
        </div>

        {/* CỘT 4: ĐỐI TÁC ĐÀO TẠO (DỮ LIỆU THỰC) */}
        <div>
          <h3 className="font-bold text-[#1f2124] mb-4 tracking-wide text-sm font-sans">
            Đối tác liên kết
          </h3>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3.5 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3.5 bg-slate-200 rounded w-2/3"></div>
            </div>
          ) : (
            <ul className="space-y-2.5 text-sm">
              {providers.length > 0 ? (
                providers.map((prov) => (
                  <li key={prov._id} className="flex items-center gap-2">
                    <Link href={`/providers/slug/${prov.slug}`} className="hover:text-[#0056d2] hover:underline transition-all duration-150 block truncate text-[#40444d]">
                      {prov.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 text-xs italic font-light">Chưa có đối tác liên kết</li>
              )}
            </ul>
          )}
        </div>

        {/* CỘT 5: THÀNH VIÊN NHÓM */}
        <div>
          <h3 className="font-bold text-[#1f2124] mb-4 tracking-wide text-sm font-sans">
            Các thành viên nhóm
          </h3>
          <ul className="space-y-2.5 text-sm text-[#40444d]">
            <li className="flex items-center gap-1.5">
              <span className="font-medium text-[#1f2124]">Thái Thanh Vũ</span> 
              <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold border border-blue-100">Leader</span>
              <span className="text-[10px] text-gray-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">Tester</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span>Nguyễn Minh Tâm</span>
              <span className="text-[10px] text-gray-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">Frontend</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span>Nguyễn Đức Minh</span>
              <span className="text-[10px] text-gray-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">Frontend</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span>Nguyễn Thế Sang</span>
              <span className="text-[10px] text-gray-500 bg-slate-100 px-1.5 py-0.5 rounded font-medium">Frontend</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span>Nguyễn Thanh Sang</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-100">Backend</span>
            </li>
          </ul>
        </div>
      </div>

      {/* DÒNG BẢN QUYỀN DƯỚI CÙNG */}
      <div className="border-t border-slate-200/80 py-6 text-sm text-[#6a6f7a]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="font-normal text-xs md:text-sm">
            © {new Date().getFullYear()} <span className="text-[#1f2124] font-semibold">coursera</span> Inc. All rights reserved.
          </div>
          <div className="flex gap-6 text-xs font-normal">
            <Link href="/terms" className="text-[#40444d] hover:text-[#0056d2] hover:underline transition">Điều khoản dịch vụ</Link>
            <Link href="/privacy" className="text-[#40444d] hover:text-[#0056d2] hover:underline transition">Chính sách bảo mật</Link>
            <Link href="/help" className="text-[#40444d] hover:text-[#0056d2] hover:underline transition">Trung tâm trợ giúp</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}