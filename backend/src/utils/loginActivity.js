const { vnDateKey } = require('./dailySeries');

/** Lenh cap nhat cho mot lan dang nhap. Tach rieng de kiem thu khong can CSDL. */
const buildUpdate = (method, now = new Date()) => ({
    $set: { lastAt: now, method },
    $inc: { count: 1 },
});

/**
 * Ghi nhan mot lan dang nhap that (password / google). KHONG await o noi goi:
 * day la so lieu phu, loi CSDL o day khong duoc lam hong viec dang nhap.
 *
 * Co y KHONG goi tu GET /users/profile: quay lai bang phien con han khong phai
 * la dang nhap - chi dang xuat roi dang nhap lai moi tinh them mot luot.
 */
const recordLogin = (userId, method) => {
    if (!userId) return Promise.resolve();
    // Nap muon: file nay con duoc kiem thu ma khong can ket noi Mongoose.
    const LoginActivity = require('../models/LoginActivity');
    const now = new Date();
    return LoginActivity.updateOne({ user: userId, day: vnDateKey(now) }, buildUpdate(method, now), {
        upsert: true,
    }).catch((err) => console.warn('[loginActivity]', err.message));
};

module.exports = { recordLogin, buildUpdate };
