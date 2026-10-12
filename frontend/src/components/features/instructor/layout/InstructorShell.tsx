"use client";

import type { ReactNode } from "react";
import { Menu } from "lucide-react";

import { INSTRUCTOR_SHELL as C } from "@/src/constants/instructor/menu";

import { useInstructorShell } from "./hooks/useInstructorShell";
import InstructorBreadcrumbs from "./parts/InstructorBreadcrumbs";
import InstructorSidebar from "./parts/InstructorSidebar";
import styles from "./InstructorShell.module.scss";

/** Khung khu giang vien: sidebar + header breadcrumb + noi dung trang. */
export default function InstructorShell({ children }: { children: ReactNode }) {
  const s = useInstructorShell();

  if (s.loading) {
    return <div className={styles.row2}>{C.loading}</div>;
  }

  return (
    <div className={styles.page}>
      <InstructorSidebar s={s} />

      {/* 2. MAIN VIEWPORT */}
      <div className={styles.col2}>
        {/* WHITE HEADER WITH BREADCRUMBS */}
        <header className={styles.header}>
          {/* BREADCRUMBS & HAMBURGER */}
          <div className={styles.row7}>
            <button className={styles.button4}>
              <Menu size={18} />
            </button>
            <InstructorBreadcrumbs pathname={s.pathname} />
          </div>

          {/* ACTION UTILITIES */}
          <div className={styles.row8} />
        </header>

        {/* PAGE CONTENT */}
        <main className={styles.main}>{children}</main>
      </div>

      {/* CUSTOM INTERNAL SCROLLBAR FOR SIDEBAR */}
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
