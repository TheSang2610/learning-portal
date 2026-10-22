import { ADMIN_DASHBOARD as C } from "@/src/constants/admin/dashboard-page";
import type { DashboardActivity } from "@/src/services/adminService";

import styles from "../AdminDashboard.module.scss";

const T = C.logins;

/** "21/10 14:05" - bang chi xem vai ngay gan day, khong can nam. Tu ghep vi
 *  toLocaleString("vi-VN") ra "14:05 21-10", gio dung truoc va ngay noi gach. */
const shortTime = (iso: string) => {
  const d = new Date(iso);
  const two = (n: number) => String(n).padStart(2, "0");
  return `${two(d.getDate())}/${two(d.getMonth() + 1)} ${two(d.getHours())}:${two(d.getMinutes())}`;
};

/** Bang nguoi dang nhap gan day (cung kieu bang ghi danh gan day). */
export default function RecentLogins({
  rows,
}: {
  rows: DashboardActivity["recentLogins"];
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <h2 className={styles.panelTitle}>{T.title}</h2>
          <p className={styles.panelDesc}>{T.description}</p>
        </div>
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
              {rows.map((r) => (
                <tr key={r._id}>
                  <td>
                    <div className={styles.cellMain}>{r.user?.name ?? T.deleted}</div>
                    <div className={styles.cellSub}>{r.user?.email}</div>
                  </td>
                  <td>{r.user ? (T.role[r.user.role] ?? r.user.role) : ""}</td>
                  <td>
                    <span className={styles.status}>
                      {T.method[r.method] ?? r.method}
                    </span>
                  </td>
                  <td>{T.times(r.count)}</td>
                  <td className={styles.cellDate}>{shortTime(r.lastAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
