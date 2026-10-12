import Image from "next/image";

import CopyButton from "@/src/components/ui/CopyButton";
import { PAYMENT as P } from "@/src/constants/portal/payment-page";
import { formatMoney, type Order, type TransferInfo } from "@/src/services/order";

import styles from "../Payment.module.scss";

interface BankTransferProps {
  don: Order;
  ck: TransferInfo;
  copiedAll: boolean;
  onCopyAll: () => void;
}

/** Cot QR va cot thong tin chuyen khoan. */
export default function BankTransfer({
  don: order,
  ck,
  copiedAll,
  onCopyAll,
}: BankTransferProps) {
  const B = P.bank;

  return (
    <section className={styles.section3} aria-label={B.aria}>
      {/* Cột QR */}
      <div className={styles.col}>
        {ck.anhQR && (
          <Image
            src={ck.anhQR}
            alt={B.qrAlt(formatMoney(order.amount), order.code)}
            width={280}
            height={380}
            unoptimized
            referrerPolicy="no-referrer"
            className={styles.box8}
          />
        )}
        {ck.anhQR && (
          <a
            href={ck.anhQR}
            download={B.qrFile(order.code)}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {B.download}
          </a>
        )}
        <p className={styles.text6}>
          {B.mobileHint.a}
          <strong>{B.mobileHint.download}</strong>
          {B.mobileHint.b}
          <strong>{B.mobileHint.copy}</strong>
          {B.mobileHint.c}
        </p>
      </div>

      {/* Cột thông tin */}
      <div className={styles.col2}>
        <dl className={styles.box9}>
          <div className={styles.row4}>
            <dt className={styles.text3}>{B.bankName}</dt>
            <dd className={styles.box10}>{ck.nganHang}</dd>
          </div>
          <div className={styles.row4}>
            <dt className={styles.text3}>{B.accountNo}</dt>
            <dd className={styles.box10}>
              <span className={styles.label2}>{ck.soTaiKhoan}</span>
              <CopyButton
                value={ck.soTaiKhoan}
                what={B.copyAccount}
                className={styles.button}
              />
            </dd>
          </div>
          <div className={styles.row4}>
            <dt className={styles.text3}>{B.accountName}</dt>
            <dd className={styles.box11}>{ck.tenTaiKhoan}</dd>
          </div>
          <div className={styles.row4}>
            <dt className={styles.text3}>{B.amount}</dt>
            <dd className={styles.box10}>
              <span className={styles.strong}>{formatMoney(ck.soTien)}</span>
              <CopyButton
                value={String(ck.soTien)}
                what={B.copyAmount}
                className={styles.button}
              />
            </dd>
          </div>
          <div className={styles.row4}>
            <dt className={styles.text3}>{B.content}</dt>
            <dd className={styles.box12}>
              <span className={styles.label2}>{ck.noiDung}</span>
              <CopyButton
                value={ck.noiDung}
                what={B.copyContent}
                className={styles.button}
              />
            </dd>
          </div>
        </dl>

        <button type="button" onClick={onCopyAll} className={styles.button3}>
          {copiedAll ? B.copiedAll : B.copyAll}
        </button>
      </div>
    </section>
  );
}
