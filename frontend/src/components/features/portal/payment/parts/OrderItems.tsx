import { PAYMENT as P } from "@/src/constants/portal/payment-page";
import { coursesInOrder } from "@/src/lib/order";
import { formatMoney, type Order } from "@/src/services/order";

import styles from "../Payment.module.scss";

function OrderItemRow({ title, price }: { title: string; price: number }) {
  return (
    <div className={styles.row2}>
      <div className={styles.row3}>{P.items.badge}</div>
      <div className={styles.box7}>
        <h3 className={styles.subheading}>{title}</h3>
        <p className={styles.text3}>{P.items.course}</p>
      </div>
      <p className={styles.text4}>{formatMoney(price)}</p>
    </div>
  );
}

/** Cac muc trong don. */
export default function OrderItems({ don: order }: { don: Order }) {
  const items = coursesInOrder(order);

  return (
    <section className={styles.section} aria-labelledby="muc-don-hang">
      <h2 id="muc-don-hang" className={styles.heading}>
        {P.items.heading}
      </h2>
      {/* Don gio hang co nhieu dong; moi dong la gia cua khoa do. Dong
          tong (da tru ma giam gia neu co) nam o cau "Bạn cần chuyển" ben tren. */}
      {items.length > 1 ? (
        items.map((k) => <OrderItemRow key={k._id} title={k.title} price={k.price} />)
      ) : (
        <OrderItemRow
          title={order.course?.title ?? P.items.course}
          price={order.amount}
        />
      )}
    </section>
  );
}
