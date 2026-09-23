/**
 * Loc HTML cua bai viet.
 *
 * Truoc day o nay chi nhan van ban tho. Gio nguoi viet dan duoc ca doan HTML
 * tu trang bao vao, nen phai coi MOI thu gui len la doc: mot the <script> lot
 * qua la ai doc bai cung chay ma nguoi khac viet, va bai viet thi ai vao
 * /blog cung doc.
 *
 * Nguyen tac: DANH SACH TRANG. The nao khong co ten trong danh sach thi bo,
 * thuoc tinh nao khong co ten thi bo. Them the moi phai sua file nay - dung
 * y do, de khong ai vo tinh mo cua.
 */

const sanitizeHtml = require('sanitize-html');

// Nhung the lam nen mot bai bao: de muc, doan, danh sach, anh co chu thich,
// bang, trich dan, code.
const THE_CHO_PHEP = [
    'h1', 'h2', 'h3', 'h4',
    'p', 'br', 'hr',
    'strong', 'b', 'em', 'i', 'u', 's', 'sup', 'sub', 'mark',
    'blockquote',
    'ul', 'ol', 'li',
    'a', 'img', 'figure', 'figcaption',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'code', 'pre',
    // <span> khong dung de trinh bay - no la cho ha canh cua the <a> co dia
    // chi khong hop le (xem transformTags). PHAI nam trong danh sach trang:
    // doi the sang mot ten KHONG duoc phep lam roi ngan xep the cua thu vien,
    // no nho mot the dong roi nha ra sai cho, sinh </span> lac giua bai.
    'span',
];

