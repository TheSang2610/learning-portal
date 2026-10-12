"use client";

import { Suspense } from "react";

import { PAYMENT as P } from "@/src/constants/portal/payment-page";

import { usePayment } from "./hooks/usePayment";
import PaymentClosed from "./parts/PaymentClosed";
import PaymentNotice from "./parts/PaymentNotice";
import PaymentPaid from "./parts/PaymentPaid";
import PaymentPending from "./parts/PaymentPending";
import styles from "./Payment.module.scss";

function PaymentContent() {
  const s = usePayment();
  const { don: order } = s;

  if (!s.ma) return <PaymentNotice text={P.missingCode} />;

  if (s.loading) {
    return <div className={styles.container2}>{P.loadingOrder}</div>;
  }

  if (s.loi && !order) return <PaymentNotice text={s.loi} />;

  if (!order) return null;

  // --- Đơn đã thanh toán -----------------------------------------------
  if (order.status === "paid") return <PaymentPaid don={order} />;

  // --- Đơn đã hủy hoặc hết hạn ------------------------------------------
  if (order.status === "cancelled" || order.status === "expired") {
    return (
      <PaymentClosed don={order} recreating={s.recreating} onNewCode={s.regenerateCode} />
    );
  }

  // --- Đơn đang chờ thanh toán ------------------------------------------
  return <PaymentPending s={s} don={order} />;
}

export default function Payment() {
  // useSearchParams bắt buộc phải nằm trong Suspense, nếu không Next từ chối
  // build trang này ở chế độ tĩnh.
  return (
    <Suspense fallback={<div className={styles.container2}>{P.loadingFallback}</div>}>
      <PaymentContent />
    </Suspense>
  );
}
