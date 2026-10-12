"use client";

import { BadgePercent, Plus } from "lucide-react";

import { ADMIN_VOUCHERS as C } from "@/src/constants/admin/vouchers-page";

import { useAdminVouchers } from "./hooks/useAdminVouchers";
import UsageModal from "./parts/UsageModal";
import VoucherForm from "./parts/VoucherForm";
import VoucherRow from "./parts/VoucherRow";
import styles from "./AdminVouchers.module.scss";

/** Trang /admin/vouchers - ma giam gia. */
export default function AdminVouchers() {
  const s = useAdminVouchers();

  return (
    <div className={styles.box}>
      <div className={styles.row}>
        <div className={styles.row2}>
          <BadgePercent size={22} className={styles.box2} />
          <h1 className={styles.title}>{C.title}</h1>
        </div>

        <button type="button" onClick={s.openCreate} className={styles.button}>
          <Plus size={16} /> {C.create}
        </button>
      </div>

      {s.loi && <p className={styles.text}>{s.loi}</p>}

      {s.openForm && <VoucherForm s={s} />}

      {s.loading && <p className={styles.text2}>{C.loading}</p>}

      {!s.loading && s.danhSach.length === 0 && (
        <div className={styles.card2}>{C.empty}</div>
      )}

      {/* overflow-x-auto: bang nay 7 cot, khong the vua man hinh dien thoai.
          Cuon rieng trong khung chu khong day ca trang di ngang. */}
      {!s.loading && s.danhSach.length > 0 && (
        <div className={styles.card3}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                {C.columns.map((col, i) => (
                  <th key={i} className={i === 4 ? styles.headCell2 : styles.headCell}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.danhSach.map((m) => (
                <VoucherRow key={m._id} m={m} onUsage={s.openUsage} onToggle={s.toggle} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {s.viewUsage && <UsageModal s={s} />}
    </div>
  );
}
