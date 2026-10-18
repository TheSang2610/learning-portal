import type { LucideIcon } from "lucide-react";

/** Mot muc menu. Co `children` thi la nhom mo/dong duoc. */
export interface ShellNavItem {
  label: string;
  /** Rong = muc chi de chi bao (vd. "Noi dung bai hoc" khi dang soan). */
  href: string;
  icon: LucideIcon;
  /** Cac duong dan lam muc nay sang. Mac dinh: chi dung href. */
  activeRoutes?: string[];
  /** Chi hien khi dang o mot trong activeRoutes (muc chi bao). */
  hiddenUnlessActive?: boolean;
  children?: ShellNavItem[];
}

/** Mot nhom menu co nhan (vd. "Khoa hoc", "Kinh doanh"). */
export interface ShellNavGroup {
  label: string;
  items: ShellNavItem[];
}

/** Muc nay (khong tinh con) co dang sang voi duong dan hien tai khong. */
export const isItemActive = (item: ShellNavItem, pathname: string) =>
  (item.activeRoutes ?? (item.href ? [item.href] : [])).includes(pathname);

/** Muc nay HOAC mot muc con cua no dang sang. */
export const isTreeActive = (item: ShellNavItem, pathname: string): boolean =>
  isItemActive(item, pathname) ||
  Boolean(item.children?.some((c) => isTreeActive(c, pathname)));

/**
 * Chuoi muc tu goc toi muc dang sang - de ve breadcrumb. Uu tien muc con sau
 * nhat: dang o /admin/course-create thi la [Quan ly khoa hoc, Tao khoa hoc]
 * chu khong dung o nhom cha.
 */
export function findTrail(groups: ShellNavGroup[], pathname: string): ShellNavItem[] {
  const walk = (items: ShellNavItem[]): ShellNavItem[] | null => {
    for (const item of items) {
      if (item.children) {
        const sub = walk(item.children);
        if (sub) return [item, ...sub];
      }
      if (isItemActive(item, pathname)) return [item];
    }
    return null;
  };
  for (const g of groups) {
    const t = walk(g.items);
    if (t) return t;
  }
  return [];
}
