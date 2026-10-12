"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { COLLECTIONS } from "@/src/constants/portal/collection-page";
import { getHomeSections, type Course } from "@/src/services/course";

/** Doc ?slug= va tai danh sach khoa cua muc tuong ung tu du lieu trang chu. */
export function useCourseCollection() {
  // Lay slug tu query string: /collection?slug=most-popular-courses
  const searchParams = useSearchParams();
  const collectionSlug = searchParams.get("slug") || "";
  const item = COLLECTIONS[collectionSlug];

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCollection = async () => {
      try {
        setLoading(true);
        const response = await getHomeSections();
        const definition = COLLECTIONS[collectionSlug];

        if (response?.success && response.data && definition) {
          setCourses(response.data[definition.get] || []);
        } else {
          setCourses([]);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách bộ sưu tập khóa học:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [collectionSlug]);

  return { muc: item, courses, loading };
}
