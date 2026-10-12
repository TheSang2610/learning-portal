"use client";

import { ADMIN_DASHBOARD as C } from "@/src/constants/admin/dashboard-page";

import { useDashboardStats } from "./hooks/useDashboardStats";
import StatCard from "./parts/StatCard";
import styles from "./AdminDashboard.module.scss";

/** Trang /admin/dashboard - bon the so lieu tong. */
export default function AdminDashboard() {
  const stats = useDashboardStats();

  if (!stats) {
    return <div>{C.loading}</div>;
  }

  return (
    <div>
      <h1 className={styles.title}>{C.title}</h1>

      <div className={styles.grid}>
        {C.cards.map((card) => (
          <StatCard key={card.key} label={card.label} value={stats[card.key].total} />
        ))}
      </div>
    </div>
  );
}
