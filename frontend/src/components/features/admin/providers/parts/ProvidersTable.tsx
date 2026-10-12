import { Building2, Edit3, RefreshCw, School, Trash2 } from "lucide-react";

import SafeImage from "@/src/components/ui/SafeImage";
import { ADMIN_PROVIDERS as C } from "@/src/constants/admin/providers-page";

import type { AdminProvidersState } from "../hooks/useAdminProviders";
import styles from "../AdminProviders.module.scss";

/** Khoi phai: bang doi tac (logo, ten, slug, loai, sua/xoa). */
export default function ProvidersTable({ s }: { s: AdminProvidersState }) {
  const T = C.table;

  return (
    <div className={styles.card}>
      {s.fetching ? (
        <div className={styles.row2}>
          <RefreshCw size={16} className={styles.spinner2} /> {T.loading}
        </div>
      ) : s.providers.length === 0 ? (
        <div className={styles.box6}>{T.empty}</div>
      ) : (
        <div className={styles.scroller}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.row3}>
                <th className={styles.headCell}>{T.columns.logo}</th>
                <th className={styles.headCell2}>{T.columns.name}</th>
                <th className={styles.headCell2}>{T.columns.slug}</th>
                <th className={styles.headCell2}>{T.columns.kind}</th>
                <th className={styles.headCell3}>{T.columns.actions}</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {s.providers.map((p) => {
                const uni = p.type === "university";
                return (
                  <tr key={p._id} className={styles.row4}>
                    <td className={styles.headCell}>
                      <div className={styles.row5}>
                        <SafeImage
                          src={p.logo}
                          alt={p.name}
                          width={64}
                          height={40}
                          className={styles.box7}
                        />
                      </div>
                    </td>
                    <td className={styles.cell}>{p.name}</td>
                    <td className={styles.headCell2}>
                      <span className={styles.label4}>{p.slug}</span>
                    </td>
                    <td className={styles.headCell2}>
                      <span
                        className={`${styles.label7} ${uni ? styles.label5 : styles.label6}`}
                      >
                        {uni ? <School size={12} /> : <Building2 size={12} />}
                        {uni ? C.form.university : C.form.company}
                      </span>
                    </td>
                    <td className={styles.headCell3}>
                      <div className={styles.row6}>
                        <button
                          onClick={() => s.handleEdit(p)}
                          className={styles.button7}
                          title={T.edit}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => p._id && s.handleDelete(p._id)}
                          className={styles.button8}
                          title={T.delete}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
