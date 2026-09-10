"use client";

import Image, { type ImageProps } from "next/image";
import { isOptimizableImageHost } from "@/image-hosts";

/**
 * Boc next/image cho cac anh lay tu CSDL (thumbnail khoa hoc, banner, avatar...).
 *
 * next/image NEM LOI luc chay neu host cua anh chua khai trong next.config.ts,
 * va loi do lam sap ca trang chu khong phai chi hong mot o anh. URL trong CSDL
 * thi nhap tay duoc nen khong the dam bao luc nao cung thuoc danh sach cho phep.
 *
 * O day: host quen thi van toi uu binh thuong, host la thi bo qua toi uu de anh
 * van hien ra. Danh sach host nam trong image-hosts.ts.
 */
export default function SafeImage({ src, alt, unoptimized, ...rest }: ImageProps) {
  const canOptimize = typeof src === "string" ? isOptimizableImageHost(src) : true;

  return (
    <Image src={src} alt={alt} {...rest} unoptimized={unoptimized ?? !canOptimize} />
  );
}
