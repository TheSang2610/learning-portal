import { PAYMENT as P } from "@/src/constants/portal/payment-page";
import { formatMoney, type Order } from "@/src/services/order";

import type { PaymentState } from "../hooks/usePayment";
import styles from "../Payment.module.scss";
import BankTransfer from "./BankTransfer";
import HoldClock from "./HoldClock";
import OrderItems from "./OrderItems";

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

      {/* Truoc 22/10/2026 cho nay la nut "Tôi đã chuyển khoản" gui mail cho quan
          tri doi chieu tay. Gio Casso bao tien ve va may chu tu xac nhan, con
          trang nay tu hoi lai trang thai moi P.pollMs - hoc vien khong can lam gi.
          Don cu da bao chuyen khoan van giu dau vet o HoldClock (reported). */}
      <div className={styles.card3} role="status">
        <p className={styles.autoTitle}>
          <span className={styles.autoDot} aria-hidden />
          {P.auto.title}
        </p>
        <p className={styles.text9}>{P.auto.text}</p>
      </div>

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
