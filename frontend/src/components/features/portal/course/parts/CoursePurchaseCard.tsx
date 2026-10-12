import Link from "next/link";
import { Check, CreditCard, ShieldCheck, ShoppingCart } from "lucide-react";

import VoucherInput from "@/src/components/features/portal/course/parts/VoucherInput";
import { COURSE_PAGE as C } from "@/src/constants/portal/course-page";
import { formatVnd } from "@/src/lib/format";
import type { Course } from "@/src/services/course";

import type { CourseDetailState } from "../hooks/useCourseDetail";
import styles from "../CourseDetail.module.scss";

/* CỘT PHẢI: BANNER BOX PHỤ (TRÁNH BỊ TRỐNG KHI CUỘN) */
export default function CoursePurchaseCard({
  s,
  course,
}: {
  s: CourseDetailState;
  course: Course;
}) {
  const P = C.purchase;
  const price = course.price ?? 0;

  return (
    <div id={C.buyAnchorId} className={styles.stack10}>
      <div className={styles.card12}>
        <div className={styles.stack8}>
          <span className={styles.label11}>{P.priceLabel}</span>
          <div className={styles.box43}>
            {price === 0 ? (
              <span className={styles.label12}>{P.free}</span>
            ) : (
              <span>{formatVnd(price)}</span>
            )}
          </div>
        </div>

        {s.expiredAt && !s.isEnrolled && (
          <div className={styles.card13}>
            <p className={styles.text15}>{P.expired(s.expiredAt)}</p>
          </div>
        )}

        {s.error && !s.isEnrolled && (
          <div className={styles.card13}>
            <p className={styles.text15}>{s.error}</p>
          </div>
        )}

        {s.isEnrolled ? (
          <Link href={C.learnHref(s.courseSlug)} className={styles.card14}>
            {P.continue}
          </Link>
        ) : (
          <div className={styles.stack2}>
            {/* O nhap ma dat TREN nut mua: nguoi dung phai ap ma
                xong roi moi bam mua, khong phai bam mua roi moi phat
                hien ra minh quen nhap ma. */}
            {price > 0 && (
              <VoucherInput courseId={course._id} onVoucherChange={s.changeVoucher} />
            )}

            {s.soTienGiam > 0 && (
              <p className={styles.text16}>
                <span className={styles.label13}>{formatVnd(price)}</span>{" "}
                <span className={styles.label14}>
                  {formatVnd(Math.max(0, price - s.soTienGiam))}
                </span>
              </p>
            )}

            {/* Them vao gio chi co nghia voi khoa CO PHI: khoa mien phi
                thi bam mot cai la vao hoc duoc ngay, bo vao gio roi quay
                lai thanh toan la bat nguoi ta di duong vong. */}
            {price > 0 &&
              (s.isInCart(course._id) ? (
                <Link href={C.cartHref} className={styles.card15}>
                  <Check size={16} /> {P.inCart}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={s.addCourseToCart}
                  className={styles.button10}
                >
                  <ShoppingCart size={16} /> {P.addToCart}
                </button>
              ))}

            <button
              onClick={s.handleEnrollCourse}
              disabled={s.submitting}
              className={styles.button11}
            >
              <CreditCard size={15} />
              {s.submitting
                ? P.linking
                : price > 0
                  ? s.expiredAt
                    ? P.renew
                    : P.transfer
                  : P.enroll}
            </button>
          </div>
        )}

        <div className={styles.stack11}>
          {[
            P.sessions(course.lessons?.length || 0),
            price > 0 ? P.accessPaid(course.accessDays || 30) : P.accessFree,
            ...(price > 0 ? [P.renewNote] : []),
            P.reviewKept,
          ].map((perk) => (
            <div key={perk} className={styles.row21}>
              <ShieldCheck size={16} className={styles.box44} />
              <span>{perk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
