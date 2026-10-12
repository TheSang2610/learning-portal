// Logo cua cac don vi dao tao, tra theo `slug` cua provider.
//
// Tai sao nam o day chu khong trong CSDL: tat ca provider dang co deu de trong
// truong `logo`. Khi admin tai logo len (trang /admin/providers) thi logo trong
// CSDL duoc uu tien, file o day chi la ban dung tam.
//
// `w`/`h` la kich thuoc THAT cua file (anh raster da cat vien trong va thu ve cao
// 160px; SVG lay theo viewBox). Dai chay ngang dung ti le nay de uoc be rong moi
// logo, tu do ra toc do chay - doi file thi phai sua lai hai so nay.
//
// Nguon: logo trong hop thong tin cua trang Wikipedia moi truong (IU lay o ban
// tieng Viet); SGU, TLU, FUNiX, TechAcademy Vietnam lay tu trang chu chinh thuc
// cua ho. Logo TechAcademy goc chi cao 71px nen khong thu ve 160px duoc.
export interface ProviderLogo {
  src: string;
  w: number;
  h: number;
}

export const PROVIDER_LOGOS: Record<string, ProviderLogo> = {
  ctu: { src: "/logos/ctu.svg", w: 150, h: 150 },
  dut: { src: "/logos/dut.svg", w: 850, h: 850 },
  fpt: { src: "/logos/fpt.svg", w: 715, h: 279 },
  funix: { src: "/logos/funix.png", w: 391, h: 160 },
  haui: { src: "/logos/haui.png", w: 160, h: 160 },
  hcmus: { src: "/logos/hcmus.svg", w: 907, h: 744 },
  hcmut: { src: "/logos/hcmut.svg", w: 400, h: 404 },
  hcmute: { src: "/logos/hcmute.png", w: 126, h: 160 },
  hus: { src: "/logos/hus.svg", w: 200, h: 200 },
  hust: { src: "/logos/hust.svg", w: 200, h: 300 },
  hutech: { src: "/logos/hutech.png", w: 138, h: 160 },
  ictu: { src: "/logos/ictu.png", w: 160, h: 160 },
  iu: { src: "/logos/iu.svg", w: 3887, h: 3884 },
  ptit: { src: "/logos/ptit.png", w: 160, h: 160 },
  rmit: { src: "/logos/rmit.svg", w: 893, h: 314 },
  sgu: { src: "/logos/sgu.png", w: 160, h: 160 },
  tdtu: { src: "/logos/tdtu.png", w: 290, h: 160 },
  "techacademy-vietnam": { src: "/logos/techacademy-vietnam.png", w: 177, h: 61 },
  tlu: { src: "/logos/tlu.png", w: 735, h: 160 },
  uet: { src: "/logos/uet.svg", w: 149, h: 149 },
  uit: { src: "/logos/uit.svg", w: 869, h: 702 },
  vku: { src: "/logos/vku.png", w: 262, h: 160 },
};

/**
 * Logo cua mot don vi: logo admin tai len trong CSDL truoc, khong co thi file
 * dung tam o tren. `fallback` la file dung tam - dung lam anh thay the khi link
 * trong CSDL chet, de logo khong bao gio hien thanh anh vo.
 */
export function providerLogo(
  p: { slug?: string; logo?: string | null } | null | undefined,
) {
  const local = p?.slug ? PROVIDER_LOGOS[p.slug]?.src : undefined;
  const src = p?.logo || local || "";
  return { src, fallback: local && local !== src ? local : undefined };
}
