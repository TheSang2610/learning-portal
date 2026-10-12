"use client";

import { useEffect, useState } from "react";

import {
  getDashboardStatistics,
  type DashboardStatistics,
} from "@/src/services/adminService";

/** So lieu tong quan cho dashboard admin; null khi dang tai. */
export function useDashboardStats() {
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

  return stats;
}
