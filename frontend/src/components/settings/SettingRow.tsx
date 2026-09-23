"use client";

import { ChevronRight, X } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./SettingRow.module.scss";
// Hang cai dat kieu F8: nhan + gia tri hien tai + mui ten.
// Bam vao mo o sua ngay tai cho thay vi do het input ra man hinh -
// trang cai dat co ~10 truong, hien het cung luc thi rat kho doc.

interface Props {
  label: string;
  /** Gia tri hien thi khi hang dang dong */
  value?: string;
  /** Anh hien thay cho chu (dung cho avatar) */
  image?: string;
  /** Kieu ma/dinh danh: chu deu, nen xam */
  mono?: boolean;
  /** Mo ta phu duoi nhan */
  hint?: string;
  /** Hang chi de xem, khong co mui ten va khong bam duoc */
  readOnly?: boolean;
  /** Noi dung ben phai khi chi de xem (vd: huy hieu "Da lien ket") */
  trailing?: ReactNode;
  open?: boolean;
  onToggle?: () => void;
  /** Form hien ra khi hang duoc mo */
  children?: ReactNode;
}

const EMPTY = "Chưa cập nhật";

export default function SettingRow({
  label,
  value,
  image,
  mono,
  hint,
  readOnly,
  trailing,
  open,
  onToggle,
  children,
}: Props) {
  const shown = value?.trim() ? value : EMPTY;
  const isEmpty = !value?.trim();

  return (
    <div className={styles.box}>
      <div
        className={`${styles.row} ${
          readOnly ? "" : styles.box2
        } ${open ? styles.box3 : ""}`}
        onClick={readOnly ? undefined : onToggle}
        role={readOnly ? undefined : "button"}
        tabIndex={readOnly ? undefined : 0}
        onKeyDown={
          readOnly
            ? undefined
            : (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle?.();
                }
              }
        }
      >
        <div className={styles.box4}>
          <h4 className={styles.minorHeading}>{label}</h4>
          {hint && <p className={styles.text}>{hint}</p>}

          {image !== undefined ? (
            image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={label} className={styles.image} />
            ) : (
              <span className={styles.label}>{EMPTY}</span>
            )
          ) : (
            <span
              className={`${styles.label5} ${
                isEmpty ? styles.label2 : styles.label3
              } ${mono && !isEmpty ? styles.label4 : ""}`}
              title={shown}
            >
              {shown}
            </span>
          )}
        </div>

        {trailing}

        {!readOnly &&
          (open ? (
            <X size={16} className={styles.box5} />
          ) : (
            <ChevronRight size={16} className={styles.box6} />
          ))}
      </div>

      {open && children && <div className={styles.box7}>{children}</div>}
    </div>
  );
}

/** Khung nhom cac hang, co tieu de va mo ta - giong <section> trong ban mau */
export function SettingCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.box8}>
        <h2 className={styles.heading}>{title}</h2>
        {desc && <p className={styles.text2}>{desc}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}
