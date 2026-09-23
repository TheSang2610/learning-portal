"use client";

import { useEffect, useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { layViCuaToi, muaBangCoin, giaRaCoin } from "@/src/services/coin.api";
import { baoCoinDaDoi } from "./CoinBalance";
import { getErrorMessage } from "@/src/services/apiHelper";

import styles from "./BuyWithCoinButton.module.scss";
// Nut "mua bang coin" tren trang khoa hoc.
//
// Chay SONG SONG voi nut chuyen khoan VietQR chu khong thay the: ai co du coin
// thi mo khoa ngay, ai khong thi van dat don va chuyen khoan nhu cu.

interface Props {
  courseId: string;
  /** Gia theo DONG, lay thang tu khoa hoc. Quy doi ra coin lam o day. */
  gia: number;
  /** Goi sau khi mua xong, de trang cha cap nhat trang thai ghi danh. */
  khiMuaXong: () => void;
  /**
   * Ma giam gia dang duoc ap, rong neu khong co.
   *
   * May chu TINH LAI so tien giam tu dau khi nhan ma nay - con so hien o giao
   * dien chi de nguoi dung xem truoc. Khong bao gio gui so tien giam len.
   */
  maGiamGia?: string;
  /** So coin duoc giam, chi de HIEN. May chu tu tinh lai. */
  soCoinGiam?: number;
}

export default function NutMuaBangCoin({
  courseId,
  gia,
  khiMuaXong,
  maGiamGia,
  soCoinGiam = 0,
}: Props) {
  const [soDu, setSoDu] = useState<number | null>(null);
  const [dangMua, setDangMua] = useState(false);
  const [loi, setLoi] = useState("");

  // Gia sau khi tru ma giam gia. Max(0) vi ma giam 100% la hop le - luc do
  // khong tru coin nao nhung van phai hien nut de nguoi dung bam.
  const giaCoin = Math.max(0, giaRaCoin(gia) - soCoinGiam);

  useEffect(() => {
    let conGan = true;
    layViCuaToi()
      .then((vi) => conGan && setSoDu(vi.soDuCoin))
      .catch(() => conGan && setSoDu(null));
    return () => {
      conGan = false;
    };
  }, []);

  // Chua doc duoc vi (chua dang nhap, hoac may chu loi) thi khong hien gi ca.
  // Hien mot nut mua ma bam vao chi ra loi thi te hon la khong hien.
  // giaRaCoin(gia) chu khong phai giaCoin: khoa mien phi thi khong hien nut
  // nay, nhung khoa co phi duoc ma giam ve 0 thi VAN phai hien - do moi la
  // luc nguoi dung can bam nhat.
  if (soDu === null || giaRaCoin(gia) <= 0) return null;

  const du = soDu >= giaCoin;
  const thieu = giaCoin - soDu;

  const mua = async () => {
    setDangMua(true);
    setLoi("");
    try {
      await muaBangCoin(courseId, maGiamGia || undefined);
      baoCoinDaDoi();
      khiMuaXong();
    } catch (e) {
      setLoi(getErrorMessage(e, "Không mua được bằng coin"));
      setDangMua(false);
    }
  };

  return (
    <div className={styles.stack}>
      <button onClick={mua} disabled={!du || dangMua} className={styles.button}>
        {dangMua ? (
          <>
            <Loader2 size={15} className={styles.spinner} /> Đang mở khoá…
          </>
        ) : (
          <>
            <Coins size={15} />
            Mua bằng {giaCoin.toLocaleString("vi-VN")} coin
          </>
        )}
      </button>

      <p className={styles.text}>
        {du ? (
          <>
            Ví của bạn: <b className={styles.box}>{soDu.toLocaleString("vi-VN")}</b> coin
          </>
        ) : (
          <>
            Ví có {soDu.toLocaleString("vi-VN")} coin — còn thiếu{" "}
            <b className={styles.box2}>{thieu.toLocaleString("vi-VN")}</b> coin
          </>
        )}
      </p>

      {loi && <p className={styles.text2}>{loi}</p>}
    </div>
  );
}
