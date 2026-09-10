import { Coins, Gift, ArrowDownCircle, ArrowUpCircle, ShoppingCart } from "lucide-react";
import type { GiaoDichCoin } from "@/src/services/coin.api";

// Mot dong trong so nhat ky coin.
//
// Dung chung cho trang quan tri (/admin/coin) va trang ho so hoc vien. Hai cho
// nay ke cung mot cau chuyen, nen phai ke giong nhau: neu moi ben tu ve, se co
// luc quan tri thay "Thu hoi" con hoc vien thay "Tru coin" cho cung mot dong,
// va khong ai biet ben nao dung.

const KIEU: Record<
  GiaoDichCoin["loai"],
  { chu: string; mau: string; nen: string; Icon: typeof Coins }
> = {
  nap: {
    chu: "Nạp coin",
    mau: "text-emerald-700",
    nen: "bg-emerald-50",
    Icon: ArrowDownCircle,
  },
  thuHoi: {
    chu: "Thu hồi",
    mau: "text-rose-700",
    nen: "bg-rose-50",
    Icon: ArrowUpCircle,
  },
  mua: {
    chu: "Mua khoá",
    mau: "text-blue-700",
    nen: "bg-blue-50",
    Icon: ShoppingCart,
  },
  tangKhoa: {
    chu: "Được tặng khoá",
    mau: "text-amber-700",
    nen: "bg-amber-50",
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
    <div className="flex items-start gap-3 px-5 py-3.5">
      <span
        className={`grid size-8 shrink-0 place-items-center rounded-lg ${k.nen} ${k.mau}`}
      >
        <k.Icon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">
          {k.chu}
          {g.khoa && (
            <span className="font-normal text-slate-500"> · {g.khoa.title}</span>
          )}
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {new Date(g.createdAt).toLocaleString("vi-VN")}
          {hienNguoiTao && g.nguoiTao && <> · bởi {g.nguoiTao.name}</>}
          {g.ghiChu && <> · {g.ghiChu}</>}
        </p>
      </div>

      <div className="shrink-0 text-right">
        {/* 'tangKhoa' co soCoin = 0 - khong hien so, vi "+0" hay "-0" deu vo
            nghia va lam nguoi doc tuong minh vua mat gi do. */}
        {g.soCoin !== 0 && (
          <p
            className={`text-sm font-bold tabular-nums ${
              g.soCoin > 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {g.soCoin > 0 ? "+" : ""}
            {dinhDang(g.soCoin)}
          </p>
        )}
        <p className="text-xs text-slate-400 tabular-nums">còn {dinhDang(g.soDuSau)}</p>
      </div>
    </div>
  );
}
