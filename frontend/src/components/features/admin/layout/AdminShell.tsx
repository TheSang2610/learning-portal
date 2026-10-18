"use client";

import { ShieldCheck } from "lucide-react";

import DashboardShell from "@/src/components/layout/dashboard-shell/DashboardShell";
import { ADMIN_NAV, ADMIN_SHELL as C } from "@/src/constants/admin/menu";

import { useAdminShell } from "./hooks/useAdminShell";
import styles from "./AdminShell.module.scss";

/** Khung khu quan tri: dung khung chung kieu shadcn (sidebar + breadcrumb). */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const s = useAdminShell();

  if (s.loading) {
    return <div className={styles.loading}>{C.loading}</div>;
  }

  return (
    <DashboardShell
      pathname={s.pathname}
      brand={{
        name: C.brand,
        subtitle: C.brandSub,
        href: C.dashboardHref,
        icon: ShieldCheck,
      }}
      nav={ADMIN_NAV}
      user={{ name: s.adminName || C.adminFallback, subtitle: C.adminRole }}
      onLogout={s.logoutHandler}
      root={{ label: C.root, href: C.dashboardHref }}
      labels={{ toggle: C.toggle, logout: C.logout, editing: C.editing }}
    >
      {children}
    </DashboardShell>
  );
}
