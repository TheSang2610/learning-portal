import Link from "next/link";

import { PAYMENT as P } from "@/src/constants/portal/payment-page";

import styles from "../Payment.module.scss";

/** Thieu ma don hoac doc don loi: mot dong thong bao va duong ve trang khoa hoc. */
export default function PaymentNotice({ text }: { text: string }) {
  return (
    <div className={styles.container}>
      <p className={styles.text}>{text}</p>
      <Link href={P.coursesHref} className={styles.box}>
        {P.backToCourses}
      </Link>
    </div>
  );
}
