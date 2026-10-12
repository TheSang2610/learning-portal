import Image from "next/image";
import { Trash2 } from "lucide-react";

import { CART } from "@/src/constants/portal/cart-page";

import styles from "../Cart.module.scss";

interface CartItemProps {
  title: string;
  thumbnail?: string | null;
  gia: number;
  onRemove: () => void;
}

/** Mot khoa trong gio: anh, gia va nut bo khoi gio. */
export default function CartItem({
  title,
  thumbnail,
  gia: price,
  onRemove,
}: CartItemProps) {
  const I = CART.item;

  return (
    <article className={styles.article}>
      <div className={styles.box4}>
        {thumbnail && (
          <Image src={thumbnail} alt={title} fill sizes="112px" className={styles.box5} />
        )}
      </div>

      <div className={styles.box6}>
        <h2 className={styles.heading}>{title}</h2>
        <p className={styles.text2}>{price.toLocaleString("vi-VN")}đ</p>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={I.removeAria(title)}
        className={styles.button}
      >
        <Trash2 size={16} />
      </button>
    </article>
  );
}
