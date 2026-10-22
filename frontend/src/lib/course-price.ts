/**
 * Gia khoa hoc: 0 = mien phi, khoa co phi tu MIN_PAID_PRICE tro len.
 * Cung luat voi backend/src/utils/coursePrice.js - doi mot ben thi doi ca hai.
 */
export const MIN_PAID_PRICE = 2000;

export const COURSE_PRICE_HINT = "Để 0 nếu miễn phí. Khóa có phí tối thiểu 2.000đ.";

/** Cau bao loi neu gia khong hop le, chuoi rong neu hop le. */
export function coursePriceError(value: string | number): string {
  if (value === "") return "";
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0 || !Number.isInteger(price)) {
    return "Giá khóa học phải là số nguyên không âm";
  }
  if (price > 0 && price < MIN_PAID_PRICE) {
    return "Khóa có phí phải từ 2.000đ trở lên (để 0 nếu miễn phí)";
  }
  return "";
}

/**
 * Gan loi vao o nhap bang setCustomValidity: trinh duyet tu chan nut luu va
 * hien dung cau do canh o gia, khong can them state loi rieng cho moi form.
 */
export function checkPriceInput(e: { currentTarget: HTMLInputElement }) {
  e.currentTarget.setCustomValidity(coursePriceError(e.currentTarget.value));
}
