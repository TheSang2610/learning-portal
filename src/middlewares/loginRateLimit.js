// Gioi han so lan dang nhap sai - chan do mat khau.
//
// Dem theo HAI khoa cung luc, vi co hai kieu tan cong khac han nhau:
//
//   ip|email  Do mat khau cua MOT tai khoan. Nguong thap (5 lan).
//   ip        Thu MOT mat khau pho bien tren HANG NGHIN email khac nhau
//             (credential stuffing). Ban cu chi dem theo ip|email nen moi
//             email la mot bo dem moi tinh: kieu tan cong nay di qua tu do,
//             khong lan nao cham nguong.
//
// Nguong theo ip de cao hon nhieu, vi ca mot truong hoc / van phong co the
// dung chung mot IP qua NAT.
//
// Luu trong bo nho tien trinh: du cho mot instance. Chay nhieu instance hoac
// serverless thi phai doi sang Redis, vi moi tien trinh se co bo dem rieng.

const WINDOW_MS = 15 * 60 * 1000; // 15 phut
const MAX_FAILS_EMAIL = 5;        // sai qua 5 lan tren CUNG mot email
const MAX_FAILS_IP = 30;          // sai qua 30 lan tu CUNG mot IP, moi email
const MAX_ENTRIES = 10000;        // tran bo nho neu bi spam ip/email

const attempts = new Map(); // key -> { count, firstAt, blockedUntil }

// req.ip chi dung khi index.js da dat app.set('trust proxy', 1).
// Thieu dong do thi day la IP cua proxy, va moi khach chung mot o dem.
const ipOf = (req) => req.ip || req.socket?.remoteAddress || 'unknown';

const keysOf = (req) => {
  const ip = ipOf(req);
  const email = String(req.body?.email || '').trim().toLowerCase();
  return { theoEmail: `${ip}|${email}`, theoIp: `ip:${ip}` };
};

// Don cac ban ghi da het han, tranh Map phinh vo han
const sweep = (now) => {
  for (const [k, v] of attempts) {
    if (now - v.firstAt > WINDOW_MS && (!v.blockedUntil || v.blockedUntil < now)) {
      attempts.delete(k);
    }
  }
};

// Tra ve so giay con bi khoa, 0 neu khong bi khoa.
const conBiKhoa = (key, now) => {
  const rec = attempts.get(key);
  if (!rec) return 0;
  if (rec.blockedUntil && rec.blockedUntil > now) {
    return Math.ceil((rec.blockedUntil - now) / 1000);
  }
  // Het cua so dem thi lam moi lai
  if (now - rec.firstAt > WINDOW_MS) attempts.delete(key);
  return 0;
};

const ghiNhanSai = (key, nguong, now) => {
  const rec = attempts.get(key);

  if (!rec || now - rec.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now, blockedUntil: null });
    return;
  }

  rec.count += 1;
  if (rec.count >= nguong) rec.blockedUntil = now + WINDOW_MS;
};

const loginRateLimit = (req, res, next) => {
  const now = Date.now();
  if (attempts.size > MAX_ENTRIES) sweep(now);

  const keys = keysOf(req);
  const giayCon = Math.max(conBiKhoa(keys.theoEmail, now), conBiKhoa(keys.theoIp, now));

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

// Goi khi dang nhap SAI
const recordLoginFailure = (keys) => {
  if (!keys) return;
  const now = Date.now();
  ghiNhanSai(keys.theoEmail, MAX_FAILS_EMAIL, now);
  ghiNhanSai(keys.theoIp, MAX_FAILS_IP, now);
};

// Goi khi dang nhap DUNG.
//
// CHI xoa bo dem cua email do. KHONG dung bo dem theo IP: ke tan cong do trung
// mot tai khoan bat ky ma duoc lam moi han muc IP thi nguong kia thanh vo dung.
// Bo dem IP tu het han sau 15 phut.
const clearLoginAttempts = (keys) => {
  if (keys?.theoEmail) attempts.delete(keys.theoEmail);
};

// Chi dung cho test: xoa sach trang thai giua cac lan chay.
const _resetForTest = () => attempts.clear();

module.exports = {
  loginRateLimit,
  recordLoginFailure,
  clearLoginAttempts,
  _resetForTest,
  WINDOW_MS,
  MAX_FAILS_EMAIL,
  MAX_FAILS_IP,
};
