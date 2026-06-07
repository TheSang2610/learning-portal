"use client";

import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Building2 } from "lucide-react";
import Link from "next/link";
import { getHomeSections, Course } from "@/src/services/course"; 
import { getCategories, Category } from "@/src/services/categoryService"; 

interface HomeSectionsState {
  mostPopular: Course[];
  trendingNow: Course[];
  newReleases: Course[];
}

// ==========================================
// SKELETON LOADING COMPONENT (LIGHT MODE)
// ==========================================
function PopularCoursesSkeleton() {
  return (
    <section className="bg-[#f5f7fa] py-10 animate-pulse">
      <div className="max-w-7xl mx-auto px-6">
        {/* Tiêu đề & mô tả giả lập */}
        <div className="space-y-2">
          <div className="h-6 bg-slate-200 rounded w-64 md:w-80"></div>
          <div className="h-4 bg-slate-200 rounded w-96 max-w-full"></div>
        </div>

        {/* Khung lưới Grid 3 cột tương thích layout thực tế */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {[1, 2, 3].map((colIndex) => (
            <div key={colIndex} className="bg-[#ebf3ff]/60 rounded-2xl p-4 flex flex-col gap-4 border border-blue-50/50">
              {/* Header cột giả lập */}
              <div className="h-5 bg-slate-200 rounded w-36 my-1"></div>

              {/* Danh sách các thẻ bài học dọc bên trong */}
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((cardIndex) => (
                  <div key={cardIndex} className="bg-white rounded-xl p-3 flex gap-4 border border-slate-100 shadow-sm">
                    {/* Trái: Ảnh Thumbnail giả lập */}
                    <div className="w-16 h-16 rounded-lg bg-slate-200 flex-shrink-0"></div>

                    {/* Phải: Thông tin chi tiết */}
                    <div className="flex flex-col justify-between flex-1 min-w-0 py-0.5">
                      <div className="space-y-2">
                        {/* Hàng logo đối tác / Tổ chức cấp phát */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-3.5 h-3.5 bg-slate-200 rounded-sm"></div>
                          <div className="h-3 bg-slate-200 rounded w-20"></div>
                        </div>
                        {/* Tiêu đề khóa học (2 dòng giả lập lệch chiều dài) */}
                        <div className="h-4 bg-slate-200 rounded w-11/12"></div>
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      </div>

                      {/* Hàng Badge cấp độ, số bài học và giá tiền */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-3.5 bg-slate-200 rounded w-12"></div>
                        <div className="h-3 bg-slate-200 rounded w-16"></div>
                        <div className="h-3 bg-slate-200 rounded w-14 ml-auto"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ==========================================
// MAIN COMPONENT: POPULAR COURSES SECTION
// ==========================================
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
        const [response, categoriesRes] = await Promise.all([
          getHomeSections(),
          getCategories(),
        ]);
        
        if (response && response.success && response.data) {
          setSections({
            mostPopular: response.data.mostPopular || [],
            trendingNow: response.data.trendingNow || [],
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

  // Thay thế vòng xoay Loading bằng Component Skeleton thông minh
  if (loading) {
    return <PopularCoursesSkeleton />;
  }

  const getCategorySlug = (course: any) => {
    const catData = course.category;
    if (!catData) return "general";
    const catId = typeof catData === "object" ? (catData._id || catData.$oid) : catData;
    const cat = categories.find((c) => c._id === catId);
    return cat?.slug || cat?.name?.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-") || "general";
  };

  const categoriesColumns = [
    { id: "most-popular", title: "Phổ biến nhất", data: sections.mostPopular },
    { id: "hot-releases", title: "Mới phát hành", data: sections.newReleases },
    { id: "trending-now", title: "Đang thịnh hành", data: sections.trendingNow },
  ];

  const hasData = categoriesColumns.some(col => col.data.length > 0);

  return (
    <section className="bg-[#f5f7fa] py-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* TITLE */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1f1f1f]">
            Khoá học mới và phổ biến
          </h2>
          <p className="text-sm text-gray-500 mt-1">Khám phá các khóa học trực tuyến và bài học riêng lẻ mới nhất của chúng tôi.</p>
        </div>

        {!hasData ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed mt-6">
            Không có khóa học nào được Admin kích hoạt hiển thị lên trang chủ vào lúc này.
          </div>
        ) : (
          /* 3 COLUMNS GRID CONTAINER */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {categoriesColumns.map((column) => {
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
                              {/* PROVIDER ROW */}
                              <div className="flex items-center gap-2 min-w-0 flex-wrap">
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