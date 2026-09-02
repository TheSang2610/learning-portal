// app/(portal)/collection/page.tsx  ->  /collection?slug=...
"use client";

import { Suspense, useEffect, useState } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getHomeSections, Course } from "@/src/services/course";

function CourseCollectionPageContent() {
  const router = useRouter();
  // Lay slug tu query string: /collection?slug=most-popular-courses
  const searchParams = useSearchParams();
  const collectionSlug = searchParams.get("slug") || "";

  const [courses, setCourses] = useState<Course[]>([]);

  const [pageTitle, setPageTitle] = useState("Danh sách khóa học");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollection = async () => {
      try {
        setLoading(true);
        const response = await getHomeSections();

        if (response && response.success && response.data) {
          // Khớp slug từ URL để lọc mảng dữ liệu tương ứng từ API
          if (collectionSlug === "most-popular-courses") {
            setCourses(response.data.mostPopular || []);
            setPageTitle("Most Popular Courses");
          } else if (collectionSlug === "hot-releases-courses") {
            setCourses(response.data.newReleases || []);
            setPageTitle("Hot New Releases");
          } else if (collectionSlug === "trending-now-courses") {
            setCourses(response.data.trendingNow || []);
            setPageTitle("Trending Now Courses");
          }
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
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* NÚT QUAY LẠI & BREADCRUMB */}
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={14} /> QUAY LẠI TRANG CHỦ
        </button>

        <h1 className="mb-8 text-2xl font-extrabold text-gray-900 md:text-3xl">
          {pageTitle}
        </h1>

        {courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-white py-16 text-center text-gray-500">
            Hiện không có khóa học nào hiển thị ở mục này.
          </div>
        ) : (
          /* DANH SÁCH KHÓA HỌC DẠNG GRID */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {courses.map((course) => {
              const rawProvider = course.provider;
              const providerName =
                rawProvider && typeof rawProvider === "object"
                  ? rawProvider.name || "Hệ thống LMS"
                  : "Hệ thống LMS";

              return (
                <Link
                  href={`/course?slug=${course.slug}`} // Khi click sẽ nhảy thẳng vào trang chi tiết (file có sẵn của bạn)
                  key={course._id}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-sm transition duration-200 hover:shadow-md"
                >
                  {/* THUMBNAIL */}
                  <div className="relative aspect-video w-full overflow-hidden border-b border-gray-100 bg-gray-100">
                    {course.thumbnail ? (
                      <SafeImage
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-500">
                        <BookOpen size={32} />
                      </div>
                    )}
                  </div>

                  {/* THÔNG TIN */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <span className="mb-1 block text-[11px] font-semibold text-violet-600 uppercase">
                        {providerName}
                      </span>
                      <h3 className="line-clamp-2 text-sm leading-snug font-bold text-gray-900 transition group-hover:text-blue-600">
                        {course.title}
                      </h3>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs font-medium text-gray-500">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 capitalize">
                        {course.level}
                      </span>
                      <span className="font-bold text-slate-800">
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

// Suspense la bat buoc: useSearchParams() khong the prerender tinh neu thieu boundary.
// Co boundary thi Next dung san khung HTML, Vercel phuc vu tu CDN, khong ton serverless.
export default function CourseCollectionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      }
    >
      <CourseCollectionPageContent />
    </Suspense>
  );
}
