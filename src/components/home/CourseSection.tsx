"use client";

import { useEffect, useMemo, useState } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
import { BookOpen, User, Building2, Filter, RotateCcw } from "lucide-react";
import Link from "next/link";
import { getCourses, layIdChuDe, type Course } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { locKhoaDaDang } from "@/src/components/home/locKhoaHoc";

function CourseGridSkeleton() {
  return (
    <div className="mt-8 grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
        <div
          key={index}
          className="flex h-[320px] flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
        >
          {/* Trên: Khung ảnh Thumbnail giả lập tỷ lệ aspect-video */}
          <div className="aspect-video w-full bg-slate-200"></div>

          {/* Dưới: Khung nội dung chi tiết */}
          <div className="flex flex-1 flex-col justify-between p-4">
            <div className="space-y-3">
              {/* Hàng Instructor và Provider giả lập */}
              <div className="flex items-center gap-2">
                <div className="h-3 w-16 rounded bg-slate-200"></div>
                <span className="text-xs text-slate-400">|</span>
                <div className="h-3 w-20 rounded bg-slate-200"></div>
              </div>

              {/* Tiêu đề khóa học giả lập (2 dòng lệch size) */}
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-slate-200"></div>
                <div className="h-4 w-4/5 rounded bg-slate-200"></div>
              </div>
            </div>

            {/* Bottom bar giả lập: Level, Số bài, Giá tiền */}
            <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-12 rounded bg-slate-200"></div>
                <div className="h-3.5 w-14 rounded bg-slate-200"></div>
              </div>
              <div className="h-4 w-16 rounded bg-slate-200"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
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
  initialCourses?: Course[] | null;
  initialCategories?: Category[] | null;
}

export default function CourseSection({ initialCourses, initialCategories }: Props) {
  const [courses, setCourses] = useState<Course[]>(initialCourses ?? []);
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const [loading, setLoading] = useState(!initialCourses);

  // States quản lý bộ lọc
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedPrice, setSelectedPrice] = useState<string>("all");

  useEffect(() => {
    if (initialCourses) return;

    Promise.all([getCourses(), getCategories()])
      .then(([coursesRes, categoriesRes]) => {
        // filteredCourses tu suy ra tu courses qua useMemo ben duoi,
        // khong can set rieng nua.
        setCourses(locKhoaDaDang(coursesRes));
        if (Array.isArray(categoriesRes)) setCategories(categoriesRes);
      })
      .catch((error) => console.error("Lỗi khi tải dữ liệu:", error))
      .finally(() => setLoading(false));
  }, [initialCourses]);

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Lọc theo Category
    if (selectedCategory !== "all") {
      // layIdChuDe xu ly ca ba hinh dang cua course.category (mang id, mang doi
      // tuong da populate, dang { $oid }) - xem ghi chu tai dinh nghia Course.
      result = result.filter((course) =>
        layIdChuDe(course.category).includes(selectedCategory),
      );
    }

    // Lọc theo Trình độ (Level)
    if (selectedLevel !== "all") {
      result = result.filter(
        (course) => course.level?.toLowerCase() === selectedLevel.toLowerCase(),
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

    return result;
  }, [selectedCategory, selectedLevel, selectedPrice, courses]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSelectedPrice("all");
  };

  return (
    <section className="border-t border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="border-b border-gray-100 pb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tất cả khóa học</h2>
          <p className="mt-1 text-sm text-gray-500">
            Khám phá toàn bộ khoá học trực tuyến hiện có trên hệ thống
          </p>
        </div>

        {/* THANH BỘ LỌC (Giữ nguyên cấu trúc để UI không bị trống trải khi đang tải) */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-slate-50 p-4">
          <div className="flex flex-1 flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Filter size={16} className="text-blue-600" />
              <span>Bộ lọc:</span>
            </div>

            {/* Chọn Danh mục */}
            <div className="flex min-w-[160px] flex-col">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
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
            <div className="flex min-w-[140px] flex-col">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="beginner">Sơ cấp (Beginner)</option>
                <option value="intermediate">Trung cấp (Intermediate)</option>
                <option value="advanced">Cao cấp (Advanced)</option>
              </select>
            </div>

            {/* Chọn Học phí */}
            <div className="flex min-w-[140px] flex-col">
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Tất cả học phí</option>
                <option value="free">Miễn phí</option>
                <option value="paid">Có phí</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          {(selectedCategory !== "all" ||
            selectedLevel !== "all" ||
            selectedPrice !== "all") && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-100 hover:text-red-600"
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
          <div className="mt-8 rounded-2xl border border-dashed bg-slate-50 py-20 text-center text-gray-500">
            Không tìm thấy khóa học nào phù hợp với bộ lọc đã chọn.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredCourses.map((course) => {
              const instructorName =
                typeof course.instructor === "object" && course.instructor !== null
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
                  key={course._id}
                  className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:border-blue-100 hover:shadow-md"
                >
                  <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-slate-100">
                    {course.thumbnail ? (
                      <SafeImage
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <BookOpen size={36} className="text-slate-400" />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <div className="flex min-w-0 items-center gap-1">
                          <User size={12} className="flex-shrink-0 text-gray-500" />
                          <p className="max-w-[100px] truncate text-xs text-gray-500">
                            {instructorName}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">|</span>
                        <div className="flex min-w-0 items-center gap-1">
                          <Building2
                            size={12}
                            className="flex-shrink-0 text-violet-400"
                          />
                          <p className="max-w-[90px] truncate text-[11px] font-medium text-violet-600">
                            {providerName}
                          </p>
                        </div>
                      </div>

                      <h4 className="mb-3 line-clamp-2 text-sm leading-snug font-bold text-gray-900 transition group-hover:text-blue-600">
                        {course.title}
                      </h4>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3 text-[11px] font-medium text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 capitalize">
                          {course.level}
                        </span>
                        <span>•</span>
                        <span className="text-blue-600">
                          {course.lessons?.length || 0} bài học
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {course.price === 0
                          ? "Miễn phí"
                          : `${course.price.toLocaleString("vi-VN")}đ`}
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
