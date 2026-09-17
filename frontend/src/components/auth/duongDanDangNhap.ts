// Dia chi mo hop dang nhap NGAY TREN trang dang xem.
//
// Truoc day moi cho can dang nhap deu day nguoi dung ve "/?auth=login". Khach
// dang doc mot khoa hoc, bam "Vào học", va bi nem ve trang chu - dang nhap
// xong thi dung o trang chu, phai tu tim lai khoa hoc. Giu nguyen duong dan va
// cac tham so hien co thi dang nhap xong ho o dung cho cu.
//
// Hop dang nhap nam o app/(portal)/layout.tsx nen tham so nay co tac dung tren
// moi trang cua khu hoc vien. Xem src/components/home/AuthModalGate.tsx.

/** Cac ly do hop le. Danh sach day du nam o CAU_GIAI_THICH trong AuthModalGate. */
export type LyDoDangNhap = "hoc" | "ghidanh";

/**
 * @param duongDan  pathname hien tai, tu usePathname()
 * @param thamSo    searchParams hien tai, tu useSearchParams()
 * @param lyDo      de hop dang nhap noi duoc vi sao no hien ra
 * @param che       mo o tab nao. AuthModalGate chi kiem `auth` CO hay KHONG,
 *                  con gia tri thi de AuthModal tu doc - nen truyen dung ten
 *                  tab vao day, dung tu ghep chuoi roi thay the o noi goi.
 */
export const duongDanDangNhap = (
  duongDan: string,
  thamSo: { toString(): string },
  lyDo?: LyDoDangNhap,
  che: "login" | "register" = "login",
): string => {
  // Sao ra mot ban moi: doi tuong tu useSearchParams() la chi doc, ghi thang
  // vao no se nem.
  const t = new URLSearchParams(thamSo.toString());
  t.set("auth", che);
  if (lyDo) t.set("vi", lyDo);
  return `${duongDan}?${t.toString()}`;
};
