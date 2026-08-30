// Gioi han so lan dang nhap sai - chan do mat khau (brute force).
//
// Luu trong bo nho tien trinh: du cho 1 server dev/1 instance.
// Neu sau nay chay nhieu instance hoac serverless thi phai doi sang
// Redis hoac express-rate-limit + store dung chung, vi moi tien trinh
// se co bo dem rieng.

const WINDOW_MS = 15 * 60 * 1000; // 15 phut
const MAX_FAILS = 5;              // qua 5 lan sai thi khoa tam
const MAX_ENTRIES = 10000;        // tran bo nho neu bi spam ip/email

const attempts = new Map(); // key -> { count, firstAt, blockedUntil }

const keyOf = (req) => {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const email = String(req.body?.email || '').trim().toLowerCase();
  return `${ip}|${email}`;
};

// Don cac ban ghi da het han, tranh Map phinh vo han
const sweep = (now) => {
  for (const [k, v] of attempts) {
    if (now - v.firstAt > WINDOW_MS && (!v.blockedUntil || v.blockedUntil < now)) {
      attempts.delete(k);
    }
  }
};

const loginRateLimit = (req, res, next) => {
  const now = Date.now();
  if (attempts.size > MAX_ENTRIES) sweep(now);

  const key = keyOf(req);
  const rec = attempts.get(key);

  if (rec) {
    if (rec.blockedUntil && rec.blockedUntil > now) {
      const secondsLeft = Math.ceil((rec.blockedUntil - now) / 1000);
      res.set('Retry-After', String(secondsLeft));
      return res.status(429).json({
        message: `Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau ${Math.ceil(secondsLeft / 60)} phút.`,
        retryAfter: secondsLeft,
      });
    }
    // Het cua so dem thi lam moi lai
    if (now - rec.firstAt > WINDOW_MS) attempts.delete(key);
  }

  // Cho controller bao ket qua nguoc lai
  req.loginAttemptKey = key;
  next();
};

// Goi khi dang nhap SAI
const recordLoginFailure = (key) => {
  if (!key) return;
  const now = Date.now();
  const rec = attempts.get(key);

  if (!rec || now - rec.firstAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: now, blockedUntil: null });
    return;
  }

  rec.count += 1;
  if (rec.count >= MAX_FAILS) rec.blockedUntil = now + WINDOW_MS;
};

// Goi khi dang nhap DUNG -> xoa bo dem
const clearLoginAttempts = (key) => {
  if (key) attempts.delete(key);
};

module.exports = { loginRateLimit, recordLoginFailure, clearLoginAttempts };
