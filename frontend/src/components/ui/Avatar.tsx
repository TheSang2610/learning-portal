"use client";

import { useState } from "react";
import SafeImage from "./SafeImage";

import styles from "./Avatar.module.scss";

// Bang mau cho vong tron chu cai khi bat `colorful` - deu du dam de chu trang
// doc ro. Cung mot ten luon ra cung mot mau (bam theo ten), nen nhin danh sach
// dai van nhan ra nguoi quen.
const PALETTE = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#ea580c",
  "#16a34a",
  "#0891b2",
  "#b45309",
  "#dc2626",
  "#4f46e5",
  "#0d9488",
];

/** Mau nen co dinh theo ten (hoac email / id). */
export const avatarColor = (key?: string) => {
  const k = (key ?? "").trim();
  let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
};

/**
 * Anh dai dien co duong lui: khong co anh, hoac anh tai that bai, thi hien
 * vong tron chu cai dau.
 *
 * Vi sao can onError chu khong chi kiem tra src rong: avatar trong CSDL la
 * chuoi nguoi dung dan tay vao duoc, va anh tren Cloudinary cung co the bi xoa
 * sau do. Luc ay src van la URL hop le nhung tai ve 404 - khong bat onError
 * thi o anh vo, chu khong lui ve chu cai.
 */
export default function Avatar({
  src,
  ten: name,
  size = 36,
  className = "",
  letterBackground = styles.defaultBg,
  colorful = false,
}: {
  src?: string | null;
  ten?: string;
  size?: number;
  className?: string;
  /**
   * Mau nen cua vong tron chu cai. De tham so vi moi man hinh dang dung mot
   * tong mau rieng (header xanh, feed xam, danh gia xanh nhat) - gop ve mot
   * mau cung se doi giao dien cua nhung trang khong lien quan.
   */
  letterBackground?: string;
  /** Moi nguoi mot mau (theo ten) thay cho letterBackground - dung o bang quan tri. */
  colorful?: boolean;
}) {
  const [err, setErr] = useState(false);

  // Doi anh thi phai thu lai tu dau. Khong co doan nay thi mot lan tai hong se
  // dinh mai: dang xuat roi dang nhap bang tai khoan khac van ra chu cai, du
  // anh moi hoan toan tai duoc. Day la kieu "chinh state ngay trong luc render"
  // ma React khuyen dung cho state phai suy ra tu props - re hon useEffect vi
  // khong phai ve ra man hinh mot lan sai roi moi sua.
  const [previousSrc, setPreviousSrc] = useState(src);
  if (src !== previousSrc) {
    setPreviousSrc(src);
    setErr(false);
  }

  const common = `${styles.base} ${className}`;
  const style = { width: size, height: size };

  if (!src || err) {
    return (
      <div
        style={{
          ...style,
          fontSize: Math.max(11, Math.round(size * 0.42)),
          ...(colorful ? { backgroundColor: avatarColor(name), color: "#fff" } : null),
        }}
        className={`${common} ${styles.fallback} ${letterBackground}`}
      >
        {name?.trim().charAt(0) || "?"}
      </div>
    );
  }

  return (
    <SafeImage
      src={src}
      alt={name ? `Ảnh đại diện của ${name}` : "Ảnh đại diện"}
      width={size}
      height={size}
      onError={() => setErr(true)}
      style={style}
      className={`${common} ${styles.image}`}
    />
  );
}
