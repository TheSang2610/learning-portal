"use client";

import { useEffect, useState } from "react";

import styles from "./page.module.scss";
import {
  getDashboardStatistics,
  type DashboardStatistics,
} from "@/src/services/adminService";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStatistics();
        setStats(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.heading}>Total Users</h2>

          <p className={styles.text}>{stats.users.total}</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.heading}>Courses</h2>

          <p className={styles.text}>{stats.courses.total}</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.heading}>Enrollments</h2>

          <p className={styles.text}>{stats.enrollments.total}</p>
        </div>

        <div className={styles.card}>
          <h2 className={styles.heading}>Certificates</h2>

          <p className={styles.text}>{stats.certificates.total}</p>
        </div>
      </div>
    </div>
  );
}
