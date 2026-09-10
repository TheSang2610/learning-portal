// Gioi han so lan dang nhap sai - chan do mat khau.
//
// Dem theo BA khoa cung luc, vi co ba kieu tan cong khac han nhau:
//
//   ip|email  Do mat khau cua MOT tai khoan tu MOT may. Nguong thap (5 lan).
//
//   ip        Thu MOT mat khau pho bien tren HANG NGHIN email khac nhau
//             (credential stuffing). Ban dau chi dem theo ip|email nen moi
//             email la mot bo dem moi tinh: kieu tan cong nay di qua tu do,
//             khong lan nao cham nguong. Nguong theo ip de cao hon nhieu, vi
//             ca mot truong hoc / van phong co the dung chung mot IP qua NAT.
//
//   email     Do mat khau cua MOT tai khoan tu NHIEU may. LO HONG DA VA: khoa
//             `ip|email` cap cho moi dia chi IP mot han muc 5 lan RIENG, nen
//             ke tan cong co proxy hay botnet chi viec doi IP sau moi 4 lan
//             thu - vinh vien khong cham nguong nao, trong khi van do dung
//             mot nan nhan. Khoa nay dem tren rieng email, bat ke IP.
//
// DANH DOI cua khoa thu ba, ghi ro de nguoi doc sau khong tuong la sot: ke
// tan cong co the co tinh nhap sai 20 lan de khoa mot tai khoan trong 15 phut.
// Do la cai gia quen thuoc cua moi he thong co khoa theo tai khoan. Chon nhu
// vay vi mot lan khoa 15 phut la phien, con de mo cua cho do mat khau phan tan
// thi mat han tai khoan. Nguong 20 dat cao hon han muc mot IP (5) de nguoi
// dung that go nham vai lan khong the tu khoa minh.
//
// Bo dem KHONG con nam trong bo nho tien trinh nua - xem models/BoDemGioiHan.js
// de biet vi sao Map trong RAM gan nhu vo tac dung tren Vercel.

const { conBiKhoa, ghiNhanSai, xoaKhoa } = require('../utils/khoGioiHan');

const WINDOW_MS = 15 * 60 * 1000; // 15 phut
const MAX_FAILS_EMAIL = 5;        // sai qua 5 lan tren CUNG mot email, tu CUNG mot IP
const MAX_FAILS_IP = 30;          // sai qua 30 lan tu CUNG mot IP, moi email
const MAX_FAILS_TAI_KHOAN = 20;   // sai qua 20 lan tren CUNG mot email, moi IP

// req.ip chi dung khi index.js da dat app.set('trust proxy', 1).
// Thieu dong do thi day la IP cua proxy, va moi khach chung mot o dem.
const ipOf = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

// Tien to 'dangnhap:' vi kho dem la kho DUNG CHUNG: dang ky va doi mat khau
// cung ghi vao do. Thieu tien to thi mot IP bi khoa o duong dang ky se keo
// theo khoa luon duong dang nhap.
const keysOf = (req) => {
    const ip = ipOf(req);
    const email = String(req.body?.email || '').trim().toLowerCase();
    return {
        theoEmail: `dangnhap:${ip}|${email}`,
        theoIp: `dangnhap:ip:${ip}`,
        theoTaiKhoan: `dangnhap:email:${email}`,
    };
};

const loginRateLimit = async (req, res, next) => {
    const now = Date.now();
    const keys = keysOf(req);

    // Mot luot doc duy nhat cho ca ba khoa.
    const giayCon = await conBiKhoa(
        [keys.theoEmail, keys.theoIp, keys.theoTaiKhoan],
        now,
    );

    if (giayCon > 0) {
        res.set('Retry-After', String(giayCon));
        return res.status(429).json({
            message: `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${Math.ceil(giayCon / 60)} phút.`,
            retryAfter: giayCon,
        });
    }

    // Cho controller bao ket qua nguoc lai
    req.loginAttemptKey = keys;
    next();
};

// Goi khi dang nhap SAI.
//
// PHAI await o ben goi. Tren serverless, container co the bi dong bang ngay
// sau khi phan hoi duoc gui di: mot phep ghi chua await xong la mot lan sai
// khong bao gio duoc dem.
const recordLoginFailure = async (keys) => {
    if (!keys) return;
    const now = Date.now();

    // Ba khoa doc lap nhau nen ghi song song.
    await Promise.all([
        ghiNhanSai(keys.theoEmail, MAX_FAILS_EMAIL, WINDOW_MS, now),
        ghiNhanSai(keys.theoIp, MAX_FAILS_IP, WINDOW_MS, now),
        ghiNhanSai(keys.theoTaiKhoan, MAX_FAILS_TAI_KHOAN, WINDOW_MS, now),
    ]);
};

// Goi khi dang nhap DUNG.
//
// Xoa bo dem cua email do - ca khoa theo IP lan khoa theo rieng tai khoan. Muon
// xoa duoc khoa theo tai khoan thi phai dang nhap dung vao chinh tai khoan do,
// nen ke tan cong khong loi dung duoc.
//
// KHONG dung toi bo dem theo IP: ke tan cong do trung mot tai khoan bat ky ma
// duoc lam moi han muc IP thi nguong kia thanh vo dung. Bo dem IP tu het han
// sau 15 phut.
const clearLoginAttempts = async (keys) => {
    if (!keys) return;
    await Promise.all([
        xoaKhoa(keys.theoEmail),
        xoaKhoa(keys.theoTaiKhoan),
    ]);
};

module.exports = {
    loginRateLimit,
    recordLoginFailure,
    clearLoginAttempts,
    WINDOW_MS,
    MAX_FAILS_EMAIL,
    MAX_FAILS_IP,
    MAX_FAILS_TAI_KHOAN,
};
