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
// Nguon: logo trong hop thong tin cua trang Wikipedia moi truong; SGU, TLU,
// FUNiX lay tu trang chu chinh thuc cua ho. IU va TechAcademy Vietnam khong tim
// duoc logo nen khong co mat o day - dai se bo qua hai don vi do.
export interface LogoDonVi {
  src: string;
  w: number;
  h: number;
}

export const LOGO_DON_VI: Record<string, LogoDonVi> = {
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
  ptit: { src: "/logos/ptit.png", w: 160, h: 160 },
  rmit: { src: "/logos/rmit.svg", w: 893, h: 314 },
  sgu: { src: "/logos/sgu.png", w: 160, h: 160 },
  tdtu: { src: "/logos/tdtu.png", w: 290, h: 160 },
  tlu: { src: "/logos/tlu.png", w: 735, h: 160 },
  uet: { src: "/logos/uet.svg", w: 149, h: 149 },
  uit: { src: "/logos/uit.svg", w: 869, h: 702 },
  vku: { src: "/logos/vku.png", w: 262, h: 160 },
};
