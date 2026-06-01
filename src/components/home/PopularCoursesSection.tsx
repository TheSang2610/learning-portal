"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, User, Building2 } from "lucide-react";
import Link from "next/link";

// 🎯 THÊM: Import hàm getHomeSections thay vì getCourses
import { getHomeSections, Course } from "@/src/services/course"; 
import { getCategories, Category } from "@/src/services/categoryService"; 

interface HomeSectionsState {
  mostPopular: Course[];
  trendingNow: Course[];
  newReleases: Course[];
}

export default function PopularCoursesSection() {
  const [sections, setSections] = useState<HomeSectionsState>({
    mostPopular: [],
    trendingNow: [],
    newReleases: [],
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // 🎯 Gọi API cấu trúc phân mục trang chủ song song với danh mục
        const [response, categoriesRes] = await Promise.all([
          getHomeSections(),
          getCategories(),
        ]);
        
        if (response && response.success && response.data) {
          setSections({
            mostPopular: response.data.mostPopular || [],
            trendingNow: response.data.trendingNow || [],
            // Đồng bộ key hot-releases của UI với key newReleases của API
            newReleases: response.data.newReleases || [],
          });
        }
        if (categoriesRes) {
          setCategories(categoriesRes);
        }
      } catch (error) {
        console.error("Lỗi khi load danh sách cấu trúc trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-[#f5f7fa]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600 font-medium">Loading courses...</span>
      </div>
    );
  }

  const getCategorySlug = (course: any) => {
    const catData = course.category;
    if (!catData) return "general";
    const catId = typeof catData === "object" ? (catData._id || catData.$oid) : catData;
    const cat = categories.find((c) => c._id === catId);
    return cat?.slug || cat?.name?.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-") || "general";
  };

  // Cấu hình các cột hiển thị dựa trên dữ liệu thật thu được từ Database
  const categoriesColumns = [
    { id: "most-popular", title: "Most popular", data: sections.mostPopular },
    { id: "hot-releases", title: "Hot new releases", data: sections.newReleases },
    { id: "trending-now", title: "Trending now", data: sections.trendingNow },
  ];

  // Kiểm tra xem tổng cả 3 mục có mục nào có khóa học hay không
  const hasData = categoriesColumns.some(col => col.data.length > 0);

  return (
    <section className="bg-[#f5f7fa] py-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* TITLE */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1f1f1f]">
            New and popular
          </h2>
          <p className="text-sm text-gray-500 mt-1">Explore our latest online courses and single lessons</p>
        </div>

        {!hasData ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed mt-6">
            Không có khóa học nào được Admin kích hoạt hiển thị lên trang chủ vào lúc này.
          </div>
        ) : (
          /* 3 COLUMNS GRID CONTAINER */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {categoriesColumns.map((column) => {
              // 🎯 HOÀN TOÀN TỰ ĐỘNG: Nếu Admin tắt hết khóa học của mục này, cột đó tự ẩn đi
              if (column.data.length === 0) return null;

              return (
                <div
                  key={column.id}
                  className="bg-[#ebf3ff] rounded-2xl p-4 flex flex-col gap-4"
                >
                  {/* CATEGORY HEADER */}
                  <Link 
                    href={`/collections/${column.id}-courses`}
                    className="inline-flex items-center gap-1 text-base font-bold text-[#1f1f1f] w-fit hover:text-blue-600 transition group/title cursor-pointer"
                  >
                    {column.title}
                    <ArrowRight 
                      size={16} 
                      className="mt-0.5 ml-1 text-blue-600 transition-transform group-hover/title:translate-x-1" 
                    />
                  </Link>

                  {/* COURSE LIST (VERTICAL) */}
                  <div className="flex flex-col gap-3">
                    {column.data.map((course) => {
                      // const instructorName = typeof course.instructor === "object" && course.instructor !== null
                      //   ? (course.instructor as any).name 
                      //   : course.instructor || "Expert Instructor";

                      const rawProvider = course.provider;
                      let providerLogo: string | null = null;
                      let providerName = "Hệ thống LMS";

                      if (rawProvider && typeof rawProvider === "object") {
                        const p = rawProvider as any;
                        providerLogo = p.logo || null;
                        providerName = p.name || "Hệ thống LMS";
                      }

                      return (
                        <Link
                          href={`/${getCategorySlug(course)}/${course.slug}`}
                          key={course._id}
                          className="bg-white rounded-xl p-3 flex gap-4 shadow-sm hover:shadow-md transition duration-200 cursor-pointer border border-transparent hover:border-blue-100 group"
                        >
                          {/* LEFT: THUMBNAIL */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center relative">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <BookOpen size={24} className="text-slate-400" />
                            )}
                          </div>

                          {/* RIGHT: INFO */}
                          <div className="flex flex-col justify-between min-w-0 flex-1">
                            <div>
                              {/* INSTRUCTOR & PROVIDER ROW */}
                              <div className="flex items-center gap-2 min-w-0 flex-wrap">
                                {/* <div className="flex items-center gap-1.5 min-w-0">
                                  <User size={12} className="text-gray-400 flex-shrink-0" />
                                  <p className="text-xs text-gray-500 truncate max-w-[110px]">
                                    {instructorName}
                                  </p>
                                </div>

                                <span className="text-gray-200 text-xs flex-shrink-0">|</span> */}

                                <div className="flex items-center gap-1 min-w-0" title={`Cấp bởi: ${providerName}`}>
                                  {providerLogo ? (
                                    <div className="w-4 h-4 rounded border bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                                      <img 
                                        src={providerLogo} 
                                        alt={providerName} 
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <Building2 size={12} className="text-violet-400 flex-shrink-0" />
                                  )}
                                  <p className="text-[11px] font-medium text-violet-600 truncate max-w-[90px]">
                                    {providerName}
                                  </p>
                                </div>
                              </div>

                              {/* COURSE TITLE */}
                              <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mt-1 leading-snug group-hover:text-blue-600 transition">
                                {course.title}
                              </h4>
                            </div>

                            {/* BADGE LEVEL & LESSONS COUNT */}
                            <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-500 font-medium">
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 capitalize">
                                {course.level}
                              </span>
                              <span>•</span>
                              <span className="text-blue-600 flex items-center gap-0.5">
                                {course.lessons?.length || 0} bài học
                              </span>
                              <span>•</span>
                              <span className="text-slate-800 font-bold">
                                {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")}đ`}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}