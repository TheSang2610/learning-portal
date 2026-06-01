"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getInstructorCourses, Course } from "@/src/services/course"; 
import { Plus, BookOpen, User, Tag, ChevronRight } from "lucide-react";

export default function AllCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getInstructorCourses();
        if (response.success) {
          setCourses(response.data);
        }
      } catch (error) {
        console.error("Lỗi lấy khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 font-medium animate-pulse">
        Đang tải danh sách khóa học của bạn...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER DANH SÁCH */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Khóa học của tôi</h3>
          <p className="text-sm text-slate-500">Quản lý và cập nhật nội dung các chương trình giảng dạy.</p>
        </div>
        {/* ✅ Đã sửa: text-black -> text-white tăng độ tương phản */}
        <Link 
          href="/instructor/courses/create"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-indigo-600/10 transition-all text-sm"
        >
          <Plus size={18} />
          Tạo khóa học mới
        </Link>
      </div>

      {/* ĐIỀU KIỆN RỖNG (EMPTY STATE) */}
      {courses.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-12 text-center max-w-xl mx-auto mt-8">
          <div className="bg-slate-50 text-slate-400 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={24} />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1">Chưa có khóa học nào</h4>
          <p className="text-sm text-slate-500 mb-5">Bạn chưa khởi tạo chương trình giảng dạy nào trên hệ thống LMS.</p>
          <Link 
            href="/instructor/courses/create"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 text-sm"
          >
            Bắt đầu tạo khóa học đầu tiên <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        /* GRID KHÓA HỌC */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div 
              key={course._id} 
              className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              {/* THUMBNAIL */}
              <div className="aspect-video w-full bg-slate-100 relative overflow-hidden">
                <img 
                  src={course.thumbnail || "https://res.cloudinary.com/demo/image/upload/sample.jpg"} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className={`absolute top-4 right-4 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm ${
                  course.isPublished 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                    : "bg-amber-50 text-amber-600 border border-amber-100"
                }`}>
                  {course.isPublished ? "Đang phát hành" : "Bản nháp"}
                </span>
              </div>

              {/* NỘI DUNG CARD */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    <Tag size={12} />
                    {typeof course.category === "object" ? (course.category as any).name : "Chưa phân loại"}
                  </span>
                  <h4 className="font-bold text-slate-800 text-base line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {course.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {course.description || "Chưa có mô tả chi tiết cho khóa học này."}
                  </p>
                </div>

                {/* THÔNG SỐ PHỤ */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <User size={14} className="text-slate-400" />
                    {course.studentsCount || 0} học viên
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString('vi-VN')} đ`}
                  </span>
                </div>

                {/* HÀNH ĐỘNG */}
                <Link 
                  href={`/instructor/courses/${course._id}`}
                  className="w-full text-center bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition-all border border-slate-200 inline-block"
                >
                  Chỉnh sửa nội dung & Bài học
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}