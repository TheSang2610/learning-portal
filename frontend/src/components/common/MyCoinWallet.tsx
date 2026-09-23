"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coins, Plus } from "lucide-react";
import { layViCuaToi, type ThongTinVi } from "@/src/services/coin.api";
import { SU_KIEN_DOI_COIN } from "./CoinBalance";
import DongGiaoDichCoin from "./CoinTransactionRow";

import styles from "./MyCoinWallet.module.scss";
// Vi coin day du cua hoc vien: so du, tong da nap, va so nhat ky.
//
// Khac SoDuCoin o thanh dieu huong (chi mot con so): day la cho tra loi cau
// "vi sao toi con ngan nay" - moi lan coin ra vao deu co mot dong.

const dinhDang = (n: number) => n.toLocaleString("vi-VN");

export default function ViCoinCuaToi() {
  const [vi, setVi] = useState<ThongTinVi | null>(null);
  const [dangTai, setDangTai] = useState(true);

  useEffect(() => {
    let conGan = true;

    const doc = async () => {
      try {
        const d = await layViCuaToi();
        if (conGan) setVi(d);
      } catch {
        // Chua dang nhap hoac may chu loi -> an ca khoi. Vi la thong tin phu
        // tren trang ho so, khong dang lam hong ca trang chi vi mot loi goi.
        if (conGan) setVi(null);
      } finally {
        if (conGan) setDangTai(false);
      }
    };

    doc();
    window.addEventListener(SU_KIEN_DOI_COIN, doc);
    return () => {
      conGan = false;
      window.removeEventListener(SU_KIEN_DOI_COIN, doc);
    };
  }, []);

  if (dangTai) {
    return (
      <div className={styles.card}>
        <div className={styles.box} />
        <div className={styles.box2} />
      </div>
    );
  }

  if (!vi) return null;

  return (
    <div className={styles.card2}>
      <div className={styles.box3}>
        <div className={styles.row}>
          <h2 className={styles.heading}>
            <Coins size={18} className={styles.box4} />
            Ví coin
          </h2>
          {/* Truoc day vi chi doc duoc, muon co coin phai nho quan tri bo vao
              tay - hoc vien khong co cho nao tu nap. */}
          <Link href="/user/coin" className={styles.box5}>
            <Plus size={14} /> Nạp coin
          </Link>
        </div>

        <div className={styles.grid}>
          <div className={styles.card3}>
            <p className={styles.text}>Số dư</p>
            <p className={styles.text2}>
              {dinhDang(vi.soDuCoin)} <span className={styles.label}>coin</span>
            </p>
            <p className={styles.text3}>≈ {dinhDang(vi.soDuQuyDoi)}đ</p>
          </div>

          <div className={styles.card4}>
            <p className={styles.text4}>Tổng đã nạp</p>
            <p className={styles.text2}>{dinhDang(vi.tongDaNap)}</p>
            <p className={styles.text5}>coin từ trước tới nay</p>
          </div>

          <div className={styles.card4}>
            <p className={styles.text4}>Giao dịch</p>
            <p className={styles.text2}>{dinhDang(vi.soGiaoDich)}</p>
            <p className={styles.text5}>lần coin ra vào ví</p>
          </div>
        </div>

        <p className={styles.text6}>
          1 coin = 1.000đ. Muốn nạp thêm, liên hệ quản trị viên.
        </p>
      </div>

      {vi.nhatKy.length === 0 ? (
        <p className={styles.text7}>Ví chưa có giao dịch nào.</p>
      ) : (
        <div className={styles.box6}>
          {vi.nhatKy.map((g) => (
            // hienNguoiTao tat: hoc vien khong can biet ten nhan vien noi bo
            // nao da bam nut.
            <DongGiaoDichCoin key={g._id} giaoDich={g} />
          ))}
        </div>
      )}
    </div>
  );
}
