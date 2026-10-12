/**
 * Tao duong dan SEO (slug) sach tu mot chuoi tieng Viet: bo dau, doi "đ" thanh
 * "d", chi giu chu thuong, so va dau gach ngang.
 *
 * Truoc day moi trang tao/sua khoa hoc, danh muc tu chep mot ban rieng.
 */
export function convertToSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
