"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { useCartStore } from "@/src/hooks/cart";

import styles from "./CartButton.module.scss";
/** Bieu tuong gio hang trong header, kem so mon. */
export default function CartButton() {
  const { soMon: subjectCount } = useCartStore();

  return (
    <Link
      href="/cart"
      aria-label={subjectCount > 0 ? `Giỏ hàng, ${subjectCount} khóa học` : "Giỏ hàng"}
      // h-11 w-11: nguong cham toi thieu 44px, giong chuong thong bao ben canh.
      className={styles.row}
    >
      <ShoppingCart size={20} />

      {subjectCount > 0 && (
        <span className={styles.floating}>{subjectCount > 9 ? "9+" : subjectCount}</span>
      )}
    </Link>
  );
}
