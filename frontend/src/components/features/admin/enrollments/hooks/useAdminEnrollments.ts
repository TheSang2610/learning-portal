"use client";

import { useCallback, useEffect, useState } from "react";

import { ADMIN_ENROLLMENTS as C } from "@/src/constants/admin/enrollments-page";
import {
  getAllEnrollmentsAdmin,
  updateEnrollmentStatusAdmin,
  type AdminEnrollmentRow,
} from "@/src/services/adminService";
import { getErrorMessage } from "@/src/services/apiHelper";
import { getCourses, type Course } from "@/src/services/course";

/** Ghi danh co phan trang, loc theo khoa / trang thai, doi trang thai. */
export function useAdminEnrollments() {
  const [rows, setRows] = useState<AdminEnrollmentRow[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");

  const [fetching, setFetching] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Danh sach khoa hoc chi de do vao bo loc
  useEffect(() => {
    (async () => {
      try {
        // getCourses tra ve thang mang khoa hoc, khong boc trong { data }.
        const res = await getCourses();
        setCourses(Array.isArray(res) ? res : []);
      } catch {
        /* bo loc khong bat buoc, loi thi bo qua */
      }
    })();
  }, []);

  const load = useCallback(async () => {
    try {
      setFetching(true);
      setError("");
      const data = await getAllEnrollmentsAdmin({
        page,
        limit: C.pageSize,
        status: statusFilter || undefined,
        courseId: courseFilter || undefined,
      });
      setRows(Array.isArray(data?.enrollments) ? data.enrollments : []);
      setTotal(data?.pagination?.total ?? 0);
      setPages(data?.pagination?.pages ?? 1);
    } catch (e) {
      setError(getErrorMessage(e, C.messages.loadFailed));
      setRows([]);
    } finally {
      setFetching(false);
    }
  }, [page, statusFilter, courseFilter]);

  useEffect(() => {
    // Goi qua mot vong microtask thay vi goi thang. Ham tai du lieu bat dau
    // bang setLoading(true), nen goi thang la setState dong bo ngay trong than
    // effect: React phai chay them mot vong ve lai truoc khi hien man hinh
    // (rule react-hooks/set-state-in-effect canh bao dung cho nay). Hoan mot
    // vong microtask thi mat thuong khong thay khac, ma vong ve thua het.
    void Promise.resolve().then(load);
  }, [load]);

  const changeCourseFilter = (v: string) => {
    setCourseFilter(v);
    setPage(1);
  };

  const changeStatusFilter = (v: string) => {
    setStatusFilter(v);
    setPage(1);
  };

  const changeStatus = async (row: AdminEnrollmentRow, status: string) => {
    if (status === row.status) return;
    try {
      setBusyId(row._id);
      setError("");
      await updateEnrollmentStatusAdmin(row._id, status);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, C.messages.changeFailed));
    } finally {
      setBusyId(null);
    }
  };

  return {
    rows,
    courses,
    total,
    pages,
    page,
    setPage,
    statusFilter,
    courseFilter,
    changeCourseFilter,
    changeStatusFilter,
    fetching,
    busyId,
    error,
    changeStatus,
    reload: load,
  };
}
