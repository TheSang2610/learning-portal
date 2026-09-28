"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderUserMenu from "./HeaderUserMenu";
import {
  DUONG_TAT_CA,
  DUONG_TRANG_CHU,
  DUONG_TRUONG,
} from "@/src/components/document/duongDan";

import styles from "./ShareDocumentHeader.module.scss";

// Menu rieng cua khu tai lieu - dieu huong trong khu, khong dan ra cam nang /
// khoa hoc (hai muc do da co o thanh TopNav tren cung).
const MENU = [
  { href: DUONG_TRUONG, nhan: "Trường đại học" },
  { href: DUONG_TAT_CA, nhan: "Tất cả tài liệu" },
  { href: "/help", nhan: "Trợ giúp" },
];

export default function ShareDocumentHeader() {
  const pathname = usePathname();
  return (
    <div className={styles.box}>
      <div className={styles.container}>
        <div className={styles.row}>
          {/* Chu logo cung kieu "Learning Portal" o trang chu, mau tim dam cua
              dai dau khu tai lieu (ShareDocumentHero). */}
          <Link href={DUONG_TRANG_CHU} className={styles.logo}>
            LearningDocument
          </Link>

          <nav className={styles.nav} aria-label="Khu chia sẻ tài liệu">
            {MENU.map((m) => {
              // Dang o trang do hoac trang con cua no (vd. mot truong, mot tai lieu).
              const dangO = pathname === m.href || pathname.startsWith(`${m.href}/`);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  aria-current={dangO ? "page" : undefined}
                  className={`${styles.box3} ${dangO ? styles.dangO : ""}`}
                >
                  {m.nhan}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Khu tai lieu mien phi, khong ban gi - khong can gio hang. */}
        <HeaderUserMenu coGioHang={false} />
      </div>
    </div>
  );
}
