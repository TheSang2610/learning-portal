"use client";

import { ADMIN_ORDERS as C } from "@/src/constants/admin/orders-page";

import { useAdminOrders } from "./hooks/useAdminOrders";
import OrderRow from "./parts/OrderRow";
import styles from "./AdminOrders.module.scss";

/** Trang /admin/orders - doi chieu sao ke va xac nhan don hang. */
export default function AdminOrders() {
  const item = useAdminOrders();

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <div>
          <h1 className={styles.title}>{C.title}</h1>
          <p className={styles.text}>{C.intro}</p>
        </div>
        {item.pending > 0 && (
          <span className={styles.label}>{C.pendingBadge(item.pending)}</span>
        )}
        {item.reported > 0 && (
          // Dem rieng so don DA CO NGUOI BAO da chuyen khoan.
          //
          // "Dang cho" gom ca don vua mo ra roi bo do - khong co gi de lam voi
          // chung. Con day la nhung nguoi that su dang ngoi doi, va la viec
          // phai mo sao ke ra doi chieu ngay.
          <span className={styles.label2}>{C.reportedBadge(item.reported)}</span>
        )}
      </div>

      <div className={styles.row2}>
        <div className={styles.row3}>
          {C.filters.map((b) => (
            <button
              key={b.giaTri || "all"}
              type="button"
              onClick={() => item.setFilter(b.giaTri)}
              className={`${styles.button5} ${
                item.query === b.giaTri ? styles.button : styles.button2
              }`}
            >
              {b.nhan}
            </button>
          ))}
        </div>
        <input
          value={item.tim}
          onChange={(e) => item.setSearch(e.target.value.toUpperCase())}
          placeholder={C.searchPlaceholder}
          className={styles.input}
        />
      </div>

      {item.loi && <p className={styles.text2}>{item.loi}</p>}

      <div className={styles.scroller}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th className={styles.headCell}>{C.columns.code}</th>
              <th className={styles.headCell}>{C.columns.student}</th>
              <th className={styles.headCell}>{C.columns.course}</th>
              <th className={styles.headCell2}>{C.columns.amount}</th>
              <th className={styles.headCell}>{C.columns.status}</th>
              <th className={styles.headCell}>{C.columns.createdAt}</th>
              <th className={styles.headCell2}>{C.columns.actions}</th>
            </tr>
          </thead>
          <tbody className={styles.tbody}>
            {item.loading && (
              <tr>
                <td colSpan={7} className={styles.cell}>
                  {C.loading}
                </td>
              </tr>
            )}

            {!item.loading && item.ds.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.cell}>
                  {C.empty}
                </td>
              </tr>
            )}

            {!item.loading &&
              item.ds.map((order) => (
                <OrderRow
                  key={order._id}
                  don={order}
                  busy={item.processing === order.code}
                  onConfirm={item.xacNhan}
                  onCancel={item.reject}
                />
              ))}
          </tbody>
        </table>
      </div>

      <p className={styles.text3}>
        {C.footnote.before}
        <strong>{C.footnote.strong}</strong>
        {C.footnote.after}
      </p>
    </div>
  );
}
