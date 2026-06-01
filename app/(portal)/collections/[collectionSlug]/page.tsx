// app/(portal)/individuals/courses/collections/[collectionSlug]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { getHomeSections, Course } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";

interface PageProps {
  params: Promise<{ collectionSlug: string }>;
}

export default function CourseCollectionPage({ params }: PageProps) {
  const router = useRouter();
  const { collectionSlug } = use(params);

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pageTitle, setPageTitle] = useState("Danh sách khóa học");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollection = async () => {
      try {
        setLoading(true);
        const [response, categoriesRes] = await Promise.all([
          getHomeSections(),
          getCategories(),
        ]);
        
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
          if (categoriesRes) {
            setCategories(categoriesRes);
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

  const getCategorySlug = (course: any) => {
    const catData = course.category;
    if (!catData) return "general";
    const catId = typeof catData === "object" ? (catData._id || catData.$oid) : catData;
    const cat = categories.find((c) => c._id === catId);
    return cat?.slug || cat?.name?.toLowerCase().replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "-") || "general";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* NÚT QUAY LẠI & BREADCRUMB */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft size={14} /> QUAY LẠI TRANG CHỦ
        </button>

        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-8">{pageTitle}</h1>

        {courses.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed">
            Hiện không có khóa học nào hiển thị ở mục này.
          </div>
        ) : (
          /* DANH SÁCH KHÓA HỌC DẠNG GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => {
              const rawProvider = course.provider as any;
              const providerName = rawProvider?.name || "Hệ thống LMS";

              return (
                <Link
                  href={`/${getCategorySlug(course)}/${course.slug}`} // Khi click sẽ nhảy thẳng vào trang chi tiết (file có sẵn của bạn)
                  key={course._id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200/60 shadow-sm hover:shadow-md transition duration-200 flex flex-col group cursor-pointer"
                >
                  {/* THUMBNAIL */}
                  <div className="aspect-video w-full bg-gray-100 relative overflow-hidden border-b border-gray-100">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <BookOpen size={32} />
                      </div>
                    )}
                  </div>

                  {/* THÔNG TIN */}
                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-violet-600 uppercase block mb-1">
                        {providerName}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                        {course.title}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                      <span className="capitalize bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {course.level}
                      </span>
                      <span className="text-slate-800 font-bold">
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
    </div>
  );
}