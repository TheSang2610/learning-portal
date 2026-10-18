"use client";

import { useEffect, useState } from "react";

import type { HomeSectionsState } from "@/src/components/features/portal/home/HomePopularCourses";
import { COLLECTIONS } from "@/src/constants/portal/collection-page";
import { getHomeSections, type Course } from "@/src/services/course";

/**
 * Danh sach khoa cua bang xep hang `slug`. Co `lists` (lay san o may chu) thi
 * dung ngay, khong goi mang; khong co (may chu tai hong) thi trinh duyet tu
 * goi /courses/home-sections nhu truoc.
 */
export function useCourseCollection(slug: string, lists: HomeSectionsState | null) {
  const def = COLLECTIONS[slug];
  const [fetched, setFetched] = useState<HomeSectionsState | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (lists) return;
    let alive = true;
    getHomeSections()
      .then((res) => {
        if (!alive) return;
        if (res?.success && res.data) setFetched(res.data as HomeSectionsState);
        else setFailed(true);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [lists]);

  const source = lists ?? fetched;
  const courses: Course[] = def && source ? (source[def.get] ?? []) : [];
  const loading = !lists && !fetched && !failed && Boolean(def);

  return { courses, loading };
}
