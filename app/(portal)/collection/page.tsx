// app/(portal)/collection/page.tsx  ->  /collection?slug=...
"use client";

import { Suspense, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getHomeSections, Course } from "@/src/services/course";
import TieuDeMuc from "@/src/components/home/TieuDeMuc";
import TheKhoaHoc from "@/src/components/home/TheKhoaHoc";

// Ba muc nay chinh la ba cot o trang chu (PopularCoursesSection).
//
// Ten phai TRUNG voi ten cot ben do. Truoc day nguoi dung bam "Phổ biến nhất"
// roi dap xuong mot trang de "Most Popular Courses" - doi ca ngon ngu lan cach
// goi, khong con chac minh vua bam trung cho khong.
//
// Cai mo ta cung noi ro so lieu nao dung de xep - vi ca ba deu la BANG XEP
// HANG, va thu hang chi co nghia khi biet no xep theo cai gi.
const MUC: Record<
  string,
  { ten: string; moTa: string; lay: "mostPopular" | "newReleases" | "trendingNow" }
> = {
  "most-popular-courses": {
    ten: "Phổ biến nhất",
    moTa: "Xếp theo số lượt ghi danh, nhiều nhất lên đầu.",
    lay: "mostPopular",
  },
  "hot-releases-courses": {
    ten: "Mới phát hành",
    moTa: "Xếp theo ngày phát hành, khoá ra sau lên đầu.",
    lay: "newReleases",
  },
  "trending-now-courses": {
    ten: "Đang thịnh hành",
    moTa: "Xếp theo lượt xem gần đây, nhiều nhất lên đầu.",
    lay: "trendingNow",
  },
};

function CourseCollectionPageContent() {
  const router = useRouter();
  // Lay slug tu query string: /collection?slug=most-popular-courses
  const searchParams = useSearchParams();
  const collectionSlug = searchParams.get("slug") || "";
  const muc = MUC[collectionSlug];

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollection = async () => {
      try {
        setLoading(true);
        const response = await getHomeSections();
        const dinhNghia = MUC[collectionSlug];

        if (response?.success && response.data && dinhNghia) {
          setCourses(response.data[dinhNghia.lay] || []);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách bộ sưu tập khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [collectionSlug]);

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
        {/* NÚT QUAY LẠI & BREADCRUMB */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={14} /> QUAY LẠI
        </button>

        <TieuDeMuc nhu="h1" tieuDe={muc?.ten ?? "Danh sách khoá học"} moTa={muc?.moTa} />

        {courses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
            {muc
              ? "Mục này chưa có khoá học nào được hiển thị."
              : "Không có mục nào ứng với đường dẫn này."}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {courses.map((course, thuTu) => (
              // Co thuHang vi day DUNG la mot bang xep hang - trang chu cung
              // danh so cho ba cot nay. Con /courses thi khong, vi do la ket
              // qua loc, danh so vao la noi doi voi nguoi doc.
              <TheKhoaHoc
                key={course._id}
                khoa={course}
                thuHang={thuTu + 1}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Suspense la bat buoc: useSearchParams() khong the prerender tinh neu thieu boundary.
// Co boundary thi Next dung san khung HTML, Vercel phuc vu tu CDN, khong ton serverless.
export default function CourseCollectionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <CourseCollectionPageContent />
    </Suspense>
  );
}
