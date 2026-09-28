import type { DocumentFile, DocumentSubject } from "@/src/services/document";

// Khop gioi han ben backend (models/Document.js).
export const SO_FILE_TOI_DA = 5;
export const SO_MON_TOI_DA = 5;
export const MAX_MB = 20;
export const DUOI_CHO_PHEP = ["pdf", "doc", "docx"];

export function doiKichThuoc(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Tong dung luong cac file cua mot tai lieu. */
export const tongDungLuong = (files: Pick<DocumentFile, "fileSize">[] = []) =>
  files.reduce((s, f) => s + (f.fileSize || 0), 0);

/** Duoi cua file DAU - de to mau nhan PDF / DOC. */
export const duoiChinh = (files: Pick<DocumentFile, "fileExt">[] = []) =>
  files[0]?.fileExt ?? "pdf";

/** "PDF" voi mot file, "PDF +2" voi ba file, "Bài viết" khi khong kem file. */
export const nhanDinhDang = (files: Pick<DocumentFile, "fileExt">[] = []) =>
  files.length
    ? `${duoiChinh(files).toUpperCase()}${files.length > 1 ? ` +${files.length - 1}` : ""}`
    : "Bài viết";

/** Gioi han noi dung bai - khop GIOI_HAN_NOI_DUNG ben backend. */
export const GIOI_HAN_NOI_DUNG = 20000;

/**
 * Tai lieu luu TEN mon (ten chuan lay tu danh sach luc dang), form chon mon
 * lai lam viec voi KHOA - doi ten ra khoa. Mon da bi admin xoa thi bo qua.
 */
export const khoaTuTenMon = (dsMon: DocumentSubject[], ten: string[] = []) =>
  ten
    .map((t) => dsMon.find((m) => m.ten === t)?.key)
    .filter((k): k is string => Boolean(k));
