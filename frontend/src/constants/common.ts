/** Chu dung chung nhieu trang. */
export const PAGER_TEXT = {
  info: (page: number, pages: number) => `Trang ${page} / ${pages}`,
  prev: "Trước",
  next: "Sau",
} as const;

/** Nut sao chep (so tai khoan, so tien, noi dung chuyen khoan...). */
export const COPY_TEXT = {
  copy: "Chép",
  copied: "Đã chép",
  aria: (what: string) => `Sao chép ${what}`,
} as const;
