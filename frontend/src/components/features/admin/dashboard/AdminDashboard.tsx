"use client";

import { ADMIN_DASHBOARD as C } from "@/src/constants/admin/dashboard-page";

import { useDashboardStats } from "./hooks/useDashboardStats";
import ActivityChart from "./parts/ActivityChart";
import RecentEnrollments from "./parts/RecentEnrollments";
import RecentLogins from "./parts/RecentLogins";
import SectionCards from "./parts/SectionCards";
import styles from "./AdminDashboard.module.scss";

/**
 * Trang /admin/dashboard - bo cuc shadcn/ui Dashboard: bon the so lieu, bieu do
 * vung theo ngay, bang ghi danh gan day, bang dang nhap gan day. Moi con so lay tu may chu.
 */
export default function AdminDashboard() {
  const { stats, activity, error } = useDashboardStats();

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.title}>{C.title}</h1>
        <p className={styles.subtitle}>{C.subtitle}</p>
      </div>

      {error ? (
        <p className={styles.error}>{C.error}</p>
      ) : !stats || !activity ? (
        <div className={styles.cards} aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`${styles.statCard} ${styles.skeleton}`} />
          ))}
        </div>
      ) : (
        <>
          <SectionCards stats={stats} activity={activity} />
          <ActivityChart days={activity.days} />
          <RecentEnrollments rows={activity.recent} />
          <RecentLogins rows={activity.recentLogins ?? []} />
        </>
      )}
    </div>
  );
}
