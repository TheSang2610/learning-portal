"use client";

import { useEffect, useState } from "react";

import { ADMIN_COURSES as C } from "@/src/constants/admin/courses-page";
import { deleteCourseAdmin } from "@/src/services/adminService";
import { getErrorMessage } from "@/src/services/apiHelper";
import { Course, getInstructorCourses } from "@/src/services/course";

/** Danh sach khoa hoc cho quan tri va xoa khoa hoc. */
export function useAdminCourses() {
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
    const isConfirmed = window.confirm(C.messages.confirmDelete(courseTitle));
    if (!isConfirmed) return;

    try {
      setDeletingId(courseId);
      await deleteCourseAdmin(courseId);
      alert(C.messages.deleted);
      setCourses((prevCourses) => prevCourses.filter((c) => c._id !== courseId));
    } catch (error) {
      console.error("Lỗi khi xóa khóa học:", error);
      alert(getErrorMessage(error, C.messages.deleteFailed));
    } finally {
      setDeletingId(null);
    }
  };

  return { courses, loading, deletingId, handleDeleteCourse };
}
