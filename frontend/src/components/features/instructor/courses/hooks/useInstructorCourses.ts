"use client";

import { useEffect, useState } from "react";

import { getInstructorCourses, Course } from "@/src/services/course";

/** Tai danh sach khoa hoc cua giang vien dang dang nhap. */
export function useInstructorCourses() {
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

  return { courses, loading };
}
