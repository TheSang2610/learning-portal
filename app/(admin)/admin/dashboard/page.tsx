"use client";

import { useEffect, useState } from "react";
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
      <h1 className="mb-8 text-4xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-6">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm text-gray-500">Total Users</h2>

          <p className="mt-2 text-3xl font-bold">{stats.users.total}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm text-gray-500">Courses</h2>

          <p className="mt-2 text-3xl font-bold">{stats.courses.total}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm text-gray-500">Enrollments</h2>

          <p className="mt-2 text-3xl font-bold">{stats.enrollments.total}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm text-gray-500">Certificates</h2>

          <p className="mt-2 text-3xl font-bold">{stats.certificates.total}</p>
        </div>
      </div>
    </div>
  );
}
