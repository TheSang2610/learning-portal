import { AUTH_CALLBACK } from "@/src/constants/portal/auth-callback-page";

import styles from "../GoogleCallback.module.scss";

/** The "Google sign-in" + mot dong trang thai. Dung cho ca luc cho lan luc xong. */
export default function CallbackCard({ status }: { status: string }) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{AUTH_CALLBACK.title}</h1>
        <p className={styles.text}>{status}</p>
      </div>
    </div>
  );
}
