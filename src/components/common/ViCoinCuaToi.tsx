"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { layViCuaToi, type ThongTinVi } from "@/src/services/coin.api";
import { SU_KIEN_DOI_COIN } from "./SoDuCoin";
import DongGiaoDichCoin from "./DongGiaoDichCoin";

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
      <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="mt-3 h-8 w-40 rounded bg-slate-200" />
      </div>
    );
  }

  if (!vi) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Coins size={18} className="text-amber-500" />
          Ví coin
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-[11px] font-semibold tracking-wide text-amber-700 uppercase">
              Số dư
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
              {dinhDang(vi.soDuCoin)}{" "}
              <span className="text-base font-semibold text-slate-500">coin</span>
            </p>
            <p className="text-xs text-slate-500 tabular-nums">
              ≈ {dinhDang(vi.soDuQuyDoi)}đ
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Tổng đã nạp
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
              {dinhDang(vi.tongDaNap)}
            </p>
            <p className="text-xs text-slate-500">coin từ trước tới nay</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Giao dịch
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
              {dinhDang(vi.soGiaoDich)}
            </p>
            <p className="text-xs text-slate-500">lần coin ra vào ví</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-slate-500">
          1 coin = 1.000đ. Muốn nạp thêm, liên hệ quản trị viên.
        </p>
      </div>

      {vi.nhatKy.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-slate-400">
          Ví chưa có giao dịch nào.
        </p>
      ) : (
        <div className="divide-y divide-slate-50">
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
