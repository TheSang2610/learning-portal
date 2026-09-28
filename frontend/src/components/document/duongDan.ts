// Duong dan cua khu tai lieu - gom mot cho de doi ten duong chi sua mot dong.
//
//   /share-document                         trang chu khu tai lieu (dai dau, linh vuc...)
//   /share-document/all-document            tat ca tai lieu - tim, loc theo mon / linh vuc
//   /share-document/all-document/<id>       chi tiet mot tai lieu
//   /share-document/institution             danh sach truong dai hoc
//   /share-document/institution/<khoa>      mot truong: linh vuc, mon hoc, truong khac
//   /share-document/institution/<khoa>/<linh-vuc>  tai lieu linh vuc do cua truong
//
// Duong cu /share-document/browse va /share-document/<id> chuyen huong sang
// duong moi - xem redirects() trong next.config.ts.

export const DUONG_TRANG_CHU = "/share-document";
export const DUONG_TAT_CA = "/share-document/all-document";
/** Danh sach truong dai hoc. Logo truong o public/images/institution/. */
export const DUONG_TRUONG = "/share-document/institution";

/** Khoa ("toan hoc") -> doan dia chi dep ("toan-hoc"). May chu doc duoc ca hai. */
export const slug = (khoa: string) => khoa.trim().replace(/\s+/g, "-");

/** Chi tiet mot tai lieu. */
export const duongTaiLieu = (id: string) => `${DUONG_TAT_CA}/${id}`;

/** Trang mot truong ("hoc-vien-cong-nghe-..."). */
export const duongTruong = (khoa: string) =>
  `${DUONG_TRUONG}/${encodeURIComponent(slug(khoa))}`;

/** Tai lieu mot linh vuc cua mot truong, kem bo loc phu (mon, tu khoa, loai). */
export function duongDanhMucTruong(
  truong: string,
  nhom: string,
  loc: { q?: string; mon?: string; loai?: string } = {},
) {
  const sp = new URLSearchParams();
  if (loc.q?.trim()) sp.set("q", loc.q.trim());
  if (loc.mon) sp.set("mon", slug(loc.mon));
  if (loc.loai) sp.set("loai", loc.loai);
  const qs = sp.toString();
  const goc = `${duongTruong(truong)}/${encodeURIComponent(slug(nhom))}`;
  return qs ? `${goc}?${qs}` : goc;
}

/** Duong toi trang tat ca tai lieu kem bo loc. */
export function duongTatCa(
  loc: {
    q?: string;
    mon?: string;
    nhom?: string;
    truong?: string;
    loai?: string;
    dang?: boolean;
  } = {},
) {
  const sp = new URLSearchParams();
  if (loc.q?.trim()) sp.set("q", loc.q.trim());
  if (loc.mon) sp.set("mon", slug(loc.mon));
  if (loc.nhom) sp.set("nhom", slug(loc.nhom));
  if (loc.truong) sp.set("truong", slug(loc.truong));
  if (loc.loai) sp.set("loai", loc.loai);
  // Mo san form dang bai (xem ShareDocumentClient).
  if (loc.dang) sp.set("dang", "1");
  const qs = sp.toString();
  return qs ? `${DUONG_TAT_CA}?${qs}` : DUONG_TAT_CA;
}
