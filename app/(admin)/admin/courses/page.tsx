"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
// 🎯 Import thêm icon Video để làm nút chuyển hướng
import { Video } from "lucide-react"; 
import { Course, getInstructorCourses } from "@/src/services/course";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getInstructorCourses();
        if (response && response.data) {
          setCourses(response.data);
        } else if (Array.isArray(response)) {
          setCourses(response);
        }
      } catch (error) {
        console.error("Lỗi lấy danh sách khóa học quản trị:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="p-8 text-center font-medium text-slate-500 animate-pulse">Loading courses...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-2">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Courses</h1>
          <p className="text-slate-500 mt-2">Manage your LMS courses</p>
        </div>

        <Link
          href="/admin/courses/create"
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 font-medium shadow-sm text-sm"
        >
          Create Course
        </Link>
      </div>

      <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              <th className="p-5 text-sm font-semibold text-slate-600">Title</th>
              <th className="p-5 text-sm font-semibold text-slate-600">Level</th>
              <th className="p-5 text-sm font-semibold text-slate-600">Price</th>
              <th className="p-5 text-sm font-semibold text-slate-600">Status</th>
              <th className="p-5 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {courses.map((course) => (
              <tr key={course._id} className="hover:bg-slate-50/50 transition">
                <td className="p-5 font-medium text-slate-900 max-w-xs md:max-w-md truncate">{course.title}</td>
                <td className="p-5 capitalize text-slate-700 text-sm">
                  <span className=" text-xs font-semibold text-slate-600">
                    {course.level}
                  </span>
                </td>
                <td className="p-5 text-slate-700 text-sm font-medium">
                  {course.price === 0 ? (
                    <span className="text-emerald-600 font-bold">Free</span>
                  ) : (
                    `${course.price.toLocaleString("vi-VN")} đ`
                  )}
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    course.isPublished 
                      ? "bg-green-50 text-green-700 border border-green-200" 
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                {/* 🎯 KHU VỰC THAY ĐỔI: Thêm nút Quản lý bài học vào đây */}
                <td className="p-5 flex items-center gap-4">
                  <Link
                    href={course._id ? `/admin/courses/${course._id}/lessons` : "#"}
                    className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-black font-bold text-xs px-3 py-2 rounded-xl transition shadow-sm"
                  >
                    <Video size={13} /> Bài học
                  </Link>
                  
                  <Link
                    href={course._id ? `/admin/courses/${course._id}` : "#"}
                    className="text-blue-600 hover:text-blue-800 font-bold text-sm transition"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="p-16 text-center text-slate-400 text-sm">
                  📭 Không tìm thấy khóa học nào trong hệ thống quản trị.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}