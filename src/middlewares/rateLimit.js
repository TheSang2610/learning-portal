// Bo gioi han tan suat dung chung, dem theo IP.
//
// Khac loginRateLimit.js o cho: cai kia chi dem lan SAI (dang nhap dung thi
// khong tinh), con cai nay dem MOI luot goi. Dung cho nhung duong ma ban than
// viec goi nhieu da la van de - dang ky hang loat chang han.
//
// Luu trong bo nho tien trinh, xem ghi chu ve nhieu instance o loginRateLimit.js.

const MAX_ENTRIES = 10000;

const taoBoDem = () => new Map();

const ipOf = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

/**
 * @param {object} cauHinh
 * @param {number} cauHinh.soLan   So luot toi da trong mot cua so
 * @param {number} cauHinh.cuaSoMs Do dai cua so, tinh bang mili giay
 * @param {string} cauHinh.thongBao Cau bao cho nguoi dung khi cham nguong
 */
const gioiHan = ({ soLan, cuaSoMs, thongBao }) => {
    const bo = taoBoDem();

    return (req, res, next) => {
        const now = Date.now();

        // Don ban ghi het han khi bo dem phinh to
        if (bo.size > MAX_ENTRIES) {
            for (const [k, v] of bo) {
                if (now - v.firstAt > cuaSoMs) bo.delete(k);
            }
        }

        const key = ipOf(req);
        const rec = bo.get(key);

        if (!rec || now - rec.firstAt > cuaSoMs) {
            bo.set(key, { count: 1, firstAt: now });
            return next();
        }

        rec.count += 1;

        if (rec.count > soLan) {
            const giayCon = Math.ceil((rec.firstAt + cuaSoMs - now) / 1000);
            res.set('Retry-After', String(giayCon));
            return res.status(429).json({ message: thongBao, retryAfter: giayCon });
        }

        next();
    };
};

module.exports = { gioiHan };
