"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useGioHang } from "@/src/hooks/gioHang";

/** Bieu tuong gio hang trong header, kem so mon. */
export default function NutGioHang() {
  const { soMon } = useGioHang();

  return (
    <Link
      href="/cart"
      aria-label={soMon > 0 ? `Giỏ hàng, ${soMon} khóa học` : "Giỏ hàng"}
      // h-11 w-11: nguong cham toi thieu 44px, giong chuong thong bao ben canh.
      className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 transition hover:bg-gray-100 hover:text-slate-900"
    >
      <ShoppingCart size={20} />

      {soMon > 0 && (
        <span className="absolute top-1.5 right-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white tabular-nums">
          {soMon > 9 ? "9+" : soMon}
        </span>
      )}
    </Link>
  );
}
