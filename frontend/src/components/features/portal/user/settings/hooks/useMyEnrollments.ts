"use client";

import { useEffect, useState } from "react";

import { USER_SETTINGS } from "@/src/constants/portal/user-settings-page";
import {
  getMyEnrolledCourses,
  type EnrolledCourseItem,
} from "@/src/services/enrollment.api";

/** Danh sach khoa da dang ky cho tab "Khóa học của tôi". rows = null la dang tai. */
export function useMyEnrollments() {
  const [rows, setRows] = useState<EnrolledCourseItem[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    getMyEnrolledCourses()
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch((e) =>
        setErr(e instanceof Error ? e.message : USER_SETTINGS.courses.loadFailed),
      );
  }, []);

  return { rows, err };
}
