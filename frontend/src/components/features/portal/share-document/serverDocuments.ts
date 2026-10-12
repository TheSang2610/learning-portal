// Lay du lieu khu tai lieu NGAY TREN MAY CHU - dung chung cho trang tat ca tai
// lieu (/share-document/all-document) va trang linh vuc cua mot truong
// (/share-document/institution/<khoa>/<linh-vuc>). Hai trang cung giao dien
// (ShareDocumentClient), chi khac bo loc co dinh.
//
// Hong thi tra rong chu KHONG nem - nem se lam hong ca trang.

import type { Filters } from "./parts/ShareDocumentClient";
import {
  normalizeDocument,
  type SchoolDetail,
  type DocumentCategory,
  type DocumentListResponse,
  type DocumentSubject,
  type DocumentUniversity,
  type DocumentType,
} from "@/src/services/document";
import { GOC_API } from "@/src/services/serverFetch";

type Params = string | string[] | undefined;

const RONG: DocumentListResponse = { documents: [], total: 0, page: 1, totalPages: 1 };

/** Khop PAGE_SIZE trong ShareDocumentClient. */
const PAGE_SIZE = 24;

// Dia chi dung "toan-roi-rac"; khoa trong CSDL la "toan roi rac" (normalizeSubject
// bien moi ky tu khong phai chu/so thanh dau cach, nen khoa khong bao gio co "-").
export const swapKey = (v: Params) => {
  const s = Array.isArray(v) ? v[0] : v || "";
  let resolve = s;
  try {
    // Doan dia chi dong (params) co the con ma %xx. Chuoi go tay hong ma
    // (vd. "%E0") thi dung nguyen - khong de trang 500.
    resolve = decodeURIComponent(s);
  } catch {}
  return resolve.replace(/-/g, " ").trim();
};

// Chi nhan dung ba gia tri - dia chi go tay sai thi coi nhu "tat ca".
const VALID_TYPES: DocumentType[] = ["pdf", "word", "baiViet"];
export const readType = (v: Params): DocumentType | "" => {
  const s = Array.isArray(v) ? v[0] : v;
  return VALID_TYPES.find((l) => l === s) ?? "";
};

export const readKeyword = (v: Params) => (Array.isArray(v) ? v[0] : v || "").trim();

async function getList<T>(route: string): Promise<T[]> {
  try {
    const res = await fetch(`${GOC_API}${route}`, { next: { revalidate: 60 } });
    return res.ok ? ((await res.json()) as T[]) : [];
  } catch {
    return [];
  }
}

export const getSchoolOptions = () =>
  getList<DocumentUniversity>("/api/documents/truong");
export const getSubjects = () => getList<DocumentSubject>("/api/documents/mon-hoc");
export const getGroups = () => getList<DocumentCategory>("/api/documents/linh-vuc");

/**
 * Trang dau lay san o may chu THEO DUNG bo loc - link ".../all-document?nhom=luat"
 * mo ra la thay ngay danh sach Luat, khong nhay. Kem so lieu cho dai dau.
 */
export async function getFirstPage(query: Filters): Promise<DocumentListResponse> {
  try {
    const sp = new URLSearchParams({
      page: "1",
      limit: String(PAGE_SIZE),
      thongKe: "1",
    });
    if (query.q) sp.set("q", query.q);
    if (query.mon) sp.set("mon", query.mon);
    if (query.nhom) sp.set("nhom", query.nhom);
    if (query.truong) sp.set("truong", query.truong);
    if (query.loai) sp.set("loai", query.loai);
    const res = await fetch(`${GOC_API}/api/documents?${sp}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return RONG;
    const json = (await res.json()) as DocumentListResponse;
    // CDN luu danh sach 60 giay - co the con ban dinh dang cu, xem normalizeDocument.
    return { ...json, documents: (json.documents ?? []).map(normalizeDocument) };
  } catch {
    return RONG;
  }
}

/** Mot truong (danh muc mon, linh vuc...). Khong co / hong thi null. */
export async function getSchoolDetail(course: string): Promise<SchoolDetail | null> {
  try {
    const res = await fetch(
      `${GOC_API}/api/documents/truong/${encodeURIComponent(course)}`,
      {
        next: { revalidate: 60 },
      },
    );
    return res.ok ? ((await res.json()) as SchoolDetail) : null;
  } catch {
    return null;
  }
}
