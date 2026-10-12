import { ADMIN_VOUCHERS as C } from "@/src/constants/admin/vouchers-page";
import type { VoucherPayload } from "@/src/services/voucher";

import type { AdminVouchersState } from "../hooks/useAdminVouchers";
import styles from "../AdminVouchers.module.scss";

/** Bieu mau tao / sua ma giam gia. */
export default function VoucherForm({ s }: { s: AdminVouchersState }) {
  const F = C.form;
  const { than: body, setBody } = s;
  const percent = body.loai === "phanTram";

  return (
    <div className={styles.card}>
      <h2 className={styles.heading}>{s.editId ? F.editTitle : F.createTitle}</h2>

      <div className={styles.grid}>
        {!s.editId && (
          <label className={styles.fieldLabel}>
            <span className={styles.label}>{F.code}</span>
            <input
              id="mgg-ma"
              value={body.ma ?? ""}
              onChange={(e) =>
                setBody({
                  ...body,
                  ma: e.target.value.toUpperCase().slice(0, C.codeMaxLength),
                })
              }
              placeholder={F.codePlaceholder}
              className={styles.input}
            />
          </label>
        )}

        <label className={styles.fieldLabel}>
          <span className={styles.label}>{F.description}</span>
          <input
            id="mgg-mota"
            value={body.moTa ?? ""}
            onChange={(e) => setBody({ ...body, moTa: e.target.value })}
            placeholder={F.descriptionPlaceholder}
            className={styles.input2}
          />
        </label>

        <label className={styles.fieldLabel}>
          <span className={styles.label}>{F.kind}</span>
          <select
            id="mgg-loai"
            value={body.loai}
            onChange={(e) =>
              setBody({
                ...body,
                loai: e.target.value as VoucherPayload["loai"],
                // Doi sang so tien thi tran giam khong con nghia - xoa luon
                // de khong luu mot gia tri vo nghia vao CSDL.
                giamToiDa: e.target.value === "phanTram" ? body.giamToiDa : null,
              })
            }
            className={styles.input2}
          >
            {F.kinds.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.fieldLabel}>
          <span className={styles.label}>{F.value(percent)}</span>
          <input
            id="mgg-giatri"
            type="number"
            min={percent ? 1 : 0}
            max={percent ? 100 : undefined}
            value={body.giaTri}
            onChange={(e) => setBody({ ...body, giaTri: Number(e.target.value) })}
            className={styles.input2}
          />
        </label>

        {/* Tran giam chi co nghia voi ma phan tram. Hien no o ma so tien la
            mot o khong bao gio duoc dung toi - nguoi go se phan van. */}
        {percent && (
          <label className={styles.fieldLabel}>
            <span className={styles.label}>{F.cap}</span>
            <input
              id="mgg-tran"
              type="number"
              min={0}
              value={body.giamToiDa ?? ""}
              onChange={(e) =>
                setBody({
                  ...body,
                  giamToiDa: e.target.value ? Number(e.target.value) : null,
                })
              }
              className={styles.input2}
            />
          </label>
        )}

        <label className={styles.fieldLabel}>
          <span className={styles.label}>{F.minOrder}</span>
          <input
            id="mgg-toithieu"
            type="number"
            min={0}
            value={body.donToiThieu ?? 0}
            onChange={(e) => setBody({ ...body, donToiThieu: Number(e.target.value) })}
            className={styles.input2}
          />
        </label>

        <label className={styles.fieldLabel}>
          <span className={styles.label}>{F.start}</span>
          <input
            id="mgg-batdau"
            type="date"
            value={(body.batDau ?? "").slice(0, 10)}
            onChange={(e) => setBody({ ...body, batDau: e.target.value })}
            className={styles.input2}
          />
        </label>

        <label className={styles.fieldLabel}>
          <span className={styles.label}>{F.end}</span>
          <input
            id="mgg-ketthuc"
            type="date"
            value={(body.ketThuc ?? "").slice(0, 10)}
            onChange={(e) => setBody({ ...body, ketThuc: e.target.value })}
            className={styles.input2}
          />
        </label>

        <label className={styles.fieldLabel}>
          <span className={styles.label}>{F.totalUses}</span>
          <input
            id="mgg-soluot"
            type="number"
            min={1}
            value={body.soLuotToiDa ?? ""}
            onChange={(e) =>
              setBody({
                ...body,
                soLuotToiDa: e.target.value ? Number(e.target.value) : null,
              })
            }
            className={styles.input2}
          />
        </label>

        <label className={styles.fieldLabel2}>
          <input
            id="mgg-motlan"
            type="checkbox"
            checked={body.moiNguoiMotLan !== false}
            onChange={(e) => setBody({ ...body, moiNguoiMotLan: e.target.checked })}
            className={styles.input3}
          />
          <span className={styles.label2}>
            {F.oncePerUser}
            <span className={styles.label3}>{F.oncePerUserHint}</span>
          </span>
        </label>
      </div>

      <div className={styles.row3}>
        <button type="button" onClick={s.closeForm} className={styles.button2}>
          {F.cancel}
        </button>
        <button
          type="button"
          onClick={s.luu}
          disabled={s.saving || (!s.editId && !body.ma?.trim())}
          className={styles.button3}
        >
          {s.saving ? F.saving : F.save}
        </button>
      </div>
    </div>
  );
}
