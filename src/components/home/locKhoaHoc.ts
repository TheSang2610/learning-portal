// Phep loc danh sach khoa hoc da xuat ban.
//
// Phai nam o file RIENG, khong co "use client": trang chu (Server Component)
// goi ham nay khi dung san du lieu, ma ham xuat tu module "use client" thi
// Next tu choi - "Attempted to call ... from the server but ... is on the
// client". Da dinh dung loi do mot lan.
//
// De o day thi may chu va trinh duyet loc giong het nhau, khong lech.

import type { Course } from "@/src/services/course";

/** Nhan ca hai dang API tra ve: mang tran, hoac boc trong { data: [...] } */
export function locKhoaDaDang(res: unknown): Course[] {
  const boc =
    res && typeof res === "object" && "data" in res
      ? (res as { data: unknown }).data
      : res;

  if (!Array.isArray(boc)) return [];

  return (boc as Course[]).filter((c) =>
    c.isPublished !== undefined ? Boolean(c.isPublished) : true,
  );
}
