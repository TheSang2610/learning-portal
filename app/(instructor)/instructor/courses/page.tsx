"use client";

import { useEffect, useState } from "react";
import SafeImage from "@/src/components/ui/SafeImage";
import Link from "next/link";
import { getInstructorCourses, Course, tenChuDe } from "@/src/services/course";
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
      <div className="flex h-64 animate-pulse items-center justify-center font-medium text-slate-500">
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
          <p className="text-sm text-slate-500">
            Quản lý và cập nhật nội dung các chương trình giảng dạy.
          </p>
        </div>
        {/* ✅ Đã sửa: text-black -> text-white tăng độ tương phản */}
        <Link
          href="/instructor/course-create"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-indigo-600/10 transition-all hover:bg-indigo-700"
        >
          <Plus size={18} />
          Tạo khóa học mới
        </Link>
      </div>

      {/* ĐIỀU KIỆN RỖNG (EMPTY STATE) */}
      {courses.length === 0 ? (
        <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 p-4 text-slate-500">
            <BookOpen size={24} />
          </div>
          <h4 className="mb-1 text-base font-bold text-slate-800">
            Chưa có khóa học nào
          </h4>
          <p className="mb-5 text-sm text-slate-500">
            Bạn chưa khởi tạo chương trình giảng dạy nào trên hệ thống LMS.
          </p>
          <Link
            href="/instructor/course-create"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Bắt đầu tạo khóa học đầu tiên <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        /* GRID KHÓA HỌC */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course._id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              {/* THUMBNAIL */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                <SafeImage
                  src={
                    course.thumbnail ||
                    "https://res.cloudinary.com/demo/image/upload/sample.jpg"
                  }
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span
                  className={`absolute top-4 right-4 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${
                    course.isPublished
                      ? "border border-emerald-100 bg-emerald-50 text-emerald-600"
                      : "border border-amber-100 bg-amber-50 text-amber-600"
                  }`}
                >
                  {course.isPublished ? "Đang phát hành" : "Bản nháp"}
                </span>
              </div>

              {/* NỘI DUNG CARD */}
              <div className="flex flex-1 flex-col justify-between space-y-4 p-5">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                    <Tag size={12} />
                    {tenChuDe(course.category)[0] || "Chưa phân loại"}
                  </span>
                  <h4 className="line-clamp-2 text-base font-bold text-slate-800 transition-colors group-hover:text-indigo-600">
                    {course.title}
                  </h4>
                  <p className="line-clamp-2 text-xs text-slate-500">
                    {course.description || "Chưa có mô tả chi tiết cho khóa học này."}
                  </p>
                </div>

                {/* THÔNG SỐ PHỤ */}
                <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <User size={14} className="text-slate-500" />
                    {course.studentsCount || 0} học viên
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {course.price === 0
                      ? "Miễn phí"
                      : `${course.price.toLocaleString("vi-VN")} đ`}
                  </span>
                </div>

                {/* HÀNH ĐỘNG */}
                <Link
                  href={`/instructor/course-detail?courseId=${course._id}`}
                  className="inline-block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-xs font-semibold text-slate-700 transition-all hover:bg-slate-100"
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
