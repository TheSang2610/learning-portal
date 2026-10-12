import { PAYMENT as P } from "@/src/constants/portal/payment-page";
import { clockFormat } from "@/src/lib/time";

import styles from "../Payment.module.scss";

interface HoldClockProps {
  conLai: number;
  reported: boolean;
}

/** Dong ho giu don o dau trang. */
export default function HoldClock({ conLai: remaining, reported }: HoldClockProps) {
  const T = P.clock;
  const timeUp = remaining <= 0;

  return (
    <div
      aria-live="polite"
      className={`${styles.row5} ${timeUp ? styles.box5 : styles.box6}`}
    >
      {timeUp ? (
        // Hai cau khac han nhau tuy da bao chuyen khoan hay chua.
        //
        // Chua bao: phai CAN ho lai, dung chuyen theo ma nay nua - tien vao
        // mot ma da chet thi quan tri kho doi chieu, va he thong khong tu mo
        // khoa duoc.
        // Da bao: ho da chuyen roi, noi "dung chuyen" luc nay la vo nghia va
        // chi lam ho hoang. Luc nay phai tran an.
        reported ? (
          <span>{T.reportedExpired}</span>
        ) : (
          <span>
            <strong>{T.expiredStrong}</strong>
            {T.expiredRest}
          </span>
        )
      ) : (
        <span>
          {T.holding}
          <strong className={styles.strong}>{clockFormat(remaining)}</strong>
        </span>
      )}
    </div>
  );
}
