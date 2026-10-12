"use client";

import { useState } from "react";
import { BadgePercent, Check, X } from "lucide-react";

import { checkVoucher } from "@/src/services/voucher";

import styles from "./VoucherInput.module.scss";
interface Props {
  courseId: string;
  /**
   * Bao cho trang cha biet ma nao dang duoc ap va giam bao nhieu.
   *
   * `ma` rong nghia la go ma ra. Trang cha PHAI gui `ma` nay kem theo khi dat
   * don - so tien giam o day chi de HIEN, may chu tinh lai tu dau.
   */
  onVoucherChange: (code: string, discountAmount: number) => void;
}

export default function VoucherInput({ courseId, onVoucherChange }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState("");
  const [applied, setApplied] = useState<{ ma: string; giam: number } | null>(null);

  const check = async () => {
    const code = text.trim().toUpperCase();
    if (!code || checking) return;

    setChecking(true);
    setErr("");

    try {
      const outcome = await checkVoucher(code, courseId);

      // May chu tra 200 ke ca khi ma khong dung duoc: "ma khong hop le" la mot
      // ket qua, khong phai loi. Nen khong bat ngoai le o day ma doc `ok`.
      if (!outcome.ok) {
        setErr(outcome.cau || "Mã giảm giá không dùng được.");
        setApplied(null);
        onVoucherChange("", 0);
        return;
      }

      setApplied({ ma: code, giam: outcome.soTienGiam });
      onVoucherChange(code, outcome.soTienGiam);
    } catch (e) {
      // Cho nay moi la loi that (mat mang, may chu 500).
      setErr(e instanceof Error ? e.message : "Không kiểm tra được mã.");
    } finally {
      setChecking(false);
    }
  };

  const go = () => {
    setApplied(null);
    setText("");
    setErr("");
    onVoucherChange("", 0);
  };

  if (applied) {
    return (
      <div className={styles.card}>
        <div className={styles.row}>
          <Check size={16} className={styles.box} />
          <div className={styles.box2}>
            <p className={styles.text}>{applied.ma}</p>
            <p className={styles.text2}>Giảm {applied.giam.toLocaleString("vi-VN")}đ</p>
          </div>
        </div>

        <button
          type="button"
          onClick={go}
          aria-label="Gỡ mã giảm giá"
          className={styles.button}
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={styles.button2}>
        <BadgePercent size={16} /> Tôi có mã giảm giá
      </button>
    );
  }

  return (
    <div>
      {/* flex-wrap: tren man hinh 390px o nhap va nut khong du cho nam cung
          hang, khong cho xuong dong thi nut bi bop con vai chuc pixel. */}
      <div className={styles.row2}>
        <input
          id="ma-giam-gia"
          value={text}
          onChange={(e) => setText(e.target.value.toUpperCase().slice(0, 32))}
          onKeyDown={(e) => {
            if (e.key === "Enter") check();
          }}
          placeholder="Nhập mã giảm giá"
          className={styles.input}
        />
        <button
          type="button"
          onClick={check}
          disabled={!text.trim() || checking}
          className={styles.button3}
        >
          {checking ? "Đang kiểm…" : "Áp dụng"}
        </button>
      </div>

      {err && <p className={styles.text3}>{err}</p>}
    </div>
  );
}
