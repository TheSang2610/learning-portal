// Bo gioi han tan suat dung chung, dem theo IP.
//
// Khac loginRateLimit.js o cho: cai kia chi dem lan SAI (dang nhap dung thi
// khong tinh), con cai nay dem MOI luot goi. Dung cho nhung duong ma ban than
// viec goi nhieu da la van de - dang ky hang loat chang han.
//
// Bo dem nam trong kho dung chung utils/khoGioiHan.js, khong con la Map trong
// bo nho tien trinh. Ly do o models/BoDemGioiHan.js: tren Vercel, Map trong
// RAM la bo dem rieng cua tung lambda instance nen nguong gan nhu khong chan
// duoc gi.

const { tang } = require('../utils/khoGioiHan');

const ipOf = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

/**
 * @param {object} cauHinh
 * @param {string} cauHinh.ten    Tien to khoa, phan biet cac bo dem voi nhau
 * @param {number} cauHinh.soLan   So luot toi da trong mot cua so
 * @param {number} cauHinh.cuaSoMs Do dai cua so, tinh bang mili giay
 * @param {string} cauHinh.thongBao Cau bao cho nguoi dung khi cham nguong
 */
const gioiHan = ({ ten, soLan, cuaSoMs, thongBao }) => {
    // Kho dem dung chung cho ca du an, nen thieu tien to la hai bo dem khac
    // nhau ghi de len nhau: bi chan o duong dang ky se keo theo chan luon
    // duong dang nhap. Nem ngay luc khoi tao de khong ai kip deploy nham.
    if (!ten) throw new Error('gioiHan: thieu `ten` de dat tien to khoa');

    return async (req, res, next) => {
        const now = Date.now();
        const khoa = `${ten}:${ipOf(req)}`;

        const rec = await tang(khoa, cuaSoMs, now);

        if (rec.count > soLan) {
            const giayCon = Math.max(1, Math.ceil((rec.expiresAt - now) / 1000));
            res.set('Retry-After', String(giayCon));
            return res.status(429).json({ message: thongBao, retryAfter: giayCon });
        }

        next();
    };
};

module.exports = { gioiHan };
