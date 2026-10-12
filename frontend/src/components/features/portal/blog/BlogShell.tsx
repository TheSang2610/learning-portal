import type { ReactNode } from "react";

import styles from "./BlogList.module.scss";

interface BlogShellProps {
  /** Tieu de trang (BlogHeading). */
  heading: ReactNode;
  /** Cot phai (BlogTopicsAside). */
  aside: ReactNode;
  /** Cot trai: danh sach bai + phan trang. */
  children: ReactNode;
}

/** Khung trang /blog: tieu de, cot bai viet ben trai, cot chu de ben phai. */
export default function BlogShell({ heading, aside, children }: BlogShellProps) {
  return (
    <div className={styles.page}>
      {/* max-w-7xl px-6 trung voi BlogHeader, nho vay tieu de bai va logo tren
          thanh dieu huong thang hang nhau. */}
      <div className={styles.container}>
        {heading}

        <div className={styles.grid}>
          {/* --------------------------------------------------------- */}
          {/* Cot trai - danh sach bai viet                              */}
          {/* --------------------------------------------------------- */}
          <div>{children}</div>

          {/* --------------------------------------------------------- */}
          {/* Cot phai - chu de                                          */}
          {/* --------------------------------------------------------- */}
          {aside}
        </div>
      </div>
    </div>
  );
}
