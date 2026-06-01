// app/(portal)/individuals/courses/browse/[categorySlug]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, ArrowLeft, User, Building2 } from "lucide-react";
import { getCourses, Course } from "@/src/services/course";
import { getCategories, Category } from "@/src/services/categoryService";

interface PageProps {
  params: Promise<{ categorySlug: string }>;
}

export default function CategoryBrowsePage({ params }: PageProps) {
  const router = useRouter();
  const { categorySlug } = use(params);

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 🌟 Gọi song song cả danh sách khoá học lẫn danh mục
        const [coursesRes, categoriesRes] = await Promise.all([
          getCourses(),
          getCategories(),
        ]);

        // 1. Chuẩn hoá dữ liệu courses trả về từ API (giống CourseSection)
        let rawCourses: any[] = [];
        if (Array.isArray(coursesRes)) {
          rawCourses = coursesRes;
        } else if (coursesRes && typeof coursesRes === "object" && Array.isArray((coursesRes as any).data)) {
          rawCourses = (coursesRes as any).data;
        }

        // Chỉ lấy các khoá học công khai (bỏ qua filter nếu muốn test khoá nháp)
        const publishedCourses = rawCourses.filter((c: any) => c.isPublished !== undefined ? c.isPublished : true);

        // 2. Tìm danh mục hiện tại dựa vào categorySlug trên URL
        let currentCategory: Category | undefined = undefined;
        if (Array.isArray(categoriesRes)) {
          setCategories(categoriesRes);
          currentCategory = categoriesRes.find((cat) => {
            const catSlug = cat.slug || cat.name.toLowerCase().replace(/ /g, "-");
            return catSlug === categorySlug;
          });
        }

        if (categorySlug === "general") {
          // Hiển thị tất cả khóa học nếu slug là 'general'
          setCategoryName("Tất cả khóa học");
          setCourses(publishedCourses);
        } else if (currentCategory) {
          // Lưu tên danh mục có dấu chuẩn từ DB để hiển thị lên UI
          setCategoryName(currentCategory.name);
          const targetCategoryId = currentCategory._id;
 
          // 3. 🎯 LOGIC LỌC THẦN THÁNH: Bóc tách cấu trúc MongoDB y hệt CourseSection của bạn
          const filtered = publishedCourses.filter((course) => {
            const catData = course.category;
            if (!catData) return false;
 
            // Trường hợp 1: Category là một mảng dữ liệu
            if (Array.isArray(catData)) {
              return catData.some((item: any) => {
                if (typeof item === "string") return item === targetCategoryId;
                if (item && item.$oid) return item.$oid === targetCategoryId;
                if (item && item._id) return item._id === targetCategoryId;
                return false;
              });
            }
 
            // Trường hợp 2: Category là một Object đơn lẻ
            if (typeof catData === "object") {
              if ((catData as any).$oid) return (catData as any).$oid === targetCategoryId;
              if ((catData as any)._id) return (catData as any)._id === targetCategoryId;
            }
 
            // Trường hợp 3: Category là chuỗi string thuần chứa ID
            return catData === targetCategoryId;
          });
 
          setCourses(filtered);
        } else {
          // Dự phòng nếu không tìm thấy danh mục tương ứng trong DB
          const fallbackTitle = categorySlug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          setCategoryName(fallbackTitle);
          setCourses([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu phân loại khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categorySlug]);

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
        
        {/* BUTTON BACK */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-blue-600 mb-6 transition"
        >
          <ArrowLeft size={14} /> QUAY LẠI
        </button>

        {/* TITLE */}
        <div className="mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">Chủ đề phổ biến</span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Khóa học {categoryName}</h1>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm">
            Hiện chưa có khóa học nào trực thuộc danh mục <strong className="text-gray-700">"{categoryName}"</strong>.
          </div>
        ) : (
          /* GRID LIST - Sử dụng chung cấu trúc design đẹp từ CourseSection */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => {
              const instructorName = typeof course.instructor === "object" && course.instructor !== null
                ? (course.instructor as any).name 
                : "Expert Instructor";
              
              const rawProvider = course.provider;
              let providerName = "Hệ thống LMS";
              if (rawProvider && typeof rawProvider === "object") {
                providerName = (rawProvider as any).name || "Hệ thống LMS";
              }

              return (
                <Link
                  href={`/${getCategorySlug(course)}/${course.slug}`}
                  key={course._id}
                  className="bg-white rounded-2xl flex flex-col justify-between overflow-hidden border border-gray-200/60 shadow-sm hover:shadow-md hover:border-blue-100 transition duration-300 group cursor-pointer"
                >
                  <div className="aspect-video w-full bg-slate-100 flex items-center justify-center relative overflow-hidden border-b border-gray-100">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <BookOpen size={36} className="text-slate-300" />
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <div className="flex items-center gap-1 min-w-0">
                          <User size={12} className="text-gray-400 flex-shrink-0" />
                          <p className="text-xs text-gray-500 truncate max-w-[100px]">{instructorName}</p>
                        </div>
                        <span className="text-gray-200 text-xs">|</span>
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
    </div>
  );
}