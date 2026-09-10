"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCourses, Course, layIdChuDe } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";
import { locKhoaDaDang } from "@/src/components/home/locKhoaHoc";
import TieuDeMuc from "@/src/components/home/TieuDeMuc";
import TheKhoaHoc from "@/src/components/home/TheKhoaHoc";

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
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-16">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <button
          onClick={() => router.push("/")}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={14} /> VỀ TRANG CHỦ
        </button>

        <TieuDeMuc
          nhu="h1"
          tieuDe={
            searchKeyword
              ? `Kết quả cho "${searchKeyword}"`
              : categoryParam
                ? categories.find((c) => c.slug === categoryParam)?.name || categoryParam
                : "Tất cả khoá học"
          }
          moTa={
            // Dem duoc bao nhieu thi noi bay nhieu. Cau chu cu ("Ket qua tim
            // kiem toan trang") chi lap lai cai tieu de vua doc xong.
            courses.length > 0
              ? `${courses.length} khoá học${categoryParam ? " trong danh mục này" : ""}.`
              : undefined
          }
        />

        {courses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
            {/* Khong con noi cung mot cau cho moi truong hop: tim khong ra va
                danh muc rong la hai chuyen khac nhau, ma cau cu luon chen tu
                khoa vao - vao tu danh muc thi hien ra cap nhay rong. */}
            {searchKeyword ? (
              <>
                Không tìm thấy khoá học nào cho{" "}
                <strong className="text-slate-700">&quot;{searchKeyword}&quot;</strong>.
              </>
            ) : (
              "Danh mục này chưa có khoá học nào."
            )}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {courses.map((course) => (
              <TheKhoaHoc
                key={course._id}
                khoa={course}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
