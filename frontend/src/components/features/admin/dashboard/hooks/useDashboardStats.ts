"use client";

import { useEffect, useState } from "react";

import {
  getDashboardActivity,
  getDashboardStatistics,
  type DashboardActivity,
  type DashboardStatistics,
} from "@/src/services/adminService";

/**
 * Hai luot goi song song: tong so (the so lieu) va chuoi theo ngay + ghi danh
 * gan day (bieu do, bang). Lay 90 ngay mot lan - doi 7/30/90 ngay tren bieu do
 * chi la cat bot o trinh duyet, khong goi lai.
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [activity, setActivity] = useState<DashboardActivity | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([getDashboardStatistics(), getDashboardActivity(90)])
      .then(([s, a]) => {
        if (!alive) return;
        setStats(s);
        setActivity(a);
      })
      .catch(() => alive && setError(true));
    return () => {
      alive = false;
    };
  }, []);

  return { stats, activity, error };
}
