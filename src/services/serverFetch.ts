// Lay du lieu tu backend NGAY TREN MAY CHU (Server Component / layout).
//
// Khac han apiHelper.ts: cai do chay trong trinh duyet, tu gan token tu
// localStorage va co bo dem rieng. Tren may chu khong co localStorage, va
// viec dem da co san co che revalidate cua Next lo.
//
// Gom ve day vi truoc do bon trang tu chep lai cung mot doan RAW/GOC/lay().
// Doi dia chi backend ma quen mot cho la trang do im lang tra ve rong.

// Xuat lai de ba trang dang dung `import { GOC_API } from ".../serverFetch"`
// khong phai sua. Dinh nghia that nam trong diaChiApi.ts.
export { GOC_API } from "./diaChiApi";
import { GOC_API } from "./diaChiApi";

/**
 * Goi mot duong API cong khai tu may chu.
 *
 * Hong thi tra ve `macDinh` chu KHONG nem loi. Nem o day se lam hong ca luot
 * build tren Vercel, va mot muc hong se keo sap ca trang.
 *
 * @param duong  duong day du ke ca "/api", vi du "/api/courses"
 * @param macDinh gia tri tra ve khi goi hong
 * @param giay   so giay Next giu ban dem (mac dinh 60)
 */
export async function layTuMayChu<T>(duong: string, macDinh: T, giay = 60): Promise<T> {
  try {
    const res = await fetch(`${GOC_API}${duong}`, { next: { revalidate: giay } });
    if (!res.ok) return macDinh;
    return (await res.json()) as T;
  } catch {
    return macDinh;
  }
}

/**
 * Rong thi tra ve null chu khong phai [].
 *
 * Cac component coi "co initialData" la tin hieu thoi goi API. Neu may chu lay
 * hut ma van truyen [] xuong thi muc do hien trong tron va KHONG bao gio thu
 * lai. Tra null thi trinh duyet tu goi nhu cu - giu nguyen duong lui.
 */
export const hoacNull = <T>(ds: T[] | undefined | null): T[] | null =>
  ds && ds.length ? ds : null;
