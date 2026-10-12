import Link from "next/link";

import { ADMIN_SHELL as C } from "@/src/constants/admin/menu";

import styles from "../AdminShell.module.scss";

/** Duong dan "Home / Admin / Ten trang" tren thanh dau khu quan tri. */
export default function AdminBreadcrumbs({ pathname }: { pathname: string }) {
  const paths = pathname.split("/").filter((path) => path);

  return (
    <div className={styles.row}>
      <Link href={C.dashboardHref} className={styles.box12}>
        {C.home}
      </Link>
      {paths.map((path, index) => {
        const rawHref = "/" + paths.slice(0, index + 1).join("/");
        // /admin khong phai la mot trang -> tro ve dashboard
        const href = rawHref === "/admin" ? C.dashboardHref : rawHref;
        const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
        const isLast = index === paths.length - 1;

        // Khoa theo rawHref chu KHONG theo href.
        //
        // Dang o /admin/dashboard thi hai chang deu quy ve cung mot href:
        //   chang 0: "/admin"           -> doi thanh "/admin/dashboard"
        //   chang 1: "/admin/dashboard" -> giu nguyen
        // React nhan hai con cung khoa, canh bao "two children with the same
        // key" va co the ve thieu hoac ve trung mot chang. rawHref thi moi chang
        // moi khac vi no dai dan theo tung doan duong dan.
        return (
          <span key={rawHref} className={styles.row}>
            <span className={styles.label}>/</span>
            {isLast ? (
              <span className={styles.label2}>{label}</span>
            ) : (
              <Link href={href} className={styles.box}>
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}