// Thuoc tinh: chi giu cai mang NGHIA. Bo sach class, style va id.
//
//   style  -> chan duoc ca kieu tan cong dua vao CSS lan bai dan vao vo hinh
//             (mau chu trang tren nen trang, position: fixed de len giao dien).
//   class  -> class cua trang bao khong co nghia gi o day, giu lai chi lam
//             nang bai. Giao dien tu lo trinh bay bang CSS cua minh.
//   id     -> neo muc luc do trang doc tu sinh, de nguoi dan tu dat thi trung
//             id voi phan tu that cua trang.
const THUOC_TINH_CHO_PHEP = {
    a: ['href', 'title'],
    img: ['src', 'alt', 'width', 'height'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
};

// Bo CA NOI DUNG ben trong, khong chi cai the. Mac dinh cua thu vien la giu
// lai phan chu ben trong the bi loai - dung cho <div> nhung sai cho <script>:
// se con lai nguyen doan ma JavaScript nam tho lo giua bai.
const THE_BO_CA_RUOT = [
    'script', 'style', 'noscript', 'iframe', 'object', 'embed',
    'template', 'textarea', 'option', 'svg', 'canvas', 'form',
];

// Doan HTML cua bao mang theo ca khoi quang cao. Chung khong phai the hop le
// nen buoc loc ben duoi se bo the, NHUNG giu lai chu ben trong - the la bai
// viet dinh nhung dong roi nhu "ADVERTISING", "iTVC from Admicro".
//
// Nen phai cat truoc ca cum. Cat bang bieu thuc chinh quy o day AN TOAN vi no
// chay TRUOC buoc loc: no chi lam bai sach hon, con quyet dinh cai gi duoc
// phep ton tai van la cua sanitize-html ben duoi.
const CUM_RAC = [
    /<script\b[\s\S]*?<\/script\s*>/gi,
    /<style\b[\s\S]*?<\/style\s*>/gi,
    /<noscript\b[\s\S]*?<\/noscript\s*>/gi,
    /<iframe\b[\s\S]*?<\/iframe\s*>/gi,
    /<svg\b[\s\S]*?<\/svg\s*>/gi,
    // <zone> la the rieng cua he thong quang cao Admicro, khong co trong HTML.
    /<zone\b[\s\S]*?<\/zone\s*>/gi,
    // Chu thich HTML: hay chua ma dieu kien cua trinh duyet cu.
    /<!--[\s\S]*?-->/g,
];

/** Doan xem nguoi viet go van ban thuong hay dan HTML vao. */
function laHtml(chuoi) {
    return /<(h[1-4]|p|div|section|article|ul|ol|li|figure|img|blockquote|table|br|strong|em|a)\b[^>]*>/i
        .test(String(chuoi || ''));
}

/** Rut lay chu tran de dem tu va cho qua bo loc tu ngu. */
function boThe(html) {
    return String(html || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

function lamSachHtml(tho) {
    let html = String(tho || '');
    for (const re of CUM_RAC) html = html.replace(re, '');

    html = sanitizeHtml(html, {
        allowedTags: THE_CHO_PHEP,
        allowedAttributes: THUOC_TINH_CHO_PHEP,
        nonTextTags: THE_BO_CA_RUOT,

        // Chi ba giao thuc nay. Quan trong nhat la CHAN 'data:' va
        // 'javascript:': <img src="data:image/svg+xml,..."> nhet duoc ma vao
        // vi SVG chay script duoc.
        allowedSchemes: ['http', 'https', 'mailto'],
        allowProtocolRelative: false,
        // Anh cung chi tu http/https - khong mo data: cho rieng anh.
        allowedSchemesAppliedToAttributes: ['href', 'src'],

        transformTags: {
            // Lien ket ra ngoai luon mo tab moi va gan rel: noopener chan trang
            // dich voi tay lai window.opener cua minh, nofollow de khong tiep
            // suc SEO cho bai dan bua.
            //
            // The <a> khong co dia chi hop le thi doi thanh <span> tron -
            // giu nguyen chu, chi mat cai neo. Bo thang ca the thi cau van
            // thung mot tu. Day cung la cho chan javascript: chu khong doi
            // den buoc loc dia chi, vi transformTags chay truoc buoc do.
            a: (tenThe, thuocTinh) => {
                const dia = String(thuocTinh.href || '').trim();
                if (!/^(https?:\/\/|mailto:|\/|#)/i.test(dia)) {
                    return { tagName: 'span', attribs: {} };
                }
                return {
                    tagName: 'a',
                    attribs: {
                        href: dia,
                        ...(thuocTinh.title ? { title: thuocTinh.title } : {}),
                        target: '_blank',
                        rel: 'nofollow noopener noreferrer',
                    },
                };
            },
            // Anh trong bai luon tai muon: bai dai chuc tam anh ma tai het mot
            // luot thi nguoi doc cho trang trang.
            img: sanitizeHtml.simpleTransform('img', { loading: 'lazy' }),
        },
        // transformTags them thuoc tinh nen phai khai cho phep, neu khong
        // chinh buoc loc lai go ra.
        allowedAttributes: {
            ...THUOC_TINH_CHO_PHEP,
            a: ['href', 'title', 'target', 'rel'],
            img: ['src', 'alt', 'width', 'height', 'loading'],
        },

        // Anh mat dia chi (vi dung data: hoac dan thieu) chi con la o trong,
        // bo han.
        exclusiveFilter: (khoi) => khoi.tag === 'img' && !khoi.attribs.src,
    });

    return donDep(html);
}

/**
 * Don not con lai sau khi loc.
 *
 * Cat mot khoi quang cao di thuong de lai cai vo rong: <p></p>, <figure> mat
 * anh, ba the <br> lien tiep. De nguyen thi bai viet day khoang trong kho hieu.
 */
function donDep(html) {
    return html
        .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
        .replace(/<figure>(\s|<figcaption>\s*<\/figcaption>)*<\/figure>/gi, '')
        .replace(/<figcaption>\s*<\/figcaption>/gi, '')
        .replace(/(?:\s*<br\s*\/?>\s*){3,}/gi, '<br /><br />')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

/**
 * Dau hieu doc, du KHONG co the nao trong danh sach cua laHtml().
 *
 * laHtml() tra loi cau "co phai bai viet khong", va danh sach the cua no chi
 * gom the trinh bay - khong co 'script' hay 'iframe'. Hop ly cho viec nhan
 * dang, nhung neu lay no lam cong bao mat thi thung: chuoi
 * "<script>...</script>" khong khop the nao trong danh sach, bi coi la van ban
 * thuong va di thang vao co so du lieu NGUYEN VEN.
 *
 * Hien tai giao dien dung dung mot bieu thuc do nen no cung ve ra chu, chua
 * chay. Nhung do la hai ban sao o hai kho ma nguon khac nhau phai giong het
 * nhau moi an toan - ai sua mot ben la thung. Va ma doc con nam trong CSDL,
 * cho bat ky cho nao khac doc ra roi do thang.
 *
 * Nen: thay vi hoi "co giong bai viet khong", cho nay hoi them "co mui nguy
 * hiem khong". Co thi loc, bat ke trong giong gi.
 */
const CO_MUI_NGUY_HIEM =
    /<\s*\/?\s*(script|iframe|object|embed|svg|math|style|link|meta|base|form|noscript|template)\b|\son\w+\s*=|javascript\s*:|data\s*:\s*text\/html/i;

/**
 * Chuan hoa noi dung truoc khi luu.
 *
 * Van ban thuong giu NGUYEN VAN - khong day qua bo loc, vi sanitize-html se
 * doi '<' thanh '&lt;' va nguoi doc se thay dung chu "&lt;" tren man hinh
 * (trang doc ve van ban thuong bang React, khong dien giai thuc the).
 * Do chinh la ly do cho nay phai co dieu kien chu khong loc tat.
 */
function chuanHoaNoiDung(tho) {
    const s = String(tho || '').trim();
    return laHtml(s) || CO_MUI_NGUY_HIEM.test(s) ? lamSachHtml(s) : s;
}

module.exports = { laHtml, boThe, lamSachHtml, chuanHoaNoiDung, CO_MUI_NGUY_HIEM };
