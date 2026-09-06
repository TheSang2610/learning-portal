"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import { layViCuaToi } from "@/src/services/coin.api";

// So du coin cua chinh nguoi dang dang nhap.
//
// Dat thanh component rieng vi no xuat hien o hai cho khac hinh dang: dong nho
// duoi ten tren thanh dieu huong, va o dam o trang ho so. Gom vao mot cho de
// khi doi cach hien thi khong phai nho con cho nao nua.
//
// Tu goi may chu chu KHONG doc tu localStorage: so du doi moi lan mua khoa hay
// moi lan quan tri nap, ma localStorage chi duoc ghi luc dang nhap - lay o do
// se hien mot con so cu ma khong ai biet la cu.

/**
 * Su kien bao "so du vua doi, doc lai di".
 *
 * Dung window event thay vi truyen ham xuong: cho lam thay doi so du (nut mua
 * o trang khoa hoc) va cho hien thi (thanh dieu huong) nam o hai nhanh cay
 * hoan toan khac nhau, khong co cha chung nao gan de dat state.
 */
export const SU_KIEN_DOI_COIN = "coinDaDoi";

export const baoCoinDaDoi = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SU_KIEN_DOI_COIN));
  }
};

interface Props {
  /** "dong" cho thanh dieu huong, "the" cho trang ho so. */
  kieu?: "dong" | "the";
  className?: string;
}

export default function SoDuCoin({ kieu = "dong", className = "" }: Props) {
  const [soDu, setSoDu] = useState<number | null>(null);
  const [tongDaNap, setTongDaNap] = useState(0);

  useEffect(() => {
    let conGan = true;

    const doc = async () => {
      try {
        const vi = await layViCuaToi();
        if (!conGan) return;
        setSoDu(vi.soDuCoin);
        setTongDaNap(vi.tongDaNap);
      } catch {
        // Chua dang nhap hoac may chu loi -> khong hien gi ca.
        // Khong bao loi o day: day la thong tin phu, khong dang lam hong ca
        // thanh dieu huong chi vi mot loi goi that bai.
        if (conGan) setSoDu(null);
      }
    };

    doc();
    window.addEventListener(SU_KIEN_DOI_COIN, doc);
    return () => {
      conGan = false;
      window.removeEventListener(SU_KIEN_DOI_COIN, doc);
    };
  }, []);

  if (soDu === null) return null;

  const so = soDu.toLocaleString("vi-VN");

  if (kieu === "the") {
    return (
      <div className={`rounded-2xl border border-amber-200 bg-amber-50 p-4 ${className}`}>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-amber-700 uppercase">
          <Coins size={13} /> Ví coin
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
          {so} <span className="text-base font-semibold text-slate-500">coin</span>
        </p>
        <p className="mt-0.5 text-xs text-slate-500 tabular-nums">
          ≈ {(soDu * 1000).toLocaleString("vi-VN")}đ · đã nạp tổng{" "}
          {tongDaNap.toLocaleString("vi-VN")} coin
        </p>
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold text-amber-600 tabular-nums ${className}`}
      title={`≈ ${(soDu * 1000).toLocaleString("vi-VN")}đ`}
    >
      <Coins size={12} />
      {so} coin
    </span>
  );
}
