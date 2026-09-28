// Lay du lieu khu tai lieu NGAY TREN MAY CHU - dung chung cho trang tat ca tai
// lieu (/share-document/all-document) va trang linh vuc cua mot truong
// (/share-document/institution/<khoa>/<linh-vuc>). Hai trang cung giao dien
// (ShareDocumentClient), chi khac bo loc co dinh.
//
// Hong thi tra rong chu KHONG nem - nem se lam hong ca trang.

import type { BoLoc } from "./ShareDocumentClient";
import {
  chuanHoaTaiLieu,
  type ChiTietTruong,
  type DocumentCategory,
  type DocumentListResponse,
  type DocumentSubject,
  type DocumentUniversity,
  type LoaiTaiLieu,
} from "@/src/services/document";
import { GOC_API } from "@/src/services/serverFetch";

type ThamSo = string | string[] | undefined;

const RONG: DocumentListResponse = { documents: [], total: 0, page: 1, totalPages: 1 };

/** Khop SO_MOI_TRANG trong ShareDocumentClient. */
const SO_MOI_TRANG = 24;

// Dia chi dung "toan-roi-rac"; khoa trong CSDL la "toan roi rac" (chuanHoaMon
// bien moi ky tu khong phai chu/so thanh dau cach, nen khoa khong bao gio co "-").
export const doiKhoa = (v: ThamSo) => {
  const s = Array.isArray(v) ? v[0] : v || "";
  let giai = s;
  try {
    // Doan dia chi dong (params) co the con ma %xx. Chuoi go tay hong ma
    // (vd. "%E0") thi dung nguyen - khong de trang 500.
    giai = decodeURIComponent(s);
  } catch {}
  return giai.replace(/-/g, " ").trim();
};

// Chi nhan dung ba gia tri - dia chi go tay sai thi coi nhu "tat ca".
const LOAI_HOP_LE: LoaiTaiLieu[] = ["pdf", "word", "baiViet"];
export const docLoai = (v: ThamSo): LoaiTaiLieu | "" => {
  const s = Array.isArray(v) ? v[0] : v;
  return LOAI_HOP_LE.find((l) => l === s) ?? "";
};

export const docTuKhoa = (v: ThamSo) => (Array.isArray(v) ? v[0] : v || "").trim();

async function layDs<T>(duong: string): Promise<T[]> {
  try {
    const res = await fetch(`${GOC_API}${duong}`, { next: { revalidate: 60 } });
    return res.ok ? ((await res.json()) as T[]) : [];
  } catch {
    return [];
  }
}

export const layDsTruong = () => layDs<DocumentUniversity>("/api/documents/truong");
export const layDsMon = () => layDs<DocumentSubject>("/api/documents/mon-hoc");
export const layDsNhom = () => layDs<DocumentCategory>("/api/documents/linh-vuc");

/**
 * Trang dau lay san o may chu THEO DUNG bo loc - link ".../all-document?nhom=luat"
 * mo ra la thay ngay danh sach Luat, khong nhay. Kem so lieu cho dai dau.
 */
export async function layTrangDau(loc: BoLoc): Promise<DocumentListResponse> {
  try {
    const sp = new URLSearchParams({
      page: "1",
      limit: String(SO_MOI_TRANG),
      thongKe: "1",
    });
    if (loc.q) sp.set("q", loc.q);
    if (loc.mon) sp.set("mon", loc.mon);
    if (loc.nhom) sp.set("nhom", loc.nhom);
    if (loc.truong) sp.set("truong", loc.truong);
    if (loc.loai) sp.set("loai", loc.loai);
    const res = await fetch(`${GOC_API}/api/documents?${sp}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return RONG;
    const json = (await res.json()) as DocumentListResponse;
    // CDN luu danh sach 60 giay - co the con ban dinh dang cu, xem chuanHoaTaiLieu.
    return { ...json, documents: (json.documents ?? []).map(chuanHoaTaiLieu) };
  } catch {
    return RONG;
  }
}

/** Mot truong (danh muc mon, linh vuc...). Khong co / hong thi null. */
export async function layChiTietTruong(khoa: string): Promise<ChiTietTruong | null> {
  try {
    const res = await fetch(
      `${GOC_API}/api/documents/truong/${encodeURIComponent(khoa)}`,
      {
        next: { revalidate: 60 },
      },
    );
    return res.ok ? ((await res.json()) as ChiTietTruong) : null;
  } catch {
    return null;
  }
}
