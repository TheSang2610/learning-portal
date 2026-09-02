"use client";

import { useEffect, useMemo, useState } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, ArrowLeft, User, Building2 } from "lucide-react";
import { getCourses, Course, layIdChuDe, tenGiangVien } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { locKhoaDaDang } from "@/src/components/home/locKhoaHoc";

interface Props {
  /**
   * Du lieu lay san tu may chu (xem app/(portal)/courses/page.tsx).
   *
   * Co san thi KHONG goi API luc mount nua. Rong thi may chu truyen null va
   * component tu goi nhu cu - de backend chet van con duong lui.
   */
  initialCourses?: Course[] | null;
  initialCategories?: Category[] | null;
}

export default function CourseSearchClient({ initialCourses, initialCategories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKeyword = searchParams.get("search") || ""; // /courses?search=...
  const categoryParam = searchParams.get("category") || ""; // /courses?category=...

  // Danh sach GOC (chua loc). Phep loc theo tu khoa / danh muc lam o duoi,
  // moi lan doi dia chi chi loc lai chu khong goi API lai.
  const [tatCa, setTatCa] = useState<Course[]>(initialCourses ?? []);
  const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
  const [loading, setLoading] = useState(!initialCourses);

  useEffect(() => {
    if (initialCourses) return;

    Promise.all([getCourses(), getCategories()])
      .then(([coursesRes, categoriesRes]) => {
        setTatCa(locKhoaDaDang(coursesRes));
        if (Array.isArray(categoriesRes)) setCategories(categoriesRes);
      })
      .catch((error) => console.error("Lỗi khi tìm kiếm khóa học:", error))
      .finally(() => setLoading(false));
  }, [initialCourses]);

  // Loc theo dia chi. Truoc day doan nay nam trong effect va goi lai API moi
  // lan doi tu khoa - doi mot chu la mot luot mang, du du lieu khong doi.
  const courses = useMemo(() => {
    // Loc theo tu khoa va theo chu de.
    //
    // layIdChuDe nam trong services/course.ts va chap nhan ca ba hinh dang cua
    // course.category - xem ghi chu tai dinh nghia Course. Truoc day cho nay tu
    // viet mot ban rieng chi xu ly object don, ma typeof [] cung la "object",
    // nen bo loc theo chu de o /courses luon tra ve rong.
    const thuocChuDe = (course: Course, slug: string) =>
      layIdChuDe(course.category).some(
        (id) => categories.find((c) => c._id === id)?.slug === slug,
      );

    let filtered = tatCa;

    if (categoryParam.trim() !== "") {
      filtered = filtered.filter((course) => thuocChuDe(course, categoryParam.trim()));
    }

    if (searchKeyword.trim() !== "") {
      const tu = searchKeyword.toLowerCase().trim();
      filtered = filtered.filter((course) => course.title.toLowerCase().includes(tu));
    }

    return filtered;
  }, [tatCa, categories, categoryParam, searchKeyword]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <button
          onClick={() => router.push("/")}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={14} /> VỀ TRANG CHỦ
        </button>

        <div className="mb-8">
          <span className="mb-1 block text-xs font-bold tracking-wider text-blue-600 uppercase">
            {categoryParam ? "Khóa học theo danh mục" : "Kết quả tìm kiếm toàn trang"}
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 md:text-3xl">
            {searchKeyword
              ? `Kết quả cho "${searchKeyword}"`
              : categoryParam
                ? categories.find((c) => c.slug === categoryParam)?.name || categoryParam
                : "Tất cả khóa học"}
          </h1>
        </div>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center text-gray-500 shadow-sm">
            Không tìm thấy khóa học nào phù hợp với từ khóa{" "}
            <strong className="text-gray-700">&quot;{searchKeyword}&quot;</strong>.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {courses.map((course) => {
              const instructorName =
                tenGiangVien(course.instructor) || "Expert Instructor";

              const rawProvider = course.provider;
              let providerName = "Hệ thống LMS";
              if (rawProvider && typeof rawProvider === "object") {
                providerName = rawProvider.name || "Hệ thống LMS";
              }

              return (
                <Link
                  href={`/course?slug=${course.slug}`}
                  key={course._id}
                  className="group flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm transition duration-300 hover:border-blue-100 hover:shadow-md"
                >
                  <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden border-b border-gray-100 bg-slate-100">
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
    </div>
  );
}
