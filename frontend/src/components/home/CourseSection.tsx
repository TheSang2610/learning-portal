"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";
import { getCourses, layIdChuDe, type Course } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { locKhoaDaDang } from "@/src/components/home/locKhoaHoc";
import TieuDeMuc from "./TieuDeMuc";
import TheKhoaHoc from "./TheKhoaHoc";

function CourseGridSkeleton() {
  return (
    <div className="mt-8 grid animate-pulse grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:py-16">
        <TieuDeMuc
          tieuDe="Tất cả khoá học"
          moTa="Toàn bộ khoá học đang mở trên hệ thống. Lọc theo lĩnh vực, cấp độ hoặc học phí."
        />

        {/* THANH BỘ LỌC (Giữ nguyên cấu trúc để UI không bị trống trải khi đang tải) */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
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
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
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
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[13px] font-medium text-slate-700 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="all">Tất cả học phí</option>
                <option value="free">Miễn phí</option>
                <option value="paid">Có phí</option>
              </select>
            </div>
          </div>

          {/* Ket qua + xoa loc.
              So khoa hoc luon hien chu khong chi hien khi dang loc: doi bo loc
              ma con so khong nhuc nhich la dau hieu duy nhat cho biet lua chon
              vua roi khong thu hep them duoc gi. */}
          <div className="flex items-center gap-3">
            <span className="text-[13px] text-slate-500">
              <b className="font-semibold text-slate-900 tabular-nums">
                {filteredCourses.length}
              </b>{" "}
              khoá học
            </span>

            {(selectedCategory !== "all" ||
              selectedLevel !== "all" ||
              selectedPrice !== "all") && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
              >
                <RotateCcw size={14} />
                Xoá bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* LISTING GRID HOẶC SKELETON */}
        {loading ? (
          <CourseGridSkeleton />
        ) : filteredCourses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed bg-slate-50 py-20 text-center text-gray-500">
            Không tìm thấy khóa học nào phù hợp với bộ lọc đã chọn.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course) => (
              <TheKhoaHoc
                key={course._id}
                khoa={course}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
