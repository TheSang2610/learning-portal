// Anh trong noi dung bai chia se tai lieu - ham thuan, test duoc o CI.

/**
 * Bo moi <img> KHONG nam tren kho anh cua chinh he thong.
 *
 * Bai chia se do SINH VIEN viet (khac blog, chi admin viet), nen khong cho
 * nhung anh tu trang ngoai:
 *   - anh ngoai la "diem do": moi nguoi mo bai la mot request toi may chu la,
 *     lo IP va thoi diem doc cua ho;
 *   - anh ngoai doi noi dung duoc SAU khi bai qua kiem duyet.
 * Anh tai len qua POST /api/documents/anh thi nam o `prefix` (Cloudinary cua
 * du an) - chi giu nhung anh do.
 *
 * Chay SAU normalizeContent: luc do moi <img> da duoc sanitize-html viet lai
 * dang chuan (thuoc tinh trong nhay kep, khong co ">" trong gia tri), nen
 * bieu thuc chinh quy o day du tin cay.
 */
const filterExternalImages = (html, prefix) => {
    const s = String(html || '');
    if (!prefix) return s.replace(/<img\b[^>]*>/gi, '');
    return s.replace(/<img\b[^>]*>/gi, (card) => {
        const m = card.match(/\ssrc="([^"]*)"/i);
        return m && m[1].startsWith(prefix) ? card : '';
    });
};

/** Dem anh trong bai - gioi han so anh moi bai. */
const countImages = (html) => (String(html || '').match(/<img\b/gi) || []).length;

module.exports = { filterExternalImages, demAnh: countImages };
