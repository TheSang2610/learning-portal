import Link from "next/link";
import { ChevronDown, GraduationCap, LogOut } from "lucide-react";

import { INSTRUCTOR_MENU, INSTRUCTOR_SHELL as C } from "@/src/constants/instructor/menu";

import type { InstructorShellState } from "../hooks/useInstructorShell";
import styles from "../InstructorShell.module.scss";

/* 1. SIDEBAR NAVIGATION (CoreUI Dark Theme) */
export default function InstructorSidebar({ s }: { s: InstructorShellState }) {
  const { pathname } = s;

  return (
    <aside className={styles.aside}>
      {/* LOGO AREA */}
      <div className={styles.row3}>
        <Link href={C.coursesHref} className={styles.row4}>
          <div className={styles.card}>
            <GraduationCap size={18} className={styles.box2} />
          </div>
          <div>
            <h1 className={styles.title}>{C.brand}</h1>
          </div>
        </Link>
      </div>

      {/* LIST MENU ITEMS */}
      <nav className={`${styles.thinScroll} ${styles.nav}`}>
        <div className={styles.box3}>{C.workspace}</div>

        {INSTRUCTOR_MENU.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label}>
              {item.submenu ? (
                <div className={styles.stack}>
                  <button
                    onClick={s.toggleCourseMenu}
                    className={`group ${styles.button7} ${
                      s.inCourseArea ? styles.button : styles.button2
                    }`}
                  >
                    <div className={styles.row5}>
                      <Icon
                        size={16}
                        className={`${styles.box14} ${s.inCourseArea ? styles.box4 : styles.box5}`}
                      />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`${styles.box15} ${s.isCourseMenuOpen ? styles.box6 : ""}`}
                    />
                  </button>

                  {/* SUBMENU DROP-DOWN */}
                  {s.isCourseMenuOpen && (
                    <div className={styles.box7}>
                      {item.submenu.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isChildActive = subItem.activeRoutes.includes(pathname);

                        if (subItem.isIndicatorOnly && !isChildActive) return null;

                        return (
                          <Link
                            key={subItem.href || "lesson-indicator"}
                            href={subItem.href || "#"}
                            className={`${styles.row11} ${
                              isChildActive ? styles.box8 : styles.box9
                            }`}
                          >
                            <SubIcon
                              size={14}
                              className={isChildActive ? styles.box4 : styles.box10}
                            />
                            <span>
                              {subItem.label} {subItem.isIndicatorOnly && C.editing}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={`group ${styles.row12} ${
                    pathname === item.href ? styles.box11 : styles.button2
                  }`}
                >
                  <Icon
                    size={16}
                    className={`${styles.box14} ${pathname === item.href ? styles.box4 : styles.box5}`}
                  />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* SIDEBAR FOOTER (USER INFO) */}
      <div className={styles.row6}>
        <div className={styles.col}>
          <span className={styles.label3}>{s.instructorName || C.nameFallback}</span>
          <span className={styles.label4}>{C.roleLabel}</span>
        </div>
        <button onClick={s.logoutHandler} title={C.logout} className={styles.button3}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
