import type { DocumentFile, DocumentSubject } from "@/src/services/document";

// Khop gioi han ben backend (models/Document.js).
export const MAX_FILES = 5;
export const MAX_SUBJECTS = 5;
export const MAX_MB = 20;
export const ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];

export function setPageSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Tong dung luong cac file cua mot tai lieu. */
export const totalSize = (files: Pick<DocumentFile, "fileSize">[] = []) =>
  files.reduce((s, f) => s + (f.fileSize || 0), 0);

/** Duoi cua file DAU - de to mau nhan PDF / DOC. */
export const mainExtension = (files: Pick<DocumentFile, "fileExt">[] = []) =>
  files[0]?.fileExt ?? "pdf";

/** "PDF" voi mot file, "PDF +2" voi ba file, "Bài viết" khi khong kem file. */
export const formatLabel = (files: Pick<DocumentFile, "fileExt">[] = []) =>
  files.length
    ? `${mainExtension(files).toUpperCase()}${files.length > 1 ? ` +${files.length - 1}` : ""}`
    : "Bài viết";

/** Gioi han noi dung bai - khop CONTENT_LIMIT ben backend. */
export const CONTENT_LIMIT = 20000;

/**
 * Tai lieu luu TEN mon (ten chuan lay tu danh sach luc dang), form chon mon
 * lai lam viec voi KHOA - doi ten ra khoa. Mon da bi admin xoa thi bo qua.
 */
export const keyFromSubjectName = (subjectList: DocumentSubject[], name: string[] = []) =>
  name
    .map((t) => subjectList.find((m) => m.ten === t)?.key)
    .filter((k): k is string => Boolean(k));
