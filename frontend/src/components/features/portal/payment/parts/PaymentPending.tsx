import { PAYMENT as P } from "@/src/constants/portal/payment-page";
import { formatMoney, type Order } from "@/src/services/order";

import type { PaymentState } from "../hooks/usePayment";
import styles from "../Payment.module.scss";
import BankTransfer from "./BankTransfer";
import HoldClock from "./HoldClock";
import OrderItems from "./OrderItems";
import ReportTransfer from "./ReportTransfer";

/** Don dang cho thanh toan. */
export default function PaymentPending({
  s,
  don: order,
}: {
  s: PaymentState;
  don: Order;
}) {
  const T = P.pending;
  const ck = order.chuyenKhoan;

  return (
    <div className={styles.container4}>
      {/* Đồng hồ giữ đơn */}
      <HoldClock conLai={s.conLai} reported={Boolean(order.daBaoChuyenKhoanLuc)} />

      <h1 className={styles.title2}>{T.title}</h1>
      <p className={styles.text2}>
        {T.intro.a}
        <strong>{formatMoney(order.amount)}</strong>
        {T.intro.b}
        <span className={styles.label}>{order.code}</span>
        {T.intro.c}
      </p>

      {/* Các mục trong đơn */}
      <OrderItems don={order} />

      {/* Chưa khai báo tài khoản nhận tiền */}
      {ck && !ck.daCauHinh && (
        <div className={styles.card}>
          {P.bank.notConfigured.a}
          <strong>{order.code}</strong>
          {P.bank.notConfigured.b}
        </div>
      )}

      {ck?.daCauHinh && (
        <BankTransfer
          don={order}
          ck={ck}
          copiedAll={s.copiedAll}
          onCopyAll={s.copyDetails}
        />
      )}

      <ReportTransfer s={s} don={order} />

      {s.loi && <p className={styles.text12}>{s.loi}</p>}

      <div className={styles.box13}>
        <button
          type="button"
          onClick={s.cancel}
          disabled={s.cancelling}
          className={styles.button5}
        >
          {s.cancelling ? T.cancelling : T.cancel}
        </button>
      </div>
    </div>
  );
}
