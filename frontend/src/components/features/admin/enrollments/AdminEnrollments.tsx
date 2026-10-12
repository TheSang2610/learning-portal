"use client";

import { Loader2 } from "lucide-react";

import Pager from "@/src/components/ui/Pager";
import { ADMIN_ENROLLMENTS as C } from "@/src/constants/admin/enrollments-page";

import { useAdminEnrollments } from "./hooks/useAdminEnrollments";
import EnrollmentRow from "./parts/EnrollmentRow";
import GiftCourseCard from "./parts/GiftCourseCard";
import styles from "./AdminEnrollments.module.scss";

/** Trang /admin/enrollments - luot ghi danh khoa hoc. */
export default function AdminEnrollments() {
  const s = useAdminEnrollments();

  return (
    <div className={styles.stack}>
      <div>
        <h1 className={styles.title}>{C.title}</h1>
        <p className={styles.text}>{s.fetching ? C.loading : C.count(s.total)}</p>
      </div>

      <GiftCourseCard courses={s.courses} onGifted={s.reload} />

      <div className={styles.row}>
        <select
          value={s.courseFilter}
          onChange={(e) => s.changeCourseFilter(e.target.value)}
          className={`${styles.box5} ${styles.select}`}
        >
          <option value="">{C.allCourses}</option>
          {s.courses.map((c) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
        <select
          value={s.statusFilter}
          onChange={(e) => s.changeStatusFilter(e.target.value)}
          className={styles.box5}
        >
          <option value="">{C.allStatuses}</option>
          {C.statuses.map((st) => (
            <option key={st} value={st}>
              {C.statusLabel[st]}
            </option>
          ))}
        </select>
      </div>

      {s.error && <div className={styles.card}>{s.error}</div>}

      <div className={styles.card2}>
        <div className={styles.scroller}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.headCell}>{C.columns.student}</th>
                <th className={styles.headCell}>{C.columns.course}</th>
                <th className={styles.headCell2}>{C.columns.progress}</th>
                <th className={styles.headCell}>{C.columns.score}</th>
                <th className={styles.headCell}>{C.columns.enrolledAt}</th>
                <th className={styles.headCell3}>{C.columns.status}</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {s.fetching ? (
                <tr>
                  <td colSpan={6} className={styles.cell}>
                    <Loader2 size={20} className={styles.spinner} />
                  </td>
                </tr>
              ) : s.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.cell2}>
                    {C.empty}
                  </td>
                </tr>
              ) : (
                s.rows.map((r) => (
                  <EnrollmentRow
                    key={r._id}
                    r={r}
                    busy={s.busyId === r._id}
                    onChangeStatus={s.changeStatus}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pager
          page={s.page}
          pages={s.pages}
          setPage={s.setPage}
          classes={{
            wrap: styles.row6,
            info: styles.text5,
            group: styles.row7,
            button: styles.box4,
          }}
        />
      </div>
    </div>
  );
}
