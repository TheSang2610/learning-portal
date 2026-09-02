"use client";

import { useState } from "react";
import SafeImage from "./SafeImage";

/**
 * Anh dai dien co duong lui: khong co anh, hoac anh tai that bai, thi hien
 * vong tron chu cai dau.
 *
 * Vi sao can onError chu khong chi kiem tra src rong: avatar trong CSDL la
 * chuoi nguoi dung dan tay vao duoc, va anh tren Cloudinary cung co the bi xoa
 * sau do. Luc ay src van la URL hop le nhung tai ve 404 - khong bat onError
 * thi o anh vo, chu khong lui ve chu cai.
 */
export default function AnhDaiDien({
  src,
  ten,
  size = 36,
  className = "",
  nenChuCai = "bg-indigo-600 text-white",
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
  nenChuCai?: string;
}) {
  const [loi, setLoi] = useState(false);

  // Doi anh thi phai thu lai tu dau. Khong co doan nay thi mot lan tai hong se
  // dinh mai: dang xuat roi dang nhap bang tai khoan khac van ra chu cai, du
  // anh moi hoan toan tai duoc. Day la kieu "chinh state ngay trong luc render"
  // ma React khuyen dung cho state phai suy ra tu props - re hon useEffect vi
  // khong phai ve ra man hinh mot lan sai roi moi sua.
  const [srcTruoc, setSrcTruoc] = useState(src);
  if (src !== srcTruoc) {
    setSrcTruoc(src);
    setLoi(false);
  }

  const chung = `shrink-0 rounded-full object-cover ${className}`;
  const style = { width: size, height: size };

  if (!src || loi) {
    return (
      <div
        style={{ ...style, fontSize: Math.max(11, Math.round(size * 0.42)) }}
        className={`${chung} flex items-center justify-center font-bold uppercase ${nenChuCai}`}
      >
        {ten?.trim().charAt(0) || "?"}
      </div>
    );
  }

  return (
    <SafeImage
      src={src}
      alt={ten ? `Ảnh đại diện của ${ten}` : "Ảnh đại diện"}
      width={size}
      height={size}
      onError={() => setLoi(true)}
      style={style}
      className={`${chung} border border-slate-200 bg-slate-100`}
    />
  );
}
