"use client";

import { useEffect, useState } from "react";
import { BookOpen, User, Building2, Filter, RotateCcw } from "lucide-react";
import Link from "next/link";
import { getCourses, Course } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";

function CourseGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8 animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
        <div
          key={index}
          className="bg-white rounded-2xl flex flex-col justify-between overflow-hidden border border-slate-100 shadow-sm h-[320px]"
        >
          {/* Trên: Khung ảnh Thumbnail giả lập tỷ lệ aspect-video */}
          <div className="aspect-video w-full bg-slate-200"></div>

          {/* Dưới: Khung nội dung chi tiết */}
          <div className="p-4 flex flex-col flex-1 justify-between">
            <div className="space-y-3">
              {/* Hàng Instructor và Provider giả lập */}
              <div className="flex items-center gap-2">
                <div className="h-3 bg-slate-200 rounded w-16"></div>
                <span className="text-slate-400 text-xs">|</span>
                <div className="h-3 bg-slate-200 rounded w-20"></div>
              </div>

              {/* Tiêu đề khóa học giả lập (2 dòng lệch size) */}
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-4/5"></div>
              </div>
            </div>

            {/* Bottom bar giả lập: Level, Số bài, Giá tiền */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
              <div className="flex items-center gap-2">
                <div className="h-3.5 bg-slate-200 rounded w-12"></div>
                <div className="h-3.5 bg-slate-200 rounded w-14"></div>
              </div>
              <div className="h-4 bg-slate-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CourseSection() {
  const [courses, setCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // States quản lý bộ lọc
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedPrice, setSelectedPrice] = useState<string>("all");

  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesRes, categoriesRes] = await Promise.all([
          getCourses(),
          getCategories(),
        ]);

        let rawCourses: any[] = [];
        if (Array.isArray(coursesRes)) {
          rawCourses = coursesRes;
        } else if (coursesRes && typeof coursesRes === "object" && Array.isArray((coursesRes as any).data)) {
          rawCourses = (coursesRes as any).data;
        }

        const published = rawCourses.filter((c: any) => c.isPublished !== undefined ? c.isPublished : true); 
        
        setCourses(published);
        setFilteredCourses(published);

        if (Array.isArray(categoriesRes)) {
          setCategories(categoriesRes);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let result = [...courses];

    // Lọc theo Category
    if (selectedCategory !== "all") {
      result = result.filter((course) => {
        const catData = course.category;
        if (!catData) return false;

        if (Array.isArray(catData)) {
          return catData.some((item: any) => {
            if (typeof item === "string") return item === selectedCategory;
            if (item && item.$oid) return item.$oid === selectedCategory;
            if (item && item._id) return item._id === selectedCategory;
            return false;
          });
        }

        if (typeof catData === "object") {
          if (catData.$oid) return catData.$oid === selectedCategory;
          if (catData._id) return catData._id === selectedCategory;
        }

        return catData === selectedCategory;
      });
    }

    // Lọc theo Trình độ (Level)
    if (selectedLevel !== "all") {
      result = result.filter(
        (course) => course.level?.toLowerCase() === selectedLevel.toLowerCase()
      );
    }

    // Lọc theo Giá cả (Price)
    if (selectedPrice !== "all") {
      if (selectedPrice === "free") {
        result = result.filter((course) => course.price === 0);
      } else if (selectedPrice === "paid") {
        result = result.filter((course) => course.price > 0);
      }
    }

    setFilteredCourses(result);
  }, [selectedCategory, selectedLevel, selectedPrice, courses]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSelectedPrice("all");
  };

  

  return (
    <section className="bg-white py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER */}
        <div className="pb-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Tất cả khóa học</h2>
          <p className="text-sm text-gray-500 mt-1">Khám phá toàn bộ khoá học trực tuyến hiện có trên hệ thống</p>
        </div>

        {/* THANH BỘ LỌC (Giữ nguyên cấu trúc để UI không bị trống trải khi đang tải) */}
        <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 flex-1">
            <div className="flex items-center gap-1.5 text-gray-700 text-sm font-semibold">
              <Filter size={16} className="text-blue-600" />
              <span>Bộ lọc:</span>
            </div>

            {/* Chọn Danh mục */}
            <div className="flex flex-col min-w-[160px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Chọn Cấp độ */}
            <div className="flex flex-col min-w-[140px]">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="beginner">Sơ cấp (Beginner)</option>
                <option value="intermediate">Trung cấp (Intermediate)</option>
                <option value="advanced">Cao cấp (Advanced)</option>
              </select>
            </div>

            {/* Chọn Học phí */}
            <div className="flex flex-col min-w-[140px]">
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
              >
                <option value="all">Tất cả học phí</option>
                <option value="free">Miễn phí</option>
                <option value="paid">Có phí</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {(selectedCategory !== "all" || selectedLevel !== "all" || selectedPrice !== "all") && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-semibold transition bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl"
            >
              <RotateCcw size={14} />
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* LISTING GRID HOẶC SKELETON */}
        {loading ? (
          <CourseGridSkeleton />
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-slate-50 rounded-2xl border border-dashed mt-8">
            Không tìm thấy khóa học nào phù hợp với bộ lọc đã chọn.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
            {filteredCourses.map((course) => {
              const instructorName = typeof course.instructor === "object" && course.instructor !== null
                ? course.instructor.name 
                : "Expert Instructor";
              
              const rawProvider = course.provider;
              let providerName = "Hệ thống LMS";

              if (rawProvider && typeof rawProvider === "object") {
                providerName = rawProvider.name || "Hệ thống LMS";
              }

              return (
                <Link
                  href={`/course?slug=${course.slug}`}
                  key={course._id?.$oid || course._id}
                  className="bg-white rounded-2xl flex flex-col justify-between overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition duration-300 group cursor-pointer"
                >
                  <div className="aspect-video w-full bg-slate-100 flex items-center justify-center relative overflow-hidden">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <BookOpen size={36} className="text-slate-400" />
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <div className="flex items-center gap-1 min-w-0">
                          <User size={12} className="text-gray-500 flex-shrink-0" />
                          <p className="text-xs text-gray-500 truncate max-w-[100px]">{instructorName}</p>
                        </div>
                        <span className="text-gray-400 text-xs">|</span>
                        <div className="flex items-center gap-1 min-w-0">
                          <Building2 size={12} className="text-violet-400 flex-shrink-0" />
                          <p className="text-[11px] font-medium text-violet-600 truncate max-w-[90px]">{providerName}</p>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition mb-3">
                        {course.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto text-[11px] text-gray-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 capitalize">{course.level}</span>
                        <span>•</span>
                        <span className="text-blue-600">{course.lessons?.length || 0} bài học</span>
                      </div>
                      <span className="text-slate-900 font-bold text-xs">
                        {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")}đ`}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}