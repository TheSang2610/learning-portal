"use client";

import Link from "next/link";
import BrandLogo from "@/src/components/layout/BrandLogo";
import { usePathname } from "next/navigation";
import HeaderUserMenu from "./HeaderUserMenu";
import { ALL_PATH, SCHOOLS_PATH } from "@/src/lib/document/paths";

import styles from "./ShareDocumentHeader.module.scss";

// Menu rieng cua khu tai lieu - dieu huong trong khu, khong dan ra cam nang /
// khoa hoc (hai muc do da co o thanh TopNav tren cung).
const MENU = [
  { href: SCHOOLS_PATH, nhan: "Trường đại học" },
  { href: ALL_PATH, nhan: "Tất cả tài liệu" },
  { href: "/help", nhan: "Trợ giúp" },
];

export default function ShareDocumentHeader() {
  const pathname = usePathname();
  return (
    <div className={styles.box}>
      <div className={styles.container}>
        <div className={styles.row}>
          <BrandLogo brand="document" />

          <nav className={styles.nav} aria-label="Khu chia sẻ tài liệu">
            {MENU.map((m) => {
              // Dang o trang do hoac trang con cua no (vd. mot truong, mot tai lieu).
              const current = pathname === m.href || pathname.startsWith(`${m.href}/`);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  aria-current={current ? "page" : undefined}
                  className={`${styles.box3} ${current ? styles.current : ""}`}
                >
                  {m.nhan}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Khu tai lieu mien phi, khong ban gi - khong can gio hang. */}
        <HeaderUserMenu hasCart={false} />
      </div>
    </div>
  );
}
