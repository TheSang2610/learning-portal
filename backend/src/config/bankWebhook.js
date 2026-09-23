const crypto = require('crypto');

/**
 * Kiem danh tinh cua webhook bao co ngan hang.
 *
 * Duong webhook KHONG co dang nhap - ngan hang khong cam duoc cookie cua ai.
 * Nen thu duy nhat ngan mot nguoi la gui thang mot bao co gia de tu cong coin
 * cho minh chinh la khoa bi mat nay. Viet sai cho nay la mo cua cho in coin.
 *
 * BA QUY TAC O DAY, moi cai deu la mot lo hong da tung gap o cho khac:
 *
 * 1. CHUA DAT KHOA THI TU CHOI TAT CA. Khong duoc "chua cau hinh thi cho qua"
 *    cho tien. May chu moi deploy ma quen dat bien la ai cung nap duoc coin
 *    mien phi, va khong co dau hieu nao bao loi.
 *
 * 2. SO SANH BANG timingSafeEqual. So sanh bang === thoat ngay tai ky tu dau
 *    khac nhau, nen thoi gian phan hoi ro ri tung ky tu cua khoa. Do du nhieu
 *    lan la doan ra ca khoa.
 *
 * 3. KHONG BAO GIO IN KHOA RA LOG. Ke ca khi tu choi, ke ca trong thong bao
 *    loi - log cua Vercel nguoi khac doc duoc.
 */

const KHOA = process.env.WEBHOOK_NGAN_HANG_SECRET || '';

/** Da dat khoa chua? Chua dat thi controller tra 503 va khong xu ly gi. */
const daCauHinh = () => KHOA.length > 0;

/**
 * So sanh hai chuoi ma khong ro ri thoi gian.
 *
 * timingSafeEqual nem loi khi hai buffer khac do dai, nen phai chan do dai
 * truoc. Do dai khoa khong phai bi mat can giau.
 */
const bangNhau = (a, b) => {
    const x = Buffer.from(String(a || ''), 'utf8');
    const y = Buffer.from(String(b || ''), 'utf8');
    if (x.length !== y.length || x.length === 0) return false;
    return crypto.timingSafeEqual(x, y);
};

/**
 * Rut khoa ra khoi header cua request.
 *
 * SePay gui 'Authorization: Apikey <khoa>'. Casso va vai nha khac gui
 * 'Authorization: Bearer <khoa>' hoac mot header rieng. Nhan ca ba dang de
 * doi nha cung cap khong phai sua code.
 */
const layKhoaTuHeader = (req) => {
    const rieng = req.headers['x-webhook-secret'];
    if (rieng) return String(rieng).trim();

    const auth = String(req.headers.authorization || '').trim();
    if (!auth) return '';

    const khop = auth.match(/^(?:Apikey|Bearer)\s+(.+)$/i);
    return khop ? khop[1].trim() : auth;
};

/** Request nay co mang dung khoa khong? */
const hopLe = (req) => daCauHinh() && bangNhau(layKhoaTuHeader(req), KHOA);

module.exports = { daCauHinh, hopLe, bangNhau, layKhoaTuHeader };
