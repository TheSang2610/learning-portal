"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Star, BookOpen, User } from "lucide-react";
import Link from "next/link";

import { getCourses, Course } from "@/src/services/course"; 

export default function PopularCoursesSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setLoading(true);
        // Gọi hàm từ file service của bạn
        const data = await getCourses();
        
        if (Array.isArray(data)) {
          // Chỉ lấy các khóa học đã được kích hoạt Public (isPublished === true)
          const publishedCourses = data.filter((c: Course) => c.isPublished);
          setCourses(publishedCourses);
        }
      } catch (error) {
        console.error("Lỗi khi load danh sách khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-[#f5f7fa]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600 font-medium">Loading courses...</span>
      </div>
    );
  }

  // Chia mảng khóa học thành các cụm (ví dụ tối đa 3 khóa học cho mỗi cột như giao diện mẫu Coursera)
  const mostPopular = courses.slice(0, 3);
  const hotReleases = courses.slice(3, 6);
  const trendingNow = courses.slice(6, 9);

  const categoriesColumns = [
    { id: "most-popular", title: "Most popular", data: mostPopular },
    { id: "hot-releases", title: "Hot new releases", data: hotReleases },
    { id: "trending-now", title: "Trending now", data: trendingNow },
  ];

  return (
    <section className="bg-[#f5f7fa] py-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* TITLE */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#1f1f1f]">
            New and popular
          </h2>
          <p className="text-sm text-gray-500 mt-1">Explore our latest online courses and single lessons</p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-dashed mt-6">
            Không có khóa học nào đang ở trạng thái hiển thị (Published).
          </div>
        ) : (
          /* 3 COLUMNS GRID CONTAINER */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {categoriesColumns.map((column) => {
              // Nếu cột không có data thì ẩn cột đó hoặc hiển thị trống
              if (column.data.length === 0) return null;

              return (
                <div
                  key={column.id}
                  className="bg-[#ebf3ff] rounded-2xl p-4 flex flex-col gap-4"
                >
                  {/* CATEGORY HEADER */}
                  <div className="inline-flex items-center gap-1 text-base font-bold text-[#1f1f1f] w-fit">
                    {column.title}
                    <ArrowRight size={16} className="mt-0.5 ml-1 text-blue-600" />
                  </div>

                  {/* COURSE LIST (VERTICAL) */}
                  <div className="flex flex-col gap-3">
                    {column.data.map((course) => {
                      // Xử lý thông tin giảng viên (Instructor) vì dữ liệu có thể là String hoặc Object
                      const instructorName = typeof course.instructor === "object" 
                        ? course.instructor.name 
                        : course.instructor || "Expert Instructor";

                      return (
                        <Link
                          href={`/individuals/courses/${course.slug}`}
                          key={course._id}
                          className="bg-white rounded-xl p-3 flex gap-4 shadow-sm hover:shadow-md transition duration-200 cursor-pointer border border-transparent hover:border-blue-100 group"
                        >
                          {/* LEFT: THUMBNAIL */}
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center relative">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            ) : (
                              <BookOpen size={24} className="text-slate-400" />
                            )}
                          </div>

                          {/* RIGHT: INFO */}
                          <div className="flex flex-col justify-between min-w-0 flex-1">
                            <div>
                              {/* INSTRUCTOR */}
                              <div className="flex items-center gap-1.5 min-w-0">
                                <User size={12} className="text-gray-400 flex-shrink-0" />
                                <p className="text-xs text-gray-500 truncate">
                                  {instructorName}
                                </p>
                              </div>

                              {/* COURSE TITLE */}
                              <h4 className="text-sm font-bold text-gray-900 line-clamp-2 mt-1 leading-snug group-hover:text-blue-600 transition">
                                {course.title}
                              </h4>
                            </div>

                            {/* BADGE LEVEL & LESSONS COUNT */}
                            <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-500 font-medium">
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 capitalize">
                                {course.level}
                              </span>
                              <span>•</span>
                              <span className="text-blue-600 flex items-center gap-0.5">
                                {course.lessons?.length || 0} bài học
                              </span>
                              <span>•</span>
                              <span className="text-slate-800 font-bold">
                                {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString("vi-VN")}đ`}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}