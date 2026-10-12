import Link from "next/link";
import { ChevronDown, LogOut } from "lucide-react";

import {
  ADMIN_MENU,
  ADMIN_SHELL as C,
  COURSE_ROUTES,
  HOME_SECTION_ROUTES,
  LESSON_ROUTES,
  type AdminMenuItem,
} from "@/src/constants/admin/menu";

import type { AdminShellState } from "../hooks/useAdminShell";
import styles from "../AdminShell.module.scss";

/** Nhom menu co the mo/dong (Courses, Home Sections). */
function MenuGroup({ item, s }: { item: AdminMenuItem; s: AdminShellState }) {
  const { pathname } = s;
  const Icon = item.icon;
  const isGroupActive = item.isHomeSectionGroup
    ? HOME_SECTION_ROUTES.includes(pathname)
    : COURSE_ROUTES.includes(pathname) || LESSON_ROUTES.includes(pathname);
  const isOpen = item.isHomeSectionGroup ? s.isHomeMenuOpen : s.isCourseMenuOpen;
  const toggleMenu = item.isHomeSectionGroup ? s.toggleHomeMenu : s.toggleCourseMenu;

  return (
    <div className={styles.stack}>
      <button
        onClick={toggleMenu}
        className={`group ${styles.button5} ${isGroupActive ? styles.button : styles.button2}`}
      >
        <div className={styles.row5}>
          <Icon
            size={16}
            className={`${styles.box13} ${isGroupActive ? styles.box4 : styles.box5}`}
          />
          <span>{item.label}</span>
        </div>
        <ChevronDown
          size={14}
          className={`${styles.box14} ${isOpen ? styles.box6 : ""}`}
        />
      </button>

      {isOpen && (
        <div className={styles.box7}>
          {item.submenu?.map((subItem) => {
            const SubIcon = subItem.icon;
            const isChildActive = (subItem.activeRoutes ?? [subItem.href]).includes(
              pathname,
            );

            if (subItem.isIndicatorOnly && !isChildActive) return null;

            return (
              <Link
                key={subItem.href || "indicator"}
                href={subItem.href || "#"}
                className={`${styles.row9} ${isChildActive ? styles.box8 : styles.box9}`}
              >
                <SubIcon
                  size={14}
                  className={isChildActive ? styles.box4 : styles.box10}
                />
                <span>
                  {subItem.label} {subItem.isIndicatorOnly && C.editingSuffix}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Muc menu phang. */
function MenuLink({ item, pathname }: { item: AdminMenuItem; pathname: string }) {
  const Icon = item.icon;
  // URL da phang: so khop chinh xac, tru khi muc khai bao them
  // man hinh con qua matchRoutes.
  const isFlatActive = item.matchRoutes
    ? item.matchRoutes.includes(pathname)
    : pathname === item.href;

  return (
    <Link
      href={item.href}
      className={`group ${styles.row10} ${isFlatActive ? styles.box11 : styles.button2}`}
    >
      <Icon
        size={16}
        className={`${styles.box13} ${isFlatActive ? styles.box4 : styles.box5}`}
      />
      <span>{item.label}</span>
    </Link>
  );
}

/** Cot ben trai: logo, menu, ten admin + dang xuat. */
export default function AdminSidebar({ s }: { s: AdminShellState }) {
  return (
    <aside className={styles.aside}>
      <div className={styles.row3}>
        <Link href={C.dashboardHref} className={styles.row4}>
          <h1 className={styles.title}>{C.brand}</h1>
        </Link>
      </div>

      <nav className={`${styles.thinScroll} ${styles.nav}`}>
        <div className={styles.box2}>{C.groupFeatures}</div>

        {ADMIN_MENU.map((item, index) => (
          <div key={item.label}>
            {index === 1 && <div className={styles.box3}>{C.groupComponents}</div>}
            {item.submenu ? (
              <MenuGroup item={item} s={s} />
            ) : (
              <MenuLink item={item} pathname={s.pathname} />
            )}
          </div>
        ))}
      </nav>

      <div className={styles.row6}>
        <div className={styles.col}>
          <span className={styles.label3}>{s.adminName || C.adminFallback}</span>
          <span className={styles.label4}>{C.adminRole}</span>
        </div>
        <button
          onClick={s.logoutHandler}
          title={C.logoutTitle}
          className={styles.button3}
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
