"use client";

import { useState } from "react";
import { BadgePercent, Check, X } from "lucide-react";

import { kiemMaGiamGia } from "@/src/services/maGiamGia";

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
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3">
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
          id="ma-giam-gia"
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
