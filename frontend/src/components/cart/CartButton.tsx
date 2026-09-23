"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useGioHang } from "@/src/hooks/cart";

import styles from "./CartButton.module.scss";
/** Bieu tuong gio hang trong header, kem so mon. */
export default function NutGioHang() {
  const { soMon } = useGioHang();

  return (
    <Link
      href="/cart"
      aria-label={soMon > 0 ? `Giỏ hàng, ${soMon} khóa học` : "Giỏ hàng"}
      // h-11 w-11: nguong cham toi thieu 44px, giong chuong thong bao ben canh.
      className={styles.row}
    >
      <ShoppingCart size={20} />

      {soMon > 0 && <span className={styles.floating}>{soMon > 9 ? "9+" : soMon}</span>}
    </Link>
  );
}
