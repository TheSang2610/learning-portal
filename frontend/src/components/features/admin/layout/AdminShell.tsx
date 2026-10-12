"use client";

import { Menu } from "lucide-react";

import { ADMIN_SHELL as C } from "@/src/constants/admin/menu";

import { useAdminShell } from "./hooks/useAdminShell";
import AdminBreadcrumbs from "./parts/AdminBreadcrumbs";
import AdminSidebar from "./parts/AdminSidebar";
import styles from "./AdminShell.module.scss";

/** Khung khu quan tri: sidebar + thanh dau (breadcrumb) + noi dung trang. */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const s = useAdminShell();

  if (s.loading) {
    return <div className={styles.row2}>{C.loading}</div>;
  }

  return (
    <div className={styles.page}>
      <AdminSidebar s={s} />

      <div className={styles.col2}>
        <header className={styles.header}>
          <div className={styles.row7}>
            <button className={styles.button4}>
              <Menu size={18} />
            </button>
            <AdminBreadcrumbs pathname={s.pathname} />
          </div>
          <div className={styles.row8}></div>
        </header>

        <main className={styles.main}>{children}</main>
      </div>

      {/* Thanh cuon gon cho sidebar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1e2530;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2a323d;
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3e4958;
        }
      `}</style>
    </div>
  );
}
