const crypto = require('crypto');

/**
 * Kiem danh tinh cua webhook bao co ngan hang.
 *
 * Duong webhook KHONG co dang nhap - ngan hang khong cam duoc cookie cua ai.
 * Nen thu duy nhat ngan mot nguoi gui thang mot bao co gia de tu mo khoa hoc
 * co phi cho minh chinh la khoa bi mat nay. Viet sai cho nay la mo khoa free
 * cho bat ky ai.
 *
 * BA QUY TAC O DAY, moi cai deu la mot lo hong da tung gap o cho khac:
 *
 * 1. CHUA DAT KHOA THI TU CHOI TAT CA. Khong duoc "chua cau hinh thi cho qua"
 *    cho tien. May chu moi deploy ma quen dat bien la ai cung mo duoc khoa
 *    mien phi, va khong co dau hieu nao bao loi.
 *
 * 2. SO SANH BANG timingSafeEqual. So sanh bang === thoat ngay tai ky tu dau
 *    khac nhau, nen thoi gian phan hoi ro ri tung ky tu cua khoa. Do du nhieu
 *    lan la doan ra ca khoa.
 *
 * 3. KHONG BAO GIO IN KHOA RA LOG. Ke ca khi tu choi, ke ca trong thong bao
 *    loi - log cua Vercel nguoi khac doc duoc.
 */

// CASSO_WEBHOOK_SECRET cung ten voi infinity-store; WEBHOOK_NGAN_HANG_SECRET la
// ten chung (dang dat tren Vercel). Ca Casso lan SePay deu dung khoa nay.
const KEY = process.env.CASSO_WEBHOOK_SECRET || process.env.WEBHOOK_NGAN_HANG_SECRET || '';

/** Da dat khoa chua? Chua dat thi controller tra 503 va khong xu ly gi. */
const isConfigured = () => KEY.length > 0;

/**
 * So sanh hai chuoi ma khong ro ri thoi gian.
 *
 * timingSafeEqual nem loi khi hai buffer khac do dai, nen phai chan do dai
 * truoc. Do dai khoa khong phai bi mat can giau.
 */
const safeEqual = (a, b) => {
    const x = Buffer.from(String(a || ''), 'utf8');
    const y = Buffer.from(String(b || ''), 'utf8');
    if (x.length !== y.length || x.length === 0) return false;
    return crypto.timingSafeEqual(x, y);
};

/**
 * Rut khoa ra khoi header cua request. Nhan hai nha cung cap, CUNG mot khoa:
 *
 *   Casso : header 'secure-token: <khoa>' (o "Secure Token" khi tao webhook)
 *   SePay : header 'Authorization: Apikey <khoa>' (kieu chung thuc "API Key")
 *
 * 22/10/2026: sang bo SePay de chi dung Casso, chieu cung ngay chu du an
 * chuyen sang SePay - nen nhan ca hai, doi qua lai khong phai sua code.
 */
const getKeyFromHeader = (req) => {
    const casso = String(req.headers['secure-token'] || '').trim();
    if (casso) return casso;
    const auth = String(req.headers.authorization || '').trim();
    const sepay = auth.match(/^Apikey\s+(.+)$/i);
    return sepay ? sepay[1].trim() : '';
};

/** Request nay co mang dung khoa khong? */
const isValid = (req) => isConfigured() && safeEqual(getKeyFromHeader(req), KEY);

module.exports = { daCauHinh: isConfigured, isValid, safeEqual, getKeyFromHeader };
