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

export const HOME_PATH = "/share-document";
export const ALL_PATH = "/share-document/all-document";
/** Danh sach truong dai hoc. Logo truong o public/images/institution/. */
export const SCHOOLS_PATH = "/share-document/institution";

/** Khoa ("toan hoc") -> doan dia chi dep ("toan-hoc"). May chu doc duoc ca hai. */
export const slug = (course: string) => course.trim().replace(/\s+/g, "-");

/** Chi tiet mot tai lieu. */
export const documentPath = (id: string) => `${ALL_PATH}/${id}`;

/** Trang mot truong ("hoc-vien-cong-nghe-..."). */
export const schoolPath = (course: string) =>
  `${SCHOOLS_PATH}/${encodeURIComponent(slug(course))}`;

/** Tai lieu mot linh vuc cua mot truong, kem bo loc phu (mon, tu khoa, loai). */
export function schoolCategoryPath(
  school: string,
  group: string,
  query: { q?: string; mon?: string; loai?: string } = {},
) {
  const sp = new URLSearchParams();
  if (query.q?.trim()) sp.set("q", query.q.trim());
  if (query.mon) sp.set("mon", slug(query.mon));
  if (query.loai) sp.set("loai", query.loai);
  const qs = sp.toString();
  const origin = `${schoolPath(school)}/${encodeURIComponent(slug(group))}`;
  return qs ? `${origin}?${qs}` : origin;
}

/** Duong toi trang tat ca tai lieu kem bo loc. */
export function allPath(
  query: {
    q?: string;
    mon?: string;
    nhom?: string;
    truong?: string;
    loai?: string;
    dang?: boolean;
  } = {},
) {
  const sp = new URLSearchParams();
  if (query.q?.trim()) sp.set("q", query.q.trim());
  if (query.mon) sp.set("mon", slug(query.mon));
  if (query.nhom) sp.set("nhom", slug(query.nhom));
  if (query.truong) sp.set("truong", slug(query.truong));
  if (query.loai) sp.set("loai", query.loai);
  // Mo san form dang bai (xem ShareDocumentClient).
  if (query.dang) sp.set("dang", "1");
  const qs = sp.toString();
  return qs ? `${ALL_PATH}?${qs}` : ALL_PATH;
}
