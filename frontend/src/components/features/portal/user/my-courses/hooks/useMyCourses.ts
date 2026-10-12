"use client";

import { useEffect, useState } from "react";

import {
  MY_COURSES as C,
  type MyCoursesFilter,
} from "@/src/constants/portal/my-courses-page";
import {
  getMyEnrolledCourses,
  type EnrolledCourseItem,
} from "@/src/services/enrollment.api";

/** Khoa hoc da ghi danh cua minh, loc dang hoc / da xong / tat ca. */
export function useMyCourses() {
  const [list, setList] = useState<EnrolledCourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<MyCoursesFilter>("dangHoc");

  useEffect(() => {
    let stillMounted = true;

    getMyEnrolledCourses()
      .then((items) => {
        if (!stillMounted) return;
        setList(Array.isArray(items) ? items : []);
      })
      .catch((e) => {
        if (!stillMounted) return;
        setErr(e instanceof Error ? e.message : C.loadFailed);
      })
      .finally(() => {
        if (stillMounted) setLoading(false);
      });

    return () => {
      stillMounted = false;
    };
  }, []);

  // Bo ban ghi co course === null.
  //
  // May chu populate mot phan va tra null khi khoa hoc da bi xoa - xem ghi chu
  // o EnrolledCourseSummary. Khong loc thi cho nay ve mot the trong khong bam
  // duoc, va nguoi dung tuong giao dien hong.
  const hasCourses = list.filter((g) => g.course);

  const query = hasCourses.filter((g) => {
    if (filter === "tatCa") return true;
    if (filter === "xong") return g.status === "completed" || g.totalProgress >= 100;
    return g.status !== "completed" && g.totalProgress < 100;
  });

  const inProgressCount = hasCourses.filter(
    (g) => g.status !== "completed" && g.totalProgress < 100,
  ).length;
  const completedCount = hasCourses.length - inProgressCount;

  return {
    loading,
    loi: err,
    filter,
    setFilter,
    hasCourses,
    query,
    inProgressCount,
    completedCount,
  };
}
