import type { LucideIcon } from "lucide-react";

/** Mot o so lieu duoi tieu de trang cong cu ("12 · Thang điểm"). */
export interface GpaToolStat {
  icon: LucideIcon;
  value: string;
  label: string;
}

/** Phan dau trang Tinh diem tong ket / Quy doi 10 -> 4. */
export interface GpaToolHeroData {
  icon: LucideIcon;
  title: string;
  intro: string;
  stats: GpaToolStat[];
}

export interface GradeProfileHeroData {
  title: string;
  subtitle: string;
}
