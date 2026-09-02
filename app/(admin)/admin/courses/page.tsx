"use client";
import { useState, useEffect } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import Link from "next/link";
import { Video, Trash2, Edit, HelpCircle } from "lucide-react"; // 🎯 Thêm HelpCircle
import { deleteCourseAdmin } from "@/src/services/adminService";
import { Course, getInstructorCourses } from "@/src/services/course";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    const isConfirmed = window.confirm(
      `⚠️ CẢNH BÁO NGUY HIỂM!\n\nBạn có chắc chắn muốn xóa khóa học: "${courseTitle}"?\nHành động này sẽ xóa toàn bộ bài học, bài tập trắc nghiệm (quiz) bên trong và KHÔNG THỂ HOÀN TÁC!`,
    );
    if (!isConfirmed) return;

    try {
      setDeletingId(courseId);
      await deleteCourseAdmin(courseId);
      alert("Xóa khóa học và toàn bộ dữ liệu liên quan thành công!");
      setCourses((prevCourses) => prevCourses.filter((c) => c._id !== courseId));
    } catch (error) {
      console.error("Lỗi khi xóa khóa học:", error);
      alert(
        getErrorMessage(
          error,
          "Không thể xóa khóa học. Vui lòng kiểm tra lại phân quyền Admin.",
        ),
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse p-8 text-center font-medium text-slate-500">
        Loading courses...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl py-2">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Courses</h1>
          <p className="mt-2 text-slate-500">Manage your LMS courses</p>
        </div>

        <Link
          href="/admin/course-create"
          className="bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          Create Course
        </Link>
      </div>

      <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80">
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
              <tr key={course._id} className="transition hover:bg-slate-50/50">
                <td className="max-w-xs truncate p-5 font-medium text-slate-900 md:max-w-md">
                  {course.title}
                </td>
                <td className="p-5 text-sm text-slate-700 capitalize">
                  <span className="text-xs font-semibold text-slate-600">
                    {course.level}
                  </span>
                </td>
                <td className="p-5 text-sm font-medium text-slate-700">
                  {course.price === 0 ? (
                    <span className="font-bold text-emerald-600">Free</span>
                  ) : (
                    `${course.price.toLocaleString("vi-VN")} đ`
                  )}
                </td>
                <td className="p-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      course.isPublished
                        ? "border border-green-200 bg-green-50 text-green-700"
                        : "border border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </td>

                <td className="flex items-center gap-2 p-5">
                  <Link
                    href={course._id ? `/admin/lessons?courseId=${course._id}` : "#"}
                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-2 text-xs font-bold text-slate-800 transition hover:bg-slate-200"
                  >
                    <Video size={13} /> Bài học
                  </Link>

                  {/* 🎯 NÚT MỚI THÊM: Quản lý FAQ theo Course ID */}
                  <Link
                    href={course._id ? `/admin/course-faqs?courseId=${course._id}` : "#"}
                    className="inline-flex items-center gap-1 rounded-xl bg-purple-50 px-2.5 py-2 text-xs font-bold text-purple-600 transition hover:bg-purple-100"
                  >
                    <HelpCircle size={13} /> Hỏi đáp
                  </Link>

                  <Link
                    href={
                      course._id ? `/admin/course-detail?courseId=${course._id}` : "#"
                    }
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-50 px-2.5 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                  >
                    <Edit size={13} /> Sửa
                  </Link>

                  <button
                    type="button"
                    disabled={deletingId === course._id}
                    onClick={() => handleDeleteCourse(course._id!, course.title)}
                    className="inline-flex items-center gap-1 rounded-xl bg-red-50 px-2.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <Trash2 size={13} />
                    {deletingId === course._id ? "Đang xóa..." : "Xóa"}
                  </button>
                </td>
              </tr>
            ))}

            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="p-16 text-center text-sm text-slate-500">
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
