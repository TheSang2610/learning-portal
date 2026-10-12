import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { CART } from "@/src/constants/portal/cart-page";

import styles from "../Cart.module.scss";

/** Gio trong: chua them khoa nao. */
export default function EmptyCart() {
  const E = CART.empty;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <ShoppingCart size={36} className={styles.box} />
        <h1 className={styles.title}>{E.title}</h1>
        <p className={styles.text}>{E.nothing}</p>

        <div className={styles.row}>
          <Link href={CART.coursesHref} className={styles.box2}>
            {E.findCourses}
          </Link>
        </div>
      </div>
    </div>
  );
}
