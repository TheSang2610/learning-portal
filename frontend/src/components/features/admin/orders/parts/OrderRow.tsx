import { ADMIN_ORDERS as C } from "@/src/constants/admin/orders-page";
import { formatMoney, type AdminOrder, type OrderStatus } from "@/src/services/order";

import styles from "../AdminOrders.module.scss";

// Mau nhan trang thai don. Truoc day la chuoi lop Tailwind dat thang o day;
// go Tailwind xong thi bon trang thai don nhin y het nhau.
const LABEL_STYLES: Record<OrderStatus, string> = {
  pending: styles.pendingLabel,
  paid: styles.doneLabel,
  cancelled: styles.cancelledLabel,
  expired: styles.expiredLabel,
};

const dateTime = (chuoi: string) =>
  new Date(chuoi).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface OrderRowProps {
  don: AdminOrder;
  busy: boolean;
  onConfirm: (order: AdminOrder) => void;
  onCancel: (order: AdminOrder) => void;
}

/** Mot don: ma, hoc vien, khoa (ca gio hang), tien, trang thai, thao tac. */
export default function OrderRow({
  don: order,
  busy,
  onConfirm,
  onCancel,
}: OrderRowProps) {
  return (
    <tr className={styles.row4}>
      <td className={styles.cell2}>{order.code}</td>
      <td className={styles.headCell}>
        <div className={styles.box2}>{order.student?.name ?? C.row.none}</div>
        <div className={styles.box3}>{order.student?.email ?? ""}</div>
      </td>
      <td className={styles.cell3}>
        {/* Don gio hang: hien du ten moi khoa - quan tri doi chieu
            mot dong sao ke voi CA don, can biet don tra cho nhung gi. */}
        <div className={styles.box4}>
          {order.courses && order.courses.length > 1
            ? C.row.cartCourses(
                order.courses.length,
                order.courses.map((k) => k.title).join(", "),
              )
            : (order.course?.title ?? C.row.none)}
        </div>
      </td>
      <td className={styles.cell4}>{formatMoney(order.amount)}</td>
      <td className={styles.headCell}>
        <span className={`${styles.label4} ${LABEL_STYLES[order.status]}`}>
          {C.statusLabel[order.status]}
        </span>
        {order.confirmedBy && (
          <div className={styles.box5}>{C.row.confirmedBy(order.confirmedBy.name)}</div>
        )}
        {order.daBaoChuyenKhoanLuc && order.status !== "paid" && (
          <div className={styles.box6}>
            {C.row.reportedAt(dateTime(order.daBaoChuyenKhoanLuc))}
          </div>
        )}
      </td>
      <td className={styles.cell5}>{dateTime(order.createdAt)}</td>
      <td className={styles.cell6}>
        {order.status === "paid" ? (
          <span className={styles.label3}>{C.row.processed}</span>
        ) : order.status === "cancelled" ? (
          <span className={styles.label3}>{C.row.cancelled}</span>
        ) : (
          <div className={styles.row5}>
            <button
              type="button"
              onClick={() => onConfirm(order)}
              disabled={busy}
              className={styles.button3}
            >
              {busy ? C.row.busy : C.row.confirm}
            </button>
            <button
              type="button"
              onClick={() => onCancel(order)}
              disabled={busy}
              className={styles.button4}
            >
              {C.row.cancel}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}
