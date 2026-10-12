import Link from "next/link";

import { INSTRUCTOR_SHELL as C } from "@/src/constants/instructor/menu";

import styles from "../InstructorShell.module.scss";

/** Tự động phân tách URL để render sơ đồ Breadcrumbs (Home / Instructor / Courses...) */
export default function InstructorBreadcrumbs({ pathname }: { pathname: string }) {
  const paths = pathname.split("/").filter((path) => path);

  return (
    <div className={styles.row}>
      <Link href={C.homeHref} className={styles.box12}>
        {C.home}
      </Link>
      {paths.map((path, index) => {
        const rawHref = "/" + paths.slice(0, index + 1).join("/");
        // /instructor chi la panel -> tro ve danh sach khoa hoc
        const href = rawHref === C.homeHref ? C.coursesHref : rawHref;
        const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
        const isLast = index === paths.length - 1;

        return (
          // key theo rawHref: href cua "/instructor" bi doi thanh /instructor/courses,
          // trung voi muc "Courses" ngay sau no.
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
