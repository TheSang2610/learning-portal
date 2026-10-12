import Link from "next/link";

import { PAYMENT as P } from "@/src/constants/portal/payment-page";
import { coursesInOrder } from "@/src/lib/order";
import type { Order } from "@/src/services/order";

import styles from "../Payment.module.scss";

interface PaymentClosedProps {
  don: Order;
  recreating: boolean;
  onNewCode: () => void;
}

/** Don da huy hoac het han: cho lay ma moi ngay tai cho. */
export default function PaymentClosed({
  don: order,
  recreating,
  onNewCode,
}: PaymentClosedProps) {
  const T = P.closed;
  const cancelled = order.status === "cancelled";
  const multipleCourses = coursesInOrder(order).length > 1;

  return (
    <div className={styles.container3}>
      <h1 className={styles.title}>{cancelled ? T.cancelledTitle : T.expiredTitle}</h1>
      <p className={styles.text2}>{cancelled ? T.cancelledText : T.expiredText}</p>
      <div className={styles.row}>
        {/* Tao thang ma moi ngay tai day. Truoc day chi co duong quay ve
            trang khoa hoc roi bam Mua lai - ba buoc cho mot viec. */}
        {order.course && (
          <button onClick={onNewCode} disabled={recreating} className={styles.button2}>
            {recreating ? T.creating : T.newCode}
          </button>
        )}
        <Link
          href={
            multipleCourses
              ? P.cartHref
              : order.course
                ? P.courseHref(order.course.slug)
                : P.coursesHref
          }
          className={styles.box4}
        >
          {multipleCourses ? T.backToCart : T.backToCourse}
        </Link>
      </div>
    </div>
  );
}
