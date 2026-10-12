import Link from "next/link";

import CartVoucherBox from "@/src/components/features/portal/cart/parts/CartVoucherBox";
import { CART } from "@/src/constants/portal/cart-page";

import type { CartState } from "../hooks/useCart";
import styles from "../Cart.module.scss";

/** Cot ben phai: tong tien, ma giam gia, thanh toan QR. */
export default function CartSummary({ s }: { s: CartState }) {
  const S = CART.summary;

  return (
    <aside className={styles.aside}>
      <div className={styles.sticky}>
        <h2 className={styles.heading2}>{S.heading}</h2>

        <div className={styles.row3}>
          <span className={styles.label2}>{s.giam > 0 ? S.subtotal : S.total}</span>
          <span className={styles.label3}>{s.totalPrice.toLocaleString("vi-VN")}đ</span>
        </div>

        {s.giam > 0 && (
          <div className={styles.row3}>
            <span className={styles.label2}>{S.voucher}</span>
            <span className={styles.label4}>−{s.giam.toLocaleString("vi-VN")}đ</span>
          </div>
        )}

        <div className={styles.box8}>
          <CartVoucherBox
            key={s.voucherVersion}
            mon={s.gio.map((m) => ({ courseId: m.courseId, title: m.title }))}
            onVoucherChange={s.changeVoucher}
          />
        </div>

        {/* Khach chua dang nhap van vao duoc trang nay - header co y cho
            ho them khoa vao gio truoc roi dang nhap sau. Khong tach
            nhanh nay thi ho bam thanh toan roi moi bi bao loi chua dang
            nhap. */}
        {!s.user && !s.loading ? (
          <div className={styles.box8}>
            <p className={styles.text6}>{S.loginHint}</p>
            <Link href={s.loginHref} className={styles.row5}>
              {S.login}
            </Link>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={s.payWithQr}
              disabled={s.creatingOrder}
              className={styles.button3}
            >
              {s.creatingOrder ? S.creatingOrder : S.payQr}
            </button>
            {s.orderError && <p className={styles.text7}>{s.orderError}</p>}
          </>
        )}

        {/* Ca gio gom vao mot don (mot ma, mot so tien), nen chuyen khoan
            mot lan la doi chieu duoc. */}
        <p className={styles.text8}>{S.qrNote}</p>
      </div>
    </aside>
  );
}
