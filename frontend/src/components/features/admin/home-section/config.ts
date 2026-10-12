import { Award, CalendarDays, Flame, type LucideIcon } from "lucide-react";

import type { AdminHomeSectionKind } from "@/src/constants/admin/home-sections-page";
import {
  getAdminNewReleasesCourses,
  getAdminPopularCourses,
  getAdminTrendingCourses,
  type Course,
} from "@/src/services/course";

import styles from "./AdminHomeSection.module.scss";

interface SectionConfig {
  fetch: () => Promise<Course[]>;
  icon: LucideIcon;
  /** Lop scss bo sung (de mau) cho o bieu tuong / cot so lieu. */
  boxClass: string;
  cellClass: string;
  /** Cot so lieu: tong luot xem, luot xem thang nay hay ngay tao. */
  metric: "luotXem" | "luotXemThang" | "createdAt";
}

export const SECTION_CONFIG: Record<AdminHomeSectionKind, SectionConfig> = {
  popular: {
    fetch: getAdminPopularCourses,
    icon: Award,
    boxClass: "",
    cellClass: "",
    metric: "luotXem",
  },
  trending: {
    fetch: getAdminTrendingCourses,
    icon: Flame,
    boxClass: styles.boxTrending,
    cellClass: "",
    metric: "luotXemThang",
  },
  newReleases: {
    fetch: getAdminNewReleasesCourses,
    icon: CalendarDays,
    boxClass: styles.boxNewReleases,
    cellClass: styles.cellMuted,
    metric: "createdAt",
  },
};

// Thang theo gio Viet Nam, cung cach backend/src/utils/viewCount.js monthKey().
function currentMonth(): string {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 7);
}

/** Luot xem thang nay: so luu tren khoa cua thang cu thi tinh la 0. */
export function viewsThisMonth(course: Course): number {
  return course.thangLuotXem === currentMonth() ? course.luotXemThang || 0 : 0;
}
