"use client";

import { ShoppingCart } from "lucide-react";

import { CART } from "@/src/constants/portal/cart-page";

import { useCart } from "./hooks/useCart";
import CartItem from "./parts/CartItem";
import CartSummary from "./parts/CartSummary";
import EmptyCart from "./parts/EmptyCart";
import styles from "./Cart.module.scss";

export default function Cart() {
  const s = useCart();

  if (s.soMon === 0) return <EmptyCart />;

  return (
    <div className={styles.page2}>
      <div className={styles.container2}>
        <div className={styles.row2}>
          <ShoppingCart size={22} className={styles.box3} />
          <h1 className={styles.title2}>{CART.title(s.soMon)}</h1>
        </div>

        <div className={styles.grid}>
          <div className={styles.col}>
            {s.gio.map((m) => (
              <CartItem
                key={m.courseId}
                title={m.title}
                thumbnail={m.thumbnail}
                gia={m.gia}
                onRemove={() => s.removeItem(m.courseId)}
              />
            ))}

            <button type="button" onClick={s.clearAll} className={styles.button2}>
              {CART.clearAll}
            </button>
          </div>

          <CartSummary s={s} />
        </div>
      </div>
    </div>
  );
}
