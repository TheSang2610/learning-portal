"use client";

import Link from "next/link";
import { FileUp } from "lucide-react";
import HeaderUserMenu from "./HeaderUserMenu";

import styles from "./ShareDocumentHeader.module.scss";
export default function ShareDocumentHeader() {
  return (
    <div className={styles.box}>
      <div className={styles.container}>
        <div className={styles.row}>
          <Link href="/share-document" className={styles.row2}>
            <FileUp size={22} className={styles.box2} />
            <span className={styles.label}>Chia sẻ tài liệu</span>
          </Link>

          <nav className={styles.nav}>
            <Link href="/blog" className={styles.box3}>
              Cẩm nang môn học
            </Link>
            <Link href="/courses" className={styles.box3}>
              Khóa học
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
