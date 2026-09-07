import { Suspense } from "react";
import CourseSearchClient from "@/src/components/courses/CourseSearchClient";
import { locKhoaDaDang } from "@/src/components/home/locKhoaHoc";
import type { Category } from "@/src/services/categoryService";
import { layTuMayChu } from "@/src/services/serverFetch";

export const metadata = {
  title: "Khóa học",
  description: "Tìm khóa học theo từ khóa hoặc theo danh mục.",
};

// Danh sach khoa hoc doi khi admin dang bai moi, khong dung trang tinh vinh vien.
export const revalidate = 60;

export default async function SearchResultPage() {
  // Lay ca danh sach mot lan o may chu. Phep loc theo ?search= va ?category=
  // lam o phia trinh duyet tren chinh danh sach nay, nen doi tu khoa khong
  // sinh them luot mang nao.
  const [coursesRes, categories] = await Promise.all([
    layTuMayChu<unknown>("/api/courses", []),
    layTuMayChu<Category[]>("/api/categories", []),
  ]);

  const khoa = locKhoaDaDang(coursesRes);

  return (
    // useSearchParams() ben trong bat buoc phai co Suspense, neu khong ca
    // trang mat kha nang prerender tinh.
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <CourseSearchClient
        // Rong -> null de trinh duyet tu goi lai, xem ghi chu trong component.
        initialCourses={khoa.length ? khoa : null}
        initialCategories={categories.length ? categories : null}
      />
    </Suspense>
  );
}
