"use client";

import Link from "next/link";
import { BookMarked } from "lucide-react";
import HeaderUserMenu from "./HeaderUserMenu";

import styles from "./BlogHeader.module.scss";
export default function BlogHeader() {
  return (
    <div className={styles.box}>
      <div className={styles.container}>
        <div className={styles.row}>
          <Link href="/blog" className={styles.row2}>
            <BookMarked size={22} className={styles.box2} />
            <span className={styles.label}>Cẩm nang môn học</span>
          </Link>

          <nav className={styles.nav}>
            <Link href="/courses" className={styles.box3}>
              Khóa học
            </Link>
            <Link href="/share-document" className={styles.box3}>
              Chia sẻ tài liệu
            </Link>
            <Link href="/help" className={styles.box3}>
              Trợ giúp
            </Link>
          </nav>
        </div>

        <HeaderUserMenu />
      </div>
    </div>
  );
}
