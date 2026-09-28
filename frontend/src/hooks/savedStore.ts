"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useNguoiDungLuu } from "./userStore";
import { savedService, type LoaiLuu } from "@/src/services/saved";

// Trang thai "da luu" dung chung cho MOI nut luu tren trang.
//
// Mot danh sach id tai MOT lan cho ca trang (GET /api/da-luu/id), thay vi moi
// the tu hoi may chu - trang blog co 10 the la 10 request.
//
// Gan voi TAI KHOAN chu khong con nam trong localStorage: truoc day doi may la
// mat het, va trang ca nhan khong doc duoc. Danh sach cu trong localStorage
// ("feedBookmarks") duoc chuyen vao tai khoan mot lan roi xoa - xem nhapCu().

const KHOA_CU = "feedBookmarks";

let tapDaLuu = new Set<string>();
// Da nap cho nguoi dung nao. Doi tai khoan / dang xuat thi nap lai tu dau.
let napChoUser: string | null | undefined;
const nguoiNghe = new Set<() => void>();
const bao = () => nguoiNghe.forEach((f) => f());

const khoa = (loai: LoaiLuu, id: string) => `${loai}:${id}`;

async function nhapCu() {
  let ds: unknown;
  try {
    const raw = localStorage.getItem(KHOA_CU);
    ds = raw ? JSON.parse(raw) : null;
  } catch {
    return;
  }
  if (!Array.isArray(ds) || ds.length === 0) return;
  await savedService.nhap(ds.filter((x) => typeof x === "string"));
  // Chi xoa SAU khi may chu nhan: hong mang thi lan sau thu lai, khong mat.
  try {
    localStorage.removeItem(KHOA_CU);
  } catch {
    // Trinh duyet chan luu tru - lan sau nhap lai, may chu tu bo trung.
  }
}

function napDaLuu(userId: string | null) {
  if (napChoUser === userId) return;
  napChoUser = userId;
  tapDaLuu = new Set();
  bao();
  if (!userId) return;

  (async () => {
    await nhapCu().catch(() => {});
    const ds = await savedService.layId();
    // Trong luc cho, nguoi dung da doi tai khoan - bo ket qua cu.
    if (napChoUser !== userId) return;
    tapDaLuu = new Set([
      ...ds.baiViet.map((id) => khoa("baiViet", id)),
      ...ds.taiLieu.map((id) => khoa("taiLieu", id)),
    ]);
    bao();
  })().catch(() => {
    // Khong tai duoc thi nut hien "chua luu" - bam van luu duoc binh thuong.
  });
}

function dangKy(f: () => void) {
  nguoiNghe.add(f);
  return () => nguoiNghe.delete(f);
}

/**
 * Bat / tat luu. Doi tren man hinh NGAY (lac quan), hong thi tra lai nhu cu.
 * Tra ve trang thai moi.
 */
export async function doiLuu(loai: LoaiLuu, id: string): Promise<boolean> {
  const k = khoa(loai, id);
  const truoc = tapDaLuu.has(k);
  const datTrangThai = (co: boolean) => {
    tapDaLuu = new Set(tapDaLuu);
    if (co) tapDaLuu.add(k);
    else tapDaLuu.delete(k);
    bao();
  };

  datTrangThai(!truoc);
  try {
    if (truoc) await savedService.boLuu(loai, id);
    else await savedService.luu(loai, id);
    return !truoc;
  } catch (err) {
    datTrangThai(truoc);
    throw err;
  }
}

/** Muc nay da duoc nguoi dang dang nhap luu chua. Khach: luon false. */
export function useDaLuu(loai: LoaiLuu, id: string): boolean {
  const idNguoiDung = useNguoiDungLuu()?._id ?? null;

  useEffect(() => {
    napDaLuu(idNguoiDung);
  }, [idNguoiDung]);

  return useSyncExternalStore(
    dangKy,
    () => tapDaLuu.has(khoa(loai, id)),
    () => false,
  );
}
