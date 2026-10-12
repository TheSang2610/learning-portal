import Link from "next/link";

import { PAYMENT as P } from "@/src/constants/portal/payment-page";
import { coursesInOrder } from "@/src/lib/order";
import type { Order } from "@/src/services/order";

import styles from "../Payment.module.scss";

/** Don da thanh toan: bao thanh cong va dan vao hoc. */
export default function PaymentPaid({ don: order }: { don: Order }) {
  const T = P.paid;
  const courseCount = coursesInOrder(order).length;

  return (
    <div className={styles.container3}>
      <div className={styles.box2}>{T.check}</div>
      <h1 className={styles.title}>{T.title}</h1>
      <p className={styles.text2}>
        {courseCount > 1 ? (
          <>
            <strong>{T.many.strong(courseCount)}</strong>
            {T.many.rest}
          </>
        ) : (
          <>
            {T.one.a}
            <strong>{order.course?.title}</strong>
            {T.one.b}
          </>
        )}
      </p>
      <Link
        href={
          courseCount > 1
            ? P.myCoursesHref
            : order.course
              ? P.learnHref(order.course.slug)
              : P.coursesHref
        }
        className={styles.box3}
      >
        {courseCount > 1 ? T.toMyCourses : T.learnNow}
      </Link>
    </div>
  );
}
