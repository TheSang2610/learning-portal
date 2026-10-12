// Bo gioi han tan suat dung chung, dem theo IP.
//
// Khac loginRateLimit.js o cho: cai kia chi dem lan SAI (dang nhap dung thi
// khong tinh), con cai nay dem MOI luot goi. Dung cho nhung duong ma ban than
// viec goi nhieu da la van de - dang ky hang loat chang han.
//
// Bo dem nam trong kho dung chung utils/rateLimitStore.js, khong con la Map trong
// bo nho tien trinh. Ly do o models/RateLimitCounter.js: tren Vercel, Map trong
// RAM la bo dem rieng cua tung lambda instance nen nguong gan nhu khong chan
// duoc gi.

const { tang: increment } = require('../utils/rateLimitStore');

const ipOf = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

/**
 * @param {object} cauHinh
 * @param {string} cauHinh.ten    Tien to khoa, phan biet cac bo dem voi nhau
 * @param {number} cauHinh.hits   So luot toi da trong mot cua so
 * @param {number} cauHinh.windowMs Do dai cua so, tinh bang mili giay
 * @param {string} cauHinh.thongBao Cau bao cho nguoi dung khi cham nguong
 */
const limit = ({ ten: name, hits, windowMs, thongBao: notification }) => {
    // Kho dem dung chung cho ca du an, nen thieu tien to la hai bo dem khac
    // nhau ghi de len nhau: bi chan o duong dang ky se keo theo chan luon
    // duong dang nhap. Nem ngay luc khoi tao de khong ai kip deploy nham.
    if (!name) throw new Error('gioiHan: thieu `ten` de dat tien to khoa');

    return async (req, res, next) => {
        const now = Date.now();
        const course = `${name}:${ipOf(req)}`;

        const rec = await increment(course, windowMs, now);

        if (rec.count > hits) {
            const secondsLeft = Math.max(1, Math.ceil((rec.expiresAt - now) / 1000));
            res.set('Retry-After', String(secondsLeft));
            return res.status(429).json({ message: notification, retryAfter: secondsLeft });
        }

        next();
    };
};

module.exports = { limit };
