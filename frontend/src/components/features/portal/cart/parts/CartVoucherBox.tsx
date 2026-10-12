"use client";

import { useState } from "react";
import { BadgePercent, Check, X } from "lucide-react";

import { checkVoucher } from "@/src/services/voucher";

import styles from "./CartVoucherBox.module.scss";
/**
 * O nhap ma giam gia cho GIO HANG.
 *
 * VI SAO KHONG DUNG LAI VoucherInput: cai do kiem ma cho DUNG MOT khoa hoc.
 * O gio hang co nhieu khoa, va cau hoi "ma nay giam duoc bao nhieu" chi tra loi
 * duoc sau khi hoi may chu cho tung khoa mot - vi moi ma co the gioi han theo
 * danh sach khoa (apDungKhoa), co don toi thieu rieng, va giam theo phan tram
 * thi so tien giam phu thuoc gia tung khoa.
 *
 * VI SAO CHI AP CHO MOT KHOA: mot ma chi dung duoc MOT LAN cho moi nguoi - do
 * la rang buoc do CSDL giu (index duy nhat {ma, user} trong LuotDungMa), khong
 * phai quy uoc o giao dien. Rai mot ma len ba khoa thi khoa thu hai va thu ba
 * chac chan bi tu choi luc tru tien, sau khi nguoi dung da thay so tien giam
 * tren man hinh. Nen o day chon SAN mot khoa - khoa duoc giam nhieu nhat - va
 * noi ro ten khoa do ra, thay vi de nguoi dung tu phat hien khi thanh toan.
 */

export interface VoucherItem {
  courseId: string;
  title: string;
}

interface Props {
  mon: VoucherItem[];
  /**
   * `ma` rong nghia la go ma ra.
   *
   * `courseId` la khoa duy nhat duoc ap ma - trang cha PHAI gui ma kem DUNG
   * khoa nay khi tru tien. So tien giam chi de HIEN, may chu tinh lai tu dau.
   */
  onVoucherChange: (code: string, courseId: string, discountAmount: number) => void;
}

interface Applied {
  ma: string;
  courseId: string;
  tenKhoa: string;
  giam: number;
}

export default function CartVoucherBox({ mon: subjectItem, onVoucherChange }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState("");
  const [applied, setApplied] = useState<Applied | null>(null);

  const check = async () => {
    const code = text.trim().toUpperCase();
    if (!code || checking || subjectItem.length === 0) return;

    setChecking(true);
    setErr("");

    // allSettled chu khong all: mot khoa bi loi mang khong duoc lam hong ca
    // lan kiem - cac khoa con lai van co the an ma.
    //
    // Chay song song o day AN TOAN vi /ma-giam-gia/kiem chi doc, khong ghi gi
    // va khong dat cho luot dung. Cho tru tien thi nguoc lai - xem ghi chu o
    // ham thanh toan trong trang gio hang.
    const result = await Promise.allSettled(
      subjectItem.map((m) => checkVoucher(code, m.courseId)),
    );

    const allowed: Applied[] = [];
    const rejectMessage: string[] = [];

    result.forEach((outcome, i) => {
      if (outcome.status !== "fulfilled") return;

      if (outcome.value.ok) {
        allowed.push({
          ma: code,
          courseId: subjectItem[i].courseId,
          tenKhoa: subjectItem[i].title,
          giam: outcome.value.soTienGiam,
        });
      } else if (outcome.value.cau) {
        rejectMessage.push(outcome.value.cau);
      }
    });

    setChecking(false);

    if (allowed.length > 0) {
      // Giam nhieu nhat - dung ve phia nguoi mua. Neu bang nhau thi lay khoa
      // dau tien, thu tu la thu tu trong gio.
      const tot = allowed.reduce((a, b) => (b.giam > a.giam ? b : a));
      setApplied(tot);
      onVoucherChange(tot.ma, tot.courseId, tot.giam);
      return;
    }

    setApplied(null);
    onVoucherChange("", "", 0);

    if (rejectMessage.length === 0) {
      setErr("Không kiểm tra được mã, thử lại giúp mình.");
      return;
    }

    // Moi khoa co the bi tu choi vi mot ly do khac nhau ("khóa này miễn phí",
    // "chưa đủ đơn tối thiểu"). Chi khi TAT CA cung mot ly do thi noi thang ly
    // do do; khac nhau thi noi that la khong khoa nao dung duoc, kem mot ly do
    // lam vi du - gop dai ra thi khong ai doc.
    const secret = [...new Set(rejectMessage)];
    setErr(
      secret.length === 1
        ? secret[0]
        : `Mã này không dùng được cho khóa nào trong giỏ. Ví dụ: ${secret[0]}`,
    );
  };

  const go = () => {
    setApplied(null);
    setText("");
    setErr("");
    onVoucherChange("", "", 0);
  };

  if (applied) {
    return (
      <div className={styles.card}>
        <div className={styles.row}>
          <div className={styles.row2}>
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

        {/* Noi ro ma an vao khoa nao. Bo dong nay thi nguoi dung tuong ca gio
            duoc giam, va con so tong o duoi se lam ho ngac nhien. */}
        {subjectItem.length > 1 && (
          <p className={styles.text3}>
            Áp cho khóa <span className={styles.label}>{applied.tenKhoa}</span>. Mỗi mã
            chỉ dùng được một lần nên không cộng dồn cho các khóa còn lại.
          </p>
        )}
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
      <div className={styles.row3}>
        <input
          id="ma-giam-gia-gio-hang"
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

      {err && <p className={styles.text4}>{err}</p>}
    </div>
  );
}
