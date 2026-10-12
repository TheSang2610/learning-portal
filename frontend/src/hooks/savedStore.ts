"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useStoredUser } from "./userStore";
import { savedService, type SaveType } from "@/src/services/saved";

// Trang thai "da luu" dung chung cho MOI nut luu tren trang.
//
// Mot danh sach id tai MOT lan cho ca trang (GET /api/da-luu/id), thay vi moi
// the tu hoi may chu - trang blog co 10 the la 10 request.
//
// Gan voi TAI KHOAN chu khong con nam trong localStorage: truoc day doi may la
// mat het, va trang ca nhan khong doc duoc. Danh sach cu trong localStorage
// ("feedBookmarks") duoc chuyen vao tai khoan mot lan roi xoa - xem legacyDraft().

const LEGACY_KEY = "feedBookmarks";

let savedSet = new Set<string>();
// Da nap cho nguoi dung nao. Doi tai khoan / dang xuat thi nap lai tu dau.
let loadForUser: string | null | undefined;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((f) => f());

const course = (loai: SaveType, id: string) => `${loai}:${id}`;

async function legacyDraft() {
  let items: unknown;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    items = raw ? JSON.parse(raw) : null;
  } catch {
    return;
  }
  if (!Array.isArray(items) || items.length === 0) return;
  await savedService.nhap(items.filter((x) => typeof x === "string"));
  // Chi xoa SAU khi may chu nhan: hong mang thi lan sau thu lai, khong mat.
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    // Trinh duyet chan luu tru - lan sau nhap lai, may chu tu bo trung.
  }
}

function loadSaved(userId: string | null) {
  if (loadForUser === userId) return;
  loadForUser = userId;
  savedSet = new Set();
  notify();
  if (!userId) return;

  (async () => {
    await legacyDraft().catch(() => {});
    const items = await savedService.getId();
    // Trong luc cho, nguoi dung da doi tai khoan - bo ket qua cu.
    if (loadForUser !== userId) return;
    savedSet = new Set([
      ...items.baiViet.map((id) => course("baiViet", id)),
      ...items.taiLieu.map((id) => course("taiLieu", id)),
    ]);
    notify();
  })().catch(() => {
    // Khong tai duoc thi nut hien "chua luu" - bam van luu duoc binh thuong.
  });
}

function subscribe(f: () => void) {
  listeners.add(f);
  return () => listeners.delete(f);
}

/**
 * Bat / tat luu. Doi tren man hinh NGAY (lac quan), hong thi tra lai nhu cu.
 * Tra ve trang thai moi.
 */
export async function toggleSave(loai: SaveType, id: string): Promise<boolean> {
  const k = course(loai, id);
  const before = savedSet.has(k);
  const setStatus = (size: boolean) => {
    savedSet = new Set(savedSet);
    if (size) savedSet.add(k);
    else savedSet.delete(k);
    notify();
  };

  setStatus(!before);
  try {
    if (before) await savedService.boLuu(loai, id);
    else await savedService.luu(loai, id);
    return !before;
  } catch (err) {
    setStatus(before);
    throw err;
  }
}

/** Muc nay da duoc nguoi dang dang nhap luu chua. Khach: luon false. */
export function useSaved(loai: SaveType, id: string): boolean {
  const currentUserId = useStoredUser()?._id ?? null;

  useEffect(() => {
    loadSaved(currentUserId);
  }, [currentUserId]);

  return useSyncExternalStore(
    subscribe,
    () => savedSet.has(course(loai, id)),
    () => false,
  );
}
