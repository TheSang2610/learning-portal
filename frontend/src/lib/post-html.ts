// Xu ly bai viet duoc soan bang HTML.
//
// Bai cu la van ban tho, tach khoi bang articleOutline.ts. Bai moi co the la
// HTML that (h2, p, figure, img...). Hai kieu song song, phan biet bang laHtml.
// Bai cu KHONG bi dung toi - khong phai chuyen doi gi ca.
//
// Chia ro hai vai:
//   anchorizeHeadings  chay ca tren may chu lan trinh duyet, tren HTML DA duoc may
//                 chu loc. Dung bieu thuc chinh quy la du va phai the: may chu
//                 khong co DOM.
//   cleanHtml   CHI chay tren trinh duyet, cho o xem truoc trong trang quan
//                 tri. Day la luoi thu hai cho de nhin, con luoi that nam o
//                 backend/src/utils/postHtml.js - cai quyet dinh thu gi
//                 duoc luu vao co so du lieu.

import { slugHoa, type OutlineItem } from "./article-outline";

/** Nguoi viet go van ban thuong hay dan HTML vao? */
export function laHtml(chuoi: string): boolean {
  return /<(h[1-4]|p|div|section|article|ul|ol|li|figure|img|blockquote|table|br|strong|em|a)\b[^>]*>/i.test(
    String(chuoi || ""),
  );
}

/** Rut chu tran ra khoi HTML - de dem tu, cat mo ta, cho qua bo loc. */
export function stripTags(html: string): string {
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

/**
 * Doan tom tat cho the danh sach: GIU in dam / nghieng / gach chan, bo moi the
 * khac (p, h2, ul, a, img...) thanh khoang trang de ca bai chay thanh mot dong
 * lien, cat 2 dong bang CSS.
 *
 * Viet bang bieu thuc chinh quy chu khong dung cleanHtml: ham nay phai ra
 * DUNG MOT KET QUA o may chu va trinh duyet (cleanHtml o may chu tra nguyen
 * chuoi -> lech khi React hydrate). Va no an toan ma khong can DOM: chi 6 the
 * tran khong thuoc tinh duoc giu, moi dau "<" con sot deu bi doi thanh &lt; -
 * nen ke ca du lieu cu chua qua loc cua may chu cung khong chen duoc the nao.
 * Thuc the (&amp;, &gt;...) giu nguyen de trinh duyet tu hien dung ky tu.
 */
export function summaryHtml(html: string): string {
  const GIU = /^<\/?(strong|b|em|i|u|s)>$/i;
  return (
    String(html || "")
      // The that bat dau bang chu cai va khong chua "<" ben trong - de "1 < 2 va
      // <b>" khong bi coi ca cum la mot the va nuot mat chu.
      .replace(/<\/?[a-z][^<>]*>/gi, (card) =>
        GIU.test(card) ? card.toLowerCase() : " ",
      )
      .replace(/<(?!\/?(strong|b|em|i|u|s)>)/gi, "&lt;")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

const HEADING_PATTERN = /<h([1-4])\b([^>]*)>([\s\S]*?)<\/h\1\s*>/gi;

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
export function anchorizeHeadings(html: string): {
  html: string;
  outline: OutlineItem[];
} {
  const source = String(html || "");

  const grantWithAttrs: number[] = [];
  for (const m of source.matchAll(HEADING_PATTERN)) grantWithAttrs.push(Number(m[1]));
  if (!grantWithAttrs.length) return { html: source, outline: [] };
  const baseGrant = Math.min(...grantWithAttrs);

  const outline: OutlineItem[] = [];
  const used = new Map<string, number>();

  const raHtml = source.replace(HEADING_PATTERN, (nguyen, clipString, attrs, ben) => {
    const text = stripTags(String(ben));
    if (!text) return nguyen;

    const origin = slugHoa(text);
    const attempts = (used.get(origin) ?? 0) + 1;
    used.set(origin, attempts);
    const id = attempts === 1 ? origin : `${origin}-${attempts}`;

    const bac = Math.min(3, Number(clipString) - baseGrant + 1) as 1 | 2 | 3;
    outline.push({ id, text: text, level: bac });

    // Go id cu neu doan dan vao co san, roi gan id cua minh.
    const remaining = String(attrs).replace(/\s+id\s*=\s*("[^"]*"|'[^']*'|\S+)/gi, "");
    return `<h${clipString}${remaining} id="${id}">${ben}</h${clipString}>`;
  });

  return { html: raHtml, outline };
}

// ---------------------------------------------------------------------------
// Duoi day chi chay tren trinh duyet.
// ---------------------------------------------------------------------------

const ALLOWED_TAGS = new Set([
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
const STRIP_WITH_CONTENT = new Set([
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

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "width", "height", "loading"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
};

const VALID_URL = /^(https?:\/\/|mailto:|\/|#)/i;

function unwrapButton(button: Element): void {
  // Xu ly con TRUOC. Go the cha ra thi con nhay len thay cho, da soat roi nen
  // khong bi soat lai hay bi bo sot.
  Array.from(button.children).forEach(unwrapButton);

  const name = button.tagName.toLowerCase();

  if (STRIP_WITH_CONTENT.has(name)) {
    button.remove();
    return;
  }

  if (!ALLOWED_TAGS.has(name)) {
    // Go the, giu chu. <div>, <section>, <font> cua trang bao roi het o day.
    button.replaceWith(...Array.from(button.childNodes));
    return;
  }

  for (const thuoc of Array.from(button.attributes)) {
    if (!(ALLOWED_ATTRS[name] ?? []).includes(thuoc.name.toLowerCase())) {
      button.removeAttribute(thuoc.name);
    }
  }

  if (name === "a") {
    const address = (button.getAttribute("href") || "").trim();
    if (!VALID_URL.test(address)) {
      button.replaceWith(...Array.from(button.childNodes));
      return;
    }
    button.setAttribute("target", "_blank");
    button.setAttribute("rel", "nofollow noopener noreferrer");
  }

  if (name === "img") {
    const address = (button.getAttribute("src") || "").trim();
    if (!/^https?:\/\//i.test(address)) {
      button.remove();
      return;
    }
    button.setAttribute("loading", "lazy");
  }
}

function cleanup(html: string): string {
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
export function cleanHtml(tho: string): string {
  if (typeof window === "undefined") return String(tho || "");

  // DOMParser dung tai lieu ROI, khong gan vao trang dang mo: anh khong tai,
  // script khong chay. Khac han innerHTML cua mot the that.
  const tl = new DOMParser().parseFromString(String(tho || ""), "text/html");
  Array.from(tl.body.children).forEach(unwrapButton);
  return cleanup(tl.body.innerHTML);
}
