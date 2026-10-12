"use client";

import { Loader2 } from "lucide-react";

import Pager from "@/src/components/ui/Pager";
import { ADMIN_CERTIFICATES as C } from "@/src/constants/admin/certificates-page";

import { useAdminCertificates } from "./hooks/useAdminCertificates";
import CertificateRow from "./parts/CertificateRow";
import styles from "./AdminCertificates.module.scss";

/** Trang /admin/certificates - chung chi da cap, loc va thu hoi. */
export default function AdminCertificates() {
  const s = useAdminCertificates();

  return (
    <div className={styles.stack}>
      <div>
        <h1 className={styles.title}>{C.title}</h1>
        <p className={styles.text}>{s.fetching ? C.loading : C.count(s.total)}</p>
      </div>

      <div className={styles.row}>
        <select
          value={s.validFilter}
          onChange={(e) => s.changeFilter(e.target.value)}
          className={styles.box3}
        >
          {C.filters.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {s.error && <div className={styles.card}>{s.error}</div>}

      <div className={styles.card2}>
        <div className={styles.scroller}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                {C.columns.map((col, i) => (
                  <th
                    key={col}
                    className={
                      i === C.columns.length - 1 ? styles.headCell2 : styles.headCell
                    }
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {s.fetching ? (
                <tr>
                  <td colSpan={7} className={styles.cell}>
                    <Loader2 size={20} className={styles.spinner} />
                  </td>
                </tr>
              ) : s.rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.cell2}>
                    {C.empty}
                  </td>
                </tr>
              ) : (
                s.rows.map((c) => (
                  <CertificateRow
                    key={c._id}
                    c={c}
                    busy={s.busyId === c._id}
                    copied={s.copied}
                    onCopy={s.copyCode}
                    onRevoke={s.revoke}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pager
          page={s.page}
          pages={s.pages}
          setPage={s.setPage}
          classes={{
            wrap: styles.row6,
            info: styles.text6,
            group: styles.row7,
            button: styles.box2,
          }}
        />
      </div>
    </div>
  );
}
