"use client";

import { useState } from "react";
import { BadgePercent, Check, X } from "lucide-react";

import { kiemMaGiamGia } from "@/src/services/voucher";

import styles from "./VoucherInput.module.scss";
interface Props {
  courseId: string;
  /**
   * Bao cho trang cha biet ma nao dang duoc ap va giam bao nhieu.
   *
   * `ma` rong nghia la go ma ra. Trang cha PHAI gui `ma` nay kem theo khi dat
   * don / tru coin - so tien giam o day chi de HIEN, may chu tinh lai tu dau.
   */
  onDoiMa: (ma: string, soTienGiam: number) => void;
}

export default function ONhapMaGiamGia({ courseId, onDoiMa }: Props) {
  const [mo, setMo] = useState(false);
  const [chu, setChu] = useState("");
  const [dangKiem, setDangKiem] = useState(false);
  const [loi, setLoi] = useState("");
  const [daAp, setDaAp] = useState<{ ma: string; giam: number } | null>(null);

  const kiem = async () => {
    const ma = chu.trim().toUpperCase();
    if (!ma || dangKiem) return;

    setDangKiem(true);
    setLoi("");

    try {
      const kq = await kiemMaGiamGia(ma, courseId);

      // May chu tra 200 ke ca khi ma khong dung duoc: "ma khong hop le" la mot
      // ket qua, khong phai loi. Nen khong bat ngoai le o day ma doc `ok`.
      if (!kq.ok) {
        setLoi(kq.cau || "Mã giảm giá không dùng được.");
        setDaAp(null);
        onDoiMa("", 0);
        return;
      }

      setDaAp({ ma, giam: kq.soTienGiam });
      onDoiMa(ma, kq.soTienGiam);
    } catch (e) {
      // Cho nay moi la loi that (mat mang, may chu 500).
      setLoi(e instanceof Error ? e.message : "Không kiểm tra được mã.");
    } finally {
      setDangKiem(false);
    }
  };

  const go = () => {
    setDaAp(null);
    setChu("");
    setLoi("");
    onDoiMa("", 0);
  };

  if (daAp) {
    return (
      <div className={styles.card}>
        <div className={styles.row}>
          <Check size={16} className={styles.box} />
          <div className={styles.box2}>
            <p className={styles.text}>{daAp.ma}</p>
            <p className={styles.text2}>Giảm {daAp.giam.toLocaleString("vi-VN")}đ</p>
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

  if (!mo) {
    return (
      <button type="button" onClick={() => setMo(true)} className={styles.button2}>
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
          value={chu}
          onChange={(e) => setChu(e.target.value.toUpperCase().slice(0, 32))}
          onKeyDown={(e) => {
            if (e.key === "Enter") kiem();
          }}
          placeholder="Nhập mã giảm giá"
          className={styles.input}
        />
        <button
          type="button"
          onClick={kiem}
          disabled={!chu.trim() || dangKiem}
          className={styles.button3}
        >
          {dangKiem ? "Đang kiểm…" : "Áp dụng"}
        </button>
      </div>

      {loi && <p className={styles.text3}>{loi}</p>}
    </div>
  );
}
