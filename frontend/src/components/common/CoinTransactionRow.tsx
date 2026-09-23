import { Coins, Gift, ArrowDownCircle, ArrowUpCircle, ShoppingCart } from "lucide-react";
import type { GiaoDichCoin } from "@/src/services/coin.api";

import styles from "./CoinTransactionRow.module.scss";
// Mot dong trong so nhat ky coin.
//
// Dung chung cho trang quan tri (/admin/coin) va trang ho so hoc vien. Hai cho
// nay ke cung mot cau chuyen, nen phai ke giong nhau: neu moi ben tu ve, se co
// luc quan tri thay "Thu hoi" con hoc vien thay "Tru coin" cho cung mot dong,
// va khong ai biet ben nao dung.

// Mau nen + mau chu cua o bieu tuong nam trong file .module.scss, khong phai
// mot cap chuoi lop dat thang o day. Hai truong `mau`/`nen` cu giu ten lop
// Tailwind; go Tailwind xong chung thanh chuoi chet, o bieu tuong mat sach mau
// ma khong bao loi gi.
const KIEU: Record<
  GiaoDichCoin["loai"],
  { chu: string; lop: string; Icon: typeof Coins }
> = {
  nap: {
    chu: "Nạp coin",
    lop: styles.nap,
    Icon: ArrowDownCircle,
  },
  thuHoi: {
    chu: "Thu hồi",
    lop: styles.thuHoi,
    Icon: ArrowUpCircle,
  },
  mua: {
    chu: "Mua khoá",
    lop: styles.mua,
    Icon: ShoppingCart,
  },
  tangKhoa: {
    chu: "Được tặng khoá",
    lop: styles.tangKhoa,
    Icon: Gift,
  },
};

const dinhDang = (n: number) => n.toLocaleString("vi-VN");

interface Props {
  giaoDich: GiaoDichCoin;
  /**
   * Hien ten quan tri da thuc hien.
   *
   * Bat o trang quan tri (can biet DONG NGHIEP nao vua nap), tat o trang hoc
   * vien - ho khong can biet ten nhan vien noi bo, va do cung khong phai thong
   * tin nen phat tan ra ngoai.
   */
  hienNguoiTao?: boolean;
}

export default function DongGiaoDichCoin({ giaoDich: g, hienNguoiTao }: Props) {
  const k = KIEU[g.loai];

  return (
    <div className={styles.row}>
      <span className={`${styles.grid} ${k.lop}`}>
        <k.Icon size={16} />
      </span>

      <div className={styles.box}>
        <p className={styles.text}>
          {k.chu}
          {g.khoa && <span className={styles.label}> · {g.khoa.title}</span>}
        </p>
        <p className={styles.text2}>
          {new Date(g.createdAt).toLocaleString("vi-VN")}
          {hienNguoiTao && g.nguoiTao && <> · bởi {g.nguoiTao.name}</>}
          {g.ghiChu && <> · {g.ghiChu}</>}
        </p>
      </div>

      <div className={styles.box2}>
        {/* 'tangKhoa' co soCoin = 0 - khong hien so, vi "+0" hay "-0" deu vo
            nghia va lam nguoi doc tuong minh vua mat gi do. */}
        {g.soCoin !== 0 && (
          <p className={`${styles.text6} ${g.soCoin > 0 ? styles.text3 : styles.text4}`}>
            {g.soCoin > 0 ? "+" : ""}
            {dinhDang(g.soCoin)}
          </p>
        )}
        <p className={styles.text5}>còn {dinhDang(g.soDuSau)}</p>
      </div>
    </div>
  );
}
