/** Chu va cac the so lieu cua trang /admin/dashboard. */
export const ADMIN_DASHBOARD = {
  loading: "Loading...",
  title: "Admin Dashboard",
  /** Moi the doc `total` cua mot nhom trong DashboardStatistics. */
  cards: [
    { key: "users", label: "Total Users" },
    { key: "courses", label: "Courses" },
    { key: "enrollments", label: "Enrollments" },
    { key: "certificates", label: "Certificates" },
  ],
} as const;
