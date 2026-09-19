"use client";

import { useState } from "react";
import { BadgePercent, Check, X } from "lucide-react";

import { kiemMaGiamGia } from "@/src/services/maGiamGia";

/**
 * O nhap ma giam gia cho GIO HANG.
 *
 * VI SAO KHONG DUNG LAI ONhapMaGiamGia: cai do kiem ma cho DUNG MOT khoa hoc.
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

export interface MonDeKiem {
  courseId: string;
  title: string;
}

interface Props {
  mon: MonDeKiem[];
  /**
   * `ma` rong nghia la go ma ra.
   *
   * `courseId` la khoa duy nhat duoc ap ma - trang cha PHAI gui ma kem DUNG
   * khoa nay khi tru tien. So tien giam chi de HIEN, may chu tinh lai tu dau.
   */
  onDoiMa: (ma: string, courseId: string, soTienGiam: number) => void;
}

interface DaAp {
  ma: string;
  courseId: string;
  tenKhoa: string;
  giam: number;
}

export default function OMaGiamGiaGioHang({ mon, onDoiMa }: Props) {
  const [mo, setMo] = useState(false);
  const [chu, setChu] = useState("");
  const [dangKiem, setDangKiem] = useState(false);
  const [loi, setLoi] = useState("");
  const [daAp, setDaAp] = useState<DaAp | null>(null);

  const kiem = async () => {
    const ma = chu.trim().toUpperCase();
    if (!ma || dangKiem || mon.length === 0) return;

    setDangKiem(true);
    setLoi("");

    // allSettled chu khong all: mot khoa bi loi mang khong duoc lam hong ca
    // lan kiem - cac khoa con lai van co the an ma.
    //
    // Chay song song o day AN TOAN vi /ma-giam-gia/kiem chi doc, khong ghi gi
    // va khong dat cho luot dung. Cho tru tien thi nguoc lai - xem ghi chu o
    // ham thanh toan trong trang gio hang.
    const ketQua = await Promise.allSettled(
      mon.map((m) => kiemMaGiamGia(ma, m.courseId)),
    );

    const duocPhep: DaAp[] = [];
    const cauTuChoi: string[] = [];

    ketQua.forEach((kq, i) => {
      if (kq.status !== "fulfilled") return;

      if (kq.value.ok) {
        duocPhep.push({
          ma,
          courseId: mon[i].courseId,
          tenKhoa: mon[i].title,
          giam: kq.value.soTienGiam,
        });
      } else if (kq.value.cau) {
        cauTuChoi.push(kq.value.cau);
      }
    });

    setDangKiem(false);

    if (duocPhep.length > 0) {
      // Giam nhieu nhat - dung ve phia nguoi mua. Neu bang nhau thi lay khoa
      // dau tien, thu tu la thu tu trong gio.
      const tot = duocPhep.reduce((a, b) => (b.giam > a.giam ? b : a));
      setDaAp(tot);
      onDoiMa(tot.ma, tot.courseId, tot.giam);
      return;
    }

    setDaAp(null);
    onDoiMa("", "", 0);

    if (cauTuChoi.length === 0) {
      setLoi("Không kiểm tra được mã, thử lại giúp mình.");
      return;
    }

    // Moi khoa co the bi tu choi vi mot ly do khac nhau ("khóa này miễn phí",
    // "chưa đủ đơn tối thiểu"). Chi khi TAT CA cung mot ly do thi noi thang ly
    // do do; khac nhau thi noi that la khong khoa nao dung duoc, kem mot ly do
    // lam vi du - gop dai ra thi khong ai doc.
    const rieng = [...new Set(cauTuChoi)];
    setLoi(
      rieng.length === 1
        ? rieng[0]
        : `Mã này không dùng được cho khóa nào trong giỏ. Ví dụ: ${rieng[0]}`,
    );
  };

  const go = () => {
    setDaAp(null);
    setChu("");
    setLoi("");
    onDoiMa("", "", 0);
  };

  if (daAp) {
    return (
      <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Check size={16} className="shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-emerald-800">{daAp.ma}</p>
              <p className="text-xs text-emerald-700 tabular-nums">
                Giảm {daAp.giam.toLocaleString("vi-VN")}đ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={go}
            aria-label="Gỡ mã giảm giá"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-emerald-700 transition hover:bg-emerald-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Noi ro ma an vao khoa nao. Bo dong nay thi nguoi dung tuong ca gio
            duoc giam, va con so tong o duoi se lam ho ngac nhien. */}
        {mon.length > 1 && (
          <p className="mt-2 border-t border-emerald-200 pt-2 text-xs leading-relaxed text-emerald-800">
            Áp cho khóa <span className="font-semibold">{daAp.tenKhoa}</span>. Mỗi mã chỉ
            dùng được một lần nên không cộng dồn cho các khóa còn lại.
          </p>
        )}
      </div>
    );
  }

  if (!mo) {
    return (
      <button
        type="button"
        onClick={() => setMo(true)}
        className="flex items-center gap-2 py-2 text-sm font-semibold text-blue-600 transition hover:underline"
      >
        <BadgePercent size={16} /> Tôi có mã giảm giá
      </button>
    );
  }

  return (
    <div>
      {/* flex-wrap: tren man hinh 390px o nhap va nut khong du cho nam cung
          hang, khong cho xuong dong thi nut bi bop con vai chuc pixel. */}
      <div className="flex flex-wrap gap-2">
        <input
          id="ma-giam-gia-gio-hang"
          value={chu}
          onChange={(e) => setChu(e.target.value.toUpperCase().slice(0, 32))}
          onKeyDown={(e) => {
            if (e.key === "Enter") kiem();
          }}
          placeholder="Nhập mã giảm giá"
          className="h-11 min-w-0 flex-1 rounded-xl border border-slate-300 px-4 text-sm tracking-wide uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={kiem}
          disabled={!chu.trim() || dangKiem}
          className="h-11 shrink-0 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {dangKiem ? "Đang kiểm…" : "Áp dụng"}
        </button>
      </div>

      {loi && <p className="mt-2 text-sm text-red-600">{loi}</p>}
    </div>
  );
}
