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

/**
 * Doi dia chi tren thanh dia chi bang History API, KHONG qua router cua Next.
 *
 * VI SAO KHONG DUNG router.push / router.replace: cac trang nhu /course va
 * /learn duoc dung san tinh luc build. Khi chi doi phan query (them hay bo
 * `auth`), Next thay khong co gi moi de tai nen bo qua luon - ke ca viec doi
 * dia chi. O `next dev` thi khong lo vi khong co trang tinh nao.
 *
 * Hau qua da do tren ban that: khach bam "Mua khoa hoc" hay "Vao hoc" thi
 * KHONG co gi xay ra, va khi hop dang nhap da mo thi bam dau X lan Escape
 * deu khong dong duoc.
 *
 * Next co ho tro san pushState/replaceState: goi thang thi usePathname va
 * useSearchParams van cap nhat theo, nen AuthModalGate van thay tham so doi.
 *
 * @param thayThe true = replaceState (khong them mot buoc vao lich su).
 *                Dung khi CHUYEN HUONG tu dong - vi du khach chua dang nhap
 *                mo /learn - de bam Quay lai khong nem ho nguoc vao dung
 *                trang vua day ho ra. Bam tay thi de false cho Quay lai dong
 *                duoc hop.
 */
export const doiDiaChi = (dia: string, thayThe = false): void => {
  if (typeof window === "undefined") return;

  if (thayThe) {
    window.history.replaceState(null, "", dia);
  } else {
    window.history.pushState(null, "", dia);
  }
};
