import Link from "next/link";

import { BLOG } from "@/src/constants/portal/blog-page";

import styles from "./BlogList.module.scss";

interface BlogPagerProps {
  page: number;
  currentPage: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}

/** Truoc / Trang x/y / Sau - bang Link de giu trang dung san va nut Back. */
export default function BlogPager({
  page,
  currentPage,
  totalPages,
  hrefFor,
}: BlogPagerProps) {
  const L = BLOG.list;

  return (
    <div className={styles.row}>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={styles.card2}>
          {L.prev}
        </Link>
      ) : (
        <span className={styles.label3}>{L.prev}</span>
      )}
      <span className={styles.label4}>{L.pageOf(currentPage, totalPages)}</span>
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={styles.card2}>
          {L.next}
        </Link>
      ) : (
        <span className={styles.label3}>{L.next}</span>
      )}
    </div>
  );
}
