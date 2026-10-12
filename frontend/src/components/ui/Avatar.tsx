"use client";

import { useState } from "react";
import SafeImage from "./SafeImage";

import styles from "./Avatar.module.scss";

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
        style={{ ...style, fontSize: Math.max(11, Math.round(size * 0.42)) }}
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
