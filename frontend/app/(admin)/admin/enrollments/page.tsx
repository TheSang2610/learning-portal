"use client";

import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "@/src/services/apiHelper";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import {
  getAllEnrollmentsAdmin,
  updateEnrollmentStatusAdmin,
  type AdminEnrollmentRow,
} from "@/src/services/adminService";
import { getCourses, type Course } from "@/src/services/course";
import AnhDaiDien from "@/src/components/ui/Avatar";

import styles from "./page.module.scss";
// Truoc day cho nay khai lai mot ban rieng. Dung chung voi tang service de khi
// backend doi hinh dang thi chi phai sua mot noi.
type Enrollment = AdminEnrollmentRow;

const STATUSES = ["active", "completed", "dropped"] as const;

const STATUS_STYLE: Record<string, { cls: string; Icon: LucideIcon; label: string }> = {
  active: {
    cls: styles.nhanDangHoc,
    Icon: PlayCircle,
    label: "Đang học",
  },
  completed: {
    cls: styles.nhanHoanThanh,
    Icon: CheckCircle2,
    label: "Hoàn thành",
  },
  dropped: {
    cls: styles.nhanDaBo,
    Icon: XCircle,
    label: "Đã bỏ",
  },
};

const PAGE_SIZE = 10;

export default function AdminEnrollmentsPage() {
  const [rows, setRows] = useState<Enrollment[]>([]);
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
        limit: PAGE_SIZE,
        status: statusFilter || undefined,
        courseId: courseFilter || undefined,
      });
      setRows(Array.isArray(data?.enrollments) ? data.enrollments : []);
      setTotal(data?.pagination?.total ?? 0);
      setPages(data?.pagination?.pages ?? 1);
    } catch (e) {
      setError(getErrorMessage(e, "Không tải được danh sách ghi danh"));
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

  const changeStatus = async (row: Enrollment, status: string) => {
    if (status === row.status) return;
    try {
      setBusyId(row._id);
      setError("");
      await updateEnrollmentStatusAdmin(row._id, status);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "Không đổi được trạng thái"));
    } finally {
      setBusyId(null);
    }
  };

  const selectCls = styles.box5;

  return (
    <div className={styles.stack}>
      <div>
        <h1 className={styles.title}>Ghi danh</h1>
        <p className={styles.text}>
          {fetching ? "Đang tải..." : `${total} lượt ghi danh`}
        </p>
      </div>

      <div className={styles.row}>
        <select
          value={courseFilter}
          onChange={(e) => {
            setCourseFilter(e.target.value);
            setPage(1);
          }}
          className={`${selectCls} ${styles.select}`}
        >
          <option value="">Mọi khóa học</option>
          {courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className={selectCls}
        >
          <option value="">Mọi trạng thái</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_STYLE[s].label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className={styles.card}>{error}</div>}

      <div className={styles.card2}>
        <div className={styles.scroller}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.headCell}>Học viên</th>
                <th className={styles.headCell}>Khóa học</th>
                <th className={styles.headCell2}>Tiến độ</th>
                <th className={styles.headCell}>Điểm</th>
                <th className={styles.headCell}>Ghi danh</th>
                <th className={styles.headCell3}>Trạng thái</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {fetching ? (
                <tr>
                  <td colSpan={6} className={styles.cell}>
                    <Loader2 size={20} className={styles.spinner} />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.cell2}>
                    Không có lượt ghi danh nào.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const pct = Math.round(r.totalProgress ?? 0);
                  const st = STATUS_STYLE[r.status] ?? STATUS_STYLE.active;
                  return (
                    <tr key={r._id} className={styles.row2}>
                      <td className={styles.headCell}>
                        <div className={styles.row3}>
                          <AnhDaiDien
                            src={r.student?.avatar}
                            ten={r.student?.name}
                            size={36}
                          />
                          <div className={styles.box}>
                            <p className={styles.text2}>
                              {r.student?.name || "(đã xóa)"}
                            </p>
                            <p className={styles.text3}>{r.student?.email || "--"}</p>
                          </div>
                        </div>
                      </td>
                      <td className={styles.headCell}>
                        <p className={styles.text4}>{r.course?.title || "(đã xóa)"}</p>
                      </td>
                      <td className={styles.headCell}>
                        <div className={styles.row4}>
                          <div className={styles.box2}>
                            <div
                              className={styles.box3}
                              style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                            />
                          </div>
                          <span className={styles.label}>{pct}%</span>
                        </div>
                      </td>
                      <td className={styles.cell3}>{r.finalScore ?? "--"}</td>
                      <td className={styles.cell4}>
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString("vi-VN")
                          : "--"}
                      </td>
                      <td className={styles.headCell}>
                        <div className={styles.row5}>
                          <span className={`${styles.label2} ${st.cls}`}>
                            <st.Icon size={12} /> {st.label}
                          </span>
                          <select
                            value={r.status}
                            disabled={busyId === r._id}
                            onChange={(e) => changeStatus(r, e.target.value)}
                            title="Đổi trạng thái"
                            className={styles.select2}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_STYLE[s].label}
                              </option>
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
          <div className={styles.row6}>
            <p className={styles.text5}>
              Trang {page} / {pages}
            </p>
            <div className={styles.row7}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={styles.box4}
              >
                <ChevronLeft size={14} /> Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className={styles.box4}
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
