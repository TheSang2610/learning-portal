"use client";

import type { ReactNode } from "react";

import DashboardShell from "@/src/components/layout/dashboard-shell/DashboardShell";
import { INSTRUCTOR_NAV, INSTRUCTOR_SHELL as C } from "@/src/constants/instructor/menu";

import { useInstructorShell } from "./hooks/useInstructorShell";
import styles from "./InstructorShell.module.scss";

/** Khung khu giang vien: dung khung chung kieu shadcn (sidebar + breadcrumb). */
export default function InstructorShell({ children }: { children: ReactNode }) {
  const s = useInstructorShell();

  if (s.loading) {
    return <div className={styles.loading}>{C.loading}</div>;
  }

  return (
    <DashboardShell
      pathname={s.pathname}
      brand={{
        name: C.brand,
        subtitle: C.brandSub,
        href: C.coursesHref,
        icon: C.brandIcon,
      }}
      nav={INSTRUCTOR_NAV}
      user={{ name: s.instructorName || C.nameFallback, subtitle: C.roleLabel }}
      onLogout={s.logoutHandler}
      root={{ label: C.root, href: C.coursesHref }}
      labels={{ toggle: C.toggle, logout: C.logout, editing: C.editing }}
    >
      {children}
    </DashboardShell>
  );
}
