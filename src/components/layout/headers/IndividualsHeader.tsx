"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, BookOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getCourses, Course } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import HeaderUserMenu from "./HeaderUserMenu";

export default function IndividualsHeader() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") ?? "");

  // 🌟 States quản lý Menu Explore
  const [categories, setCategories] = useState<Category[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [openExplore, setOpenExplore] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const exploreRef = useRef<HTMLDivElement>(null);

  const normalizeCategoryId = (
    value: string | { _id?: string; $oid?: string } | null | undefined,
  ): string | null => {
    if (!value) return null;
    if (typeof value === "string") return value;

    if (typeof value._id === "string") return value._id;
    if (typeof value.$oid === "string") return value.$oid;
    return null;
  };

  // LOAD CATEGORIES & COURSES CHO EXPLORE MENU
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [catsData, coursesData] = await Promise.all([
          getCategories(),
          getCourses(),
        ]);
        setCategories(catsData);
        setAllCourses(coursesData);
        if (catsData.length > 0) {
          setActiveCategory(catsData[0]._id); // Mặc định hover sẵn vào danh mục đầu tiên
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu cho menu Explore:", error);
      }
    };
    fetchMenuData();
  }, []);

  // CLICK OUTSIDE DROPDOWNS (Xử lý đóng cả menu avatar lẫn menu explore)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setOpenExplore(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // HÀM XỬ LÝ TÌM KIẾM TOÀN TRANG
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/courses");
    }
  };

  // 🌟 HÀM XỬ LÝ LỌC KHÓA HỌC THEO DANH MỤC (ĐÃ SỬA LỖI MẢNG MONGOOSE)
  const filteredCourses = allCourses.filter((course) => {
    if (!course.category || !activeCategory) return false;

    if (Array.isArray(course.category)) {
      return course.category.some((cat) => normalizeCategoryId(cat) === activeCategory);
    }

    return normalizeCategoryId(course.category) === activeCategory;
  });

  return (
    <div className="sticky top-0 z-50 border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        {/* LEFT */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-[26px] font-bold tracking-tight whitespace-nowrap text-blue-600"
          >
            Learning Portal
          </Link>

          {/* 🌟 EXPLORE DROPDOWN MENU */}
          <div className="relative" ref={exploreRef}>
            <button
              onClick={() => setOpenExplore(!openExplore)}
              className={`hidden items-center gap-1 rounded-full px-4 py-2.5 text-sm font-medium transition md:flex ${
                openExplore
                  ? "bg-blue-600 text-white"
                  : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}
            >
              Khám phá{" "}
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${openExplore ? "rotate-180" : ""}`}
              />
            </button>

            {/* MEGA MENU CONTAINER */}
            {openExplore && categories.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2 absolute top-12 left-0 z-50 flex w-[680px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl duration-200">
                {/* CỘT TRÁI: DANH MỤC (CATEGORIES) */}
                <div className="w-2/5 border-r border-gray-100 bg-gray-50 py-3">
                  <div className="px-4 py-2 text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Danh mục ngành học
                  </div>
                  <div className="max-h-[380px] overflow-y-auto">
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onMouseEnter={() => setActiveCategory(cat._id)} // Rê chuột qua đâu đổi nội dung bên phải qua đó
                        onClick={() => {
                          router.push(`/courses?category=${cat.slug}`);
                          setOpenExplore(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold transition-colors ${
                          activeCategory === cat._id
                            ? "border-l-4 border-blue-600 bg-white text-blue-600"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        <span className="text-xs text-gray-500">→</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* CỘT PHẢI: KHÓA HỌC TƯƠNG ỨNG (COURSES) */}
                <div className="flex w-3/5 flex-col justify-between p-4">
                  <div>
                    <div className="mb-3 text-xs font-bold tracking-wider text-gray-500 uppercase">
                      Khóa học phổ biến
                    </div>
                    <div className="max-h-[300px] space-y-1 overflow-y-auto pr-1">
                      {filteredCourses.length > 0 ? (
                        filteredCourses.map((course) => (
                          <Link
                            key={course._id}
                            href={`/course?slug=${course.slug}`}
                            onClick={() => setOpenExplore(false)}
                            className="group flex items-start gap-2.5 rounded-xl p-2 text-left transition hover:bg-blue-50/70"
                          >
                            <BookOpen
                              size={16}
                              className="mt-0.5 flex-shrink-0 text-gray-500 group-hover:text-blue-500"
                            />
                            <div className="min-w-0">
                              <p className="line-clamp-1 text-sm font-medium text-gray-800 group-hover:text-blue-600">
                                {course.title}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                Trình độ: {course.level || "Tất cả"}
                              </p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="py-4 text-center text-sm text-gray-500 italic">
                          Chưa có khóa học nào thuộc nhóm này.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NÚT XEM TẤT CẢ PHÍA DƯỚI */}
                  {activeCategory && (
                    <div className="mt-2 border-t border-gray-100 pt-3">
                      <button
                        onClick={() => {
                          const activeCatSlug = categories.find(
                            (c) => c._id === activeCategory,
                          )?.slug;
                          router.push(`/courses?category=${activeCatSlug}`);
                          setOpenExplore(false);
                        }}
                        className="w-full rounded-xl bg-blue-50/50 py-2.5 text-center text-xs font-bold text-blue-600 transition hover:bg-blue-600 hover:text-white"
                      >
                        Xem tất cả khóa học của nhóm này
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* <Link href="/degrees" className="hidden md:block text-sm hover:text-blue-600 transition">
            Degrees
          </Link> */}
        </div>

        {/* SEARCH BAR */}
        <div className="hidden flex-1 lg:flex">
          <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="What do you want to learn?"
              className="w-full rounded-full border border-gray-300 py-3 pr-14 pl-5 text-sm outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              className="absolute top-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700"
            >
              <Search size={20} />
            </button>
          </form>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">
          <HeaderUserMenu />
        </div>
      </div>
    </div>
  );
}
