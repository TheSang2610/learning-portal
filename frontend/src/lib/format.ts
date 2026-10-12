/** Dinh dang so tien VND kieu "1.200.000đ" (dau cham ngan cach theo vi-VN). */
/**
 * Dien gia tri vao mau chu: fillTemplate("{n} khoá học", { n: 5 }) -> "5 khoá học".
 *
 * Noi dung truyen tu page.tsx (server) xuong mot client component phai la du
 * lieu thuan - KHONG truyen ham duoc. Nen chu co bien trong constants cua cac
 * section client viet bang mau "{ten}" thay vi ham (n) => `...`.
 */
export function fillTemplate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (m, key: string) =>
    key in values ? String(values[key]) : m,
  );
}

export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}
