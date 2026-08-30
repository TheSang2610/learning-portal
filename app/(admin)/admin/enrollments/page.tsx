"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2, ChevronLeft, ChevronRight,
  CheckCircle2, PlayCircle, XCircle,
} from "lucide-react";

import {
  getAllEnrollmentsAdmin,
  updateEnrollmentStatusAdmin,
} from "@/src/services/adminService";
import { getCourses } from "@/src/services/course";

interface Enrollment {
  _id: string;
  course?: { _id: string; title: string } | null;
  student?: { _id: string; name: string; email: string } | null;
  totalProgress?: number;
  status: "active" | "completed" | "dropped";
  finalScore?: number | null;
  lastAccessedAt?: string;
  createdAt?: string;
}

const STATUSES = ["active", "completed", "dropped"] as const;

const STATUS_STYLE: Record<string, { cls: string; Icon: any; label: string }> = {
  active: { cls: "bg-blue-50 text-blue-700 border-blue-200", Icon: PlayCircle, label: "Đang học" },
  completed: { cls: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: CheckCircle2, label: "Hoàn thành" },
  dropped: { cls: "bg-slate-100 text-slate-700 border-slate-200", Icon: XCircle, label: "Đã bỏ" },
};

const PAGE_SIZE = 10;

export default function AdminEnrollmentsPage() {
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
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
        const res: any = await getCourses();
        const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        setCourses(list);
      } catch {
        /* bo loc khong bat buoc, loi thi bo qua */
      }
    })();
  }, []);

  const load = useCallback(async () => {
    try {
      setFetching(true);
      setError("");
      const data: any = await getAllEnrollmentsAdmin({
        page,
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        courseId: courseFilter || undefined,
      });
      setRows(Array.isArray(data?.enrollments) ? data.enrollments : []);
      setTotal(data?.pagination?.total ?? 0);
      setPages(data?.pagination?.pages ?? 1);
    } catch (e: any) {
      setError(e?.message || "Không tải được danh sách ghi danh");
      setRows([]);
    } finally {
      setFetching(false);
    }
  }, [page, statusFilter, courseFilter]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (row: Enrollment, status: string) => {
    if (status === row.status) return;
    try {
      setBusyId(row._id);
      setError("");
      await updateEnrollmentStatusAdmin(row._id, status);
      await load();
    } catch (e: any) {
      setError(e?.message || "Không đổi được trạng thái");
    } finally {
      setBusyId(null);
    }
  };

  const selectCls =
    "rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none " +
    "transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Ghi danh</h1>
        <p className="mt-1 text-sm text-slate-500">
          {fetching ? "Đang tải..." : `${total} lượt ghi danh`}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={courseFilter}
          onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
          className={selectCls + " max-w-[320px] flex-1"}
        >
          <option value="">Mọi khóa học</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className={selectCls}
        >
          <option value="">Mọi trạng thái</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_STYLE[s].label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-4 py-3">Học viên</th>
                <th className="px-4 py-3">Khóa học</th>
                <th className="px-4 py-3 w-40">Tiến độ</th>
                <th className="px-4 py-3">Điểm</th>
                <th className="px-4 py-3">Ghi danh</th>
                <th className="px-4 py-3 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fetching ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-slate-500">
                    <Loader2 size={20} className="mx-auto animate-spin" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-sm text-slate-500">
                    Không có lượt ghi danh nào.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const pct = Math.round(r.totalProgress ?? 0);
                  const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.active;
                  return (
                    <tr key={r._id} className="transition hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-bold uppercase text-slate-700">
                            {r.student?.name?.charAt(0) || "?"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {r.student?.name || "(đã xóa)"}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {r.student?.email || "--"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-[240px] truncate text-sm text-slate-700">
                          {r.course?.title || "(đã xóa)"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-indigo-600 transition-all"
                              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                            />
                          </div>
                          <span className="w-9 shrink-0 text-right text-xs font-semibold text-slate-700">
                            {pct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {r.finalScore ?? "--"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : "--"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold ${st.cls}`}>
                            <st.Icon size={12} /> {st.label}
                          </span>
                          <select
                            value={r.status}
                            disabled={busyId === r._id}
                            onChange={(e) => changeStatus(r, e.target.value)}
                            title="Đổi trạng thái"
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 disabled:text-slate-400"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_STYLE[s].label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
            <p className="text-xs text-slate-600">Trang {page} / {pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                Sau <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
