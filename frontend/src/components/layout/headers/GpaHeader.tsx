"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderUserMenu from "./HeaderUserMenu";

import styles from "./GpaHeader.module.scss";
// Cac cong cu diem va trang luyen tap dung chung header nay, nen dieu huong
// giua chung ngay tren thanh dau trang. Muc dang xem duoc to dam de biet minh
// dang o dau. Them muc moi thi nho them duong vao GPA_ROUTES trong Header.tsx.
const TOOLS = [
  { href: "/gpa-calculator", label: "Hồ sơ điểm" },
  { href: "/calc-point", label: "Tính điểm tổng kết" },
  { href: "/convert-10-to-4", label: "Quy đổi 10 → 4" },
  { href: "/practice", label: "Luyện tập" },
];

export default function GpaHeader() {
  const pathname = usePathname();

  return (
    <div className={styles.box}>
      <div className={styles.container}>
        <div className={styles.row}>
          {/* Cung kieu chu voi logo o IndividualsHeader de dong bo toan trang */}
          <Link href="/" className={styles.box2}>
            Learning Portal
            {/* Dong phu cho biet dang o khu cong cu diem, khong phai trang chu */}
            <span className={styles.logoPhu}>Quản lý điểm</span>
          </Link>

          <nav className={styles.nav}>
            {TOOLS.map((t) => {
              // Trang con (vd /practice/<de>) van to dam muc cha
              const active = pathname === t.href || pathname.startsWith(t.href + "/");
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={active ? styles.box3 : styles.box4}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <HeaderUserMenu />
      </div>
    </div>
  );
}
