"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Course, getCourses } from "@/src/services/course";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div className="p-8 text-center font-medium">Loading courses...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Courses</h1>
          <p className="text-slate-500 mt-2">Manage your LMS courses</p>
        </div>

        <Link
          href="/admin/courses/create"
          className="bg-blue-600 hover:bg-blue-700 transition text-white px-5 py-3 rounded-2xl font-medium"
        >
          Create Course
        </Link>
      </div>

      <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="border-b border-slate-200">
              <th className="text-left p-5 text-sm font-semibold text-slate-600">Title</th>
              <th className="text-left p-5 text-sm font-semibold text-slate-600">Level</th>
              <th className="text-left p-5 text-sm font-semibold text-slate-600">Price</th>
              <th className="text-left p-5 text-sm font-semibold text-slate-600">Status</th>
              <th className="text-left p-5 text-sm font-semibold text-slate-600">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {courses.map((course) => (
              <tr key={course._id} className="hover:bg-slate-50/50 transition">
                <td className="p-5 font-medium text-slate-900">{course.title}</td>
                <td className="p-5 capitalize text-slate-700">{course.level}</td>
                <td className="p-5 text-slate-700">
                  {course.price === 0 ? "Free" : `${course.price.toLocaleString("vi-VN")} đ`}
                </td>
                <td className="p-5">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.isPublished ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="p-5">
                  <Link
                    href={`/admin/courses/${course._id}`}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-400">
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}