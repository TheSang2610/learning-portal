import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ADMIN_DASHBOARD as C } from "@/src/constants/admin/dashboard-page";
import type { DashboardActivity } from "@/src/services/adminService";

import styles from "../AdminDashboard.module.scss";

const T = C.table;
const STATUS_CLASS = {
  active: styles.statusActive,
  completed: styles.statusCompleted,
  dropped: styles.statusDropped,
} as const;

/** Bang ghi danh gan day (kieu DataTable cua shadcn, rut gon). */
export default function RecentEnrollments({
  rows,
}: {
  rows: DashboardActivity["recent"];
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <h2 className={styles.panelTitle}>{T.title}</h2>
          <p className={styles.panelDesc}>{T.description}</p>
        </div>
        <Link href={T.viewAllHref} className={styles.outlineButton}>
          {T.viewAll}
          <ArrowRight size={14} aria-hidden />
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className={styles.empty}>{T.empty}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {T.columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const p = Math.min(100, Math.max(0, Math.round(r.progress)));
                return (
                  <tr key={r._id}>
                    <td>
                      <div className={styles.cellMain}>
                        {r.student?.name ?? T.deleted}
                      </div>
                      <div className={styles.cellSub}>{r.student?.email}</div>
                    </td>
                    <td className={styles.cellCourse}>{r.course?.title ?? T.deleted}</td>
                    <td>
                      <div className={styles.progress}>
                        <span className={styles.progressBar}>
                          <i style={{ width: `${p}%` }} />
                        </span>
                        {p}%
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${STATUS_CLASS[r.status] ?? ""}`}
                      >
                        {T.status[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className={styles.cellDate}>
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
