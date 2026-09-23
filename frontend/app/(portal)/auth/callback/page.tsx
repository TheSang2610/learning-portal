import { Suspense } from "react";
import GoogleCallbackInner from "./CallbackClient";

import styles from "./page.module.scss";
// Tach server component + Suspense cho phan doc useSearchParams(),
// de trang nay van prerender tinh duoc.
export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <div className={styles.card}>
            <h1 className={styles.title}>Google sign-in</h1>
            <p className={styles.text}>Loading Google authentication...</p>
          </div>
        </div>
      }
    >
      <GoogleCallbackInner />
    </Suspense>
  );
}
