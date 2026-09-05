// Xu ly bai viet duoc soan bang HTML.
//
// Bai cu la van ban tho, tach khoi bang articleOutline.ts. Bai moi co the la
// HTML that (h2, p, figure, img...). Hai kieu song song, phan biet bang laHtml.
// Bai cu KHONG bi dung toi - khong phai chuyen doi gi ca.
//
// Chia ro hai vai:
//   neoHoaTieuDe  chay ca tren may chu lan trinh duyet, tren HTML DA duoc may
//                 chu loc. Dung bieu thuc chinh quy la du va phai the: may chu
//                 khong co DOM.
//   lamSachHtml   CHI chay tren trinh duyet, cho o xem truoc trong trang quan
//                 tri. Day la luoi thu hai cho de nhin, con luoi that nam o
//                 backend/src/utils/htmlBaiViet.js - cai quyet dinh thu gi
//                 duoc luu vao co so du lieu.

import { slugHoa, type OutlineItem } from "./articleOutline";

/** Nguoi viet go van ban thuong hay dan HTML vao? */
export function laHtml(chuoi: string): boolean {
  return /<(h[1-4]|p|div|section|article|ul|ol|li|figure|img|blockquote|table|br|strong|em|a)\b[^>]*>/i.test(
    String(chuoi || ""),
  );
}

/** Rut chu tran ra khoi HTML - de dem tu, cat mo ta, cho qua bo loc. */
export function boThe(html: string): string {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const RE_TIEU_DE = /<h([1-4])\b([^>]*)>([\s\S]*?)<\/h\1\s*>/gi;

/**
 * Gan id vao tung the tieu de va tra ve muc luc di kem.
 *
 * Muc luc va than bai PHAI sinh ra cung mot luot: neo <a href="#..."> chi nhay
 * duoc khi id trong bai trung tuyet doi voi id trong muc luc. Tach ra hai ham
 * chay hai lan la co ngay canh menu bam khong an.
 *
 * Bac muc luc tinh TUONG DOI. Bai chep tu bao thuong chi dung h2 va h3, khong
 * co h1 (h1 la tieu de trang). Neu cu h1 = bac 1 thi ca muc luc bai do bi thut
 * vao het, trong nhu dang thieu muc cha. Nen lay the nho nhat co mat lam bac 1.
 */
export function neoHoaTieuDe(html: string): { html: string; mucLuc: OutlineItem[] } {
  const nguon = String(html || "");

  const capCoMat: number[] = [];
  for (const m of nguon.matchAll(RE_TIEU_DE)) capCoMat.push(Number(m[1]));
  if (!capCoMat.length) return { html: nguon, mucLuc: [] };
  const capGoc = Math.min(...capCoMat);

  const mucLuc: OutlineItem[] = [];
  const daDung = new Map<string, number>();

  const raHtml = nguon.replace(RE_TIEU_DE, (nguyen, capStr, thuocTinh, ben) => {
    const chu = boThe(String(ben));
    if (!chu) return nguyen;

    const goc = slugHoa(chu);
    const lan = (daDung.get(goc) ?? 0) + 1;
    daDung.set(goc, lan);
    const id = lan === 1 ? goc : `${goc}-${lan}`;

    const bac = Math.min(3, Number(capStr) - capGoc + 1) as 1 | 2 | 3;
    mucLuc.push({ id, text: chu, level: bac });

    // Go id cu neu doan dan vao co san, roi gan id cua minh.
    const conLai = String(thuocTinh).replace(/\s+id\s*=\s*("[^"]*"|'[^']*'|\S+)/gi, "");
    return `<h${capStr}${conLai} id="${id}">${ben}</h${capStr}>`;
  });

  return { html: raHtml, mucLuc };
}

// ---------------------------------------------------------------------------
// Duoi day chi chay tren trinh duyet.
// ---------------------------------------------------------------------------

const THE_CHO_PHEP = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "p",
  "br",
  "hr",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "sup",
  "sub",
  "mark",
  "span",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "figure",
  "figcaption",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "code",
  "pre",
]);

// Bo CA phan chu ben trong, khong chi cai the.
const BO_CA_RUOT = new Set([
  "script",
  "style",
  "noscript",
  "iframe",
  "object",
  "embed",
  "template",
  "textarea",
  "select",
  "form",
  "svg",
  "canvas",
  "zone",
]);

const THUOC_TINH_CHO_PHEP: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "width", "height", "loading"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
};

const DIA_CHI_HOP_LE = /^(https?:\/\/|mailto:|\/|#)/i;

function donNut(nut: Element): void {
  // Xu ly con TRUOC. Go the cha ra thi con nhay len thay cho, da soat roi nen
  // khong bi soat lai hay bi bo sot.
  Array.from(nut.children).forEach(donNut);

  const ten = nut.tagName.toLowerCase();

  if (BO_CA_RUOT.has(ten)) {
    nut.remove();
    return;
  }

  if (!THE_CHO_PHEP.has(ten)) {
    // Go the, giu chu. <div>, <section>, <font> cua trang bao roi het o day.
    nut.replaceWith(...Array.from(nut.childNodes));
    return;
  }

  for (const thuoc of Array.from(nut.attributes)) {
    if (!(THUOC_TINH_CHO_PHEP[ten] ?? []).includes(thuoc.name.toLowerCase())) {
      nut.removeAttribute(thuoc.name);
    }
  }

  if (ten === "a") {
    const dia = (nut.getAttribute("href") || "").trim();
    if (!DIA_CHI_HOP_LE.test(dia)) {
      nut.replaceWith(...Array.from(nut.childNodes));
      return;
    }
    nut.setAttribute("target", "_blank");
    nut.setAttribute("rel", "nofollow noopener noreferrer");
  }

  if (ten === "img") {
    const dia = (nut.getAttribute("src") || "").trim();
    if (!/^https?:\/\//i.test(dia)) {
      nut.remove();
      return;
    }
    nut.setAttribute("loading", "lazy");
  }
}

function donDep(html: string): string {
  return html
    .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/<figure>\s*<\/figure>/gi, "")
    .replace(/<figcaption>\s*<\/figcaption>/gi, "")
    .replace(/(?:\s*<br\s*\/?>\s*){3,}/gi, "<br><br>")
    .trim();
}

/**
 * Don doan HTML dan tu web: bo script, khung quang cao, class va style cua
 * trang nguon. Ket qua gan dung voi cai may chu se luu.
 */
export function lamSachHtml(tho: string): string {
  if (typeof window === "undefined") return String(tho || "");

  // DOMParser dung tai lieu ROI, khong gan vao trang dang mo: anh khong tai,
  // script khong chay. Khac han innerHTML cua mot the that.
  const tl = new DOMParser().parseFromString(String(tho || ""), "text/html");
  Array.from(tl.body.children).forEach(donNut);
  return donDep(tl.body.innerHTML);
}
