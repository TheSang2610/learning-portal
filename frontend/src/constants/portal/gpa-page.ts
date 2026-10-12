import {
  ArrowRightLeft,
  Calculator,
  GraduationCap,
  Repeat,
  TrendingUp,
  Trophy,
} from "lucide-react";

import type { FeatureLink } from "@/src/components/features/portal/gpa/FeatureLinks";
import { SCALES, STRUCTURES } from "@/src/components/features/portal/gpa/gradeScales";
import type { GpaToolStat } from "@/src/types/gpa";

const RELATED = {
  title: "Các tính năng liên quan",
  subtitle: "Khám phá thêm các công cụ hỗ trợ học tập khác",
};

const LINK_GPA: FeatureLink = {
  href: "/gpa-calculator",
  label: "GPA & CPA",
  desc: "Tính toán & theo dõi",
  icon: GraduationCap,
};

/** Trang /calc-point. */
export const CALC_POINT_PAGE = {
  metadata: {
    title: "Tính điểm tổng kết",
    description:
      "Công cụ tính điểm tổng kết chính xác và nhanh chóng. Hỗ trợ nhiều cấu trúc điểm và thang điểm khác nhau của các trường đại học.",
  },
  hero: {
    icon: Calculator,
    title: "Tính điểm tổng kết",
    intro:
      "Công cụ tính điểm tổng kết chính xác và nhanh chóng. Hỗ trợ nhiều cấu trúc điểm và thang điểm khác nhau của các trường đại học.",
    // Con so lay tu chinh du lieu chu khong go cung: them mot cau truc diem la o
    // day tu cap nhat, khong bao gio lech voi so luong that trong o chon.
    stats: [
      { icon: TrendingUp, value: String(STRUCTURES.length), label: "Cấu trúc điểm" },
      { icon: GraduationCap, value: String(SCALES.length), label: "Thang điểm" },
      { icon: Trophy, value: "100%", label: "Chính xác" },
    ] as GpaToolStat[],
  },
  related: {
    ...RELATED,
    items: [
      LINK_GPA,
      {
        href: "/convert-10-to-4",
        label: "Chuyển hệ 10 sang 4",
        desc: "Chuyển đổi thang điểm",
        icon: Repeat,
      },
    ] as FeatureLink[],
  },
};

/** Trang /convert-10-to-4. */
export const CONVERT_10_TO_4_PAGE = {
  metadata: {
    title: "Quy đổi điểm hệ 10 sang hệ 4",
    description:
      "Công cụ chuyển đổi điểm chính xác và nhanh chóng từ hệ 10 sang hệ 4. Hỗ trợ nhiều thang điểm khác nhau của các trường đại học Việt Nam.",
  },
  hero: {
    icon: Repeat,
    title: "Quy đổi điểm hệ 10 sang hệ 4",
    intro:
      "Công cụ chuyển đổi điểm chính xác và nhanh chóng từ hệ 10 sang hệ 4. Hỗ trợ nhiều thang điểm khác nhau của các trường đại học Việt Nam.",
    stats: [
      { icon: ArrowRightLeft, value: String(SCALES.length), label: "Thang điểm" },
      { icon: GraduationCap, value: "100+", label: "Trường ĐH" },
      { icon: Trophy, value: "Tức thì", label: "Kết quả" },
    ] as GpaToolStat[],
  },
  related: {
    ...RELATED,
    items: [
      LINK_GPA,
      {
        href: "/calc-point",
        label: "Tính điểm tổng kết",
        desc: "Công cụ tính điểm",
        icon: Calculator,
      },
    ] as FeatureLink[],
  },
};

/** Trang /gpa-calculator (Ho so diem). */
export const GRADE_PROFILE_PAGE = {
  metadata: {
    title: "Hồ sơ điểm",
    description: "Tính GPA, CPA và dự kiến điểm",
  },
  hero: {
    title: "Hồ sơ điểm",
    subtitle: "Tính GPA, CPA và dự kiến điểm",
  },
  related: {
    title: "Các tính năng khác",
    subtitle: "Khám phá các công cụ tính điểm hữu ích khác",
    items: [
      { href: "/calc-point", label: "Tính điểm tổng kết", icon: Calculator },
      { href: "/convert-10-to-4", label: "Chuyển hệ 10 sang 4", icon: Repeat },
    ] as FeatureLink[],
  },
};
