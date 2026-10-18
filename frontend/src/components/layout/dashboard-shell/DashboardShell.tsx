"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, LogOut, PanelLeft, type LucideIcon } from "lucide-react";

import {
  findTrail,
  isItemActive,
  isTreeActive,
  type ShellNavGroup,
  type ShellNavItem,
} from "./nav";
import { avatarColor } from "@/src/components/ui/Avatar";

import styles from "./DashboardShell.module.scss";

export interface DashboardShellProps {
  pathname: string;
  brand: { name: string; subtitle: string; href: string; icon: LucideIcon };
  nav: ShellNavGroup[];
  user: { name: string; subtitle: string };
  onLogout: () => void;
  /** Chang dau cua breadcrumb (vd. "Quan tri" -> /admin/dashboard). */
  root: { label: string; href: string };
  labels: { toggle: string; logout: string; editing: string };
  children: ReactNode;
}

// Thu gon sidebar la thoi quen cua RIENG may nay - de o localStorage.
const COLLAPSE_KEY = "khung-quan-tri-thu-gon";

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

/**
 * Khung chung cua khu quan tri va khu giang vien, bo cuc theo shadcn/ui
 * Dashboard (sidebar "inset"): sidebar nen xam nhat ben trai, noi dung la mot
 * khung trang bo goc noi tren nen, thanh dau cao 48px co nut an/hien sidebar
 * + breadcrumb.
 *
 * - Desktop: bam nut (hoac Ctrl/Cmd + B) de thu sidebar ve mot cot bieu tuong.
 * - Man hinh hep: sidebar la ngan keo truot tu trai, co lop phu.
 */
export default function DashboardShell({
  pathname,
  brand,
  nav,
  user,
  onLogout,
  root,
  labels,
  children,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  // Nhom nguoi dung tu bam mo/dong. Chua bam thi nhom dang chua trang hien tai
  // tu mo.
  const [openState, setOpenState] = useState<Record<string, boolean>>({});

  // Doi trang tren dien thoai thi dong ngan keo.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  const toggle = () => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setMobileOpen((v) => !v);
      return;
    }
    setCollapsed((v) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, v ? "0" : "1");
      } catch {}
      return !v;
    });
  };

  // Phim tat giong shadcn: Ctrl/Cmd + B.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const trail = findTrail(nav, pathname);

  const renderItem = (item: ShellNavItem) => {
    const Icon = item.icon;

    if (item.children) {
      const treeActive = isTreeActive(item, pathname);
      const open = openState[item.label] ?? treeActive;
      const kids = item.children.filter(
        (c) => !c.hiddenUnlessActive || isItemActive(c, pathname),
      );

      // Thu gon: chi con bieu tuong, bam vao di thang toi muc con dau tien.
      if (collapsed) {
        return (
          <li key={item.label}>
            <Link
              href={kids[0]?.href || item.href}
              className={`${styles.item} ${treeActive ? styles.itemActive : ""}`}
              title={item.label}
            >
              <Icon size={16} aria-hidden />
              <span className={styles.itemLabel}>{item.label}</span>
            </Link>
          </li>
        );
      }

      return (
        <li key={item.label}>
          <button
            type="button"
            onClick={() => setOpenState((s) => ({ ...s, [item.label]: !open }))}
            className={`${styles.item} ${treeActive && !open ? styles.itemActive : ""}`}
            aria-expanded={open}
          >
            <Icon size={16} aria-hidden />
            <span className={styles.itemLabel}>{item.label}</span>
            <ChevronRight
              size={16}
              aria-hidden
              className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
            />
          </button>
          {open && (
            <ul className={styles.sub}>
              {kids.map((c) => {
                const active = isItemActive(c, pathname);
                return (
                  <li key={c.label}>
                    <Link
                      href={c.href || "#"}
                      className={`${styles.subItem} ${active ? styles.subItemActive : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      {c.label}
                      {c.hiddenUnlessActive && (
                        <span className={styles.editing}>{labels.editing}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      );
    }

    const active = isItemActive(item, pathname);
    return (
      <li key={item.label}>
        <Link
          href={item.href}
          className={`${styles.item} ${active ? styles.itemActive : ""}`}
          aria-current={active ? "page" : undefined}
          title={collapsed ? item.label : undefined}
        >
          <Icon size={16} aria-hidden />
          <span className={styles.itemLabel}>{item.label}</span>
        </Link>
      </li>
    );
  };

  const BrandIcon = brand.icon;

  return (
    <div
      className={`${styles.wrapper} ${collapsed ? styles.collapsed : ""} ${
        mobileOpen ? styles.mobileOpen : ""
      }`}
    >
      {/* Lop phu ngan keo tren man hinh hep. */}
      <div className={styles.overlay} onClick={() => setMobileOpen(false)} aria-hidden />

      <aside className={styles.sidebar} aria-label={brand.name}>
        <div className={styles.sidebarHeader}>
          <Link href={brand.href} className={styles.brand} title={brand.name}>
            <span className={styles.brandIcon}>
              <BrandIcon size={16} aria-hidden />
            </span>
            <span className={styles.brandText}>
              <span className={styles.brandName}>{brand.name}</span>
              <span className={styles.brandSub}>{brand.subtitle}</span>
            </span>
          </Link>
        </div>

        <nav className={styles.sidebarContent}>
          {nav.map((group) => (
            <div key={group.label} className={styles.group}>
              <div className={styles.groupLabel}>{group.label}</div>
              <ul className={styles.menu}>{group.items.map(renderItem)}</ul>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.user}>
            <span
              className={styles.avatar}
              style={{ backgroundColor: avatarColor(user.name), color: "#fff" }}
              aria-hidden
            >
              {initials(user.name)}
            </span>
            <span className={styles.userText}>
              <span className={styles.userName}>{user.name}</span>
              <span className={styles.userSub}>{user.subtitle}</span>
            </span>
            <button
              type="button"
              onClick={onLogout}
              className={styles.logout}
              title={labels.logout}
              aria-label={labels.logout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.inset}>
        <header className={styles.header}>
          <button
            type="button"
            onClick={toggle}
            className={styles.trigger}
            aria-label={labels.toggle}
            title={`${labels.toggle} (Ctrl+B)`}
          >
            <PanelLeft size={16} />
          </button>
          <span className={styles.separator} aria-hidden />
          <nav aria-label="Breadcrumb">
            <ol className={styles.breadcrumb}>
              <li className={trail.length ? styles.crumbHideMobile : ""}>
                {trail.length ? (
                  <Link href={root.href}>{root.label}</Link>
                ) : (
                  <span aria-current="page">{root.label}</span>
                )}
              </li>
              {trail.map((t, i) => {
                const last = i === trail.length - 1;
                return (
                  <li key={t.label} className={!last ? styles.crumbHideMobile : ""}>
                    <ChevronRight size={14} aria-hidden className={styles.crumbSep} />
                    {last ? (
                      <span aria-current="page">{t.label}</span>
                    ) : (
                      <Link href={t.children?.[0]?.href || t.href}>{t.label}</Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </header>

        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
