/**
 * Thoi han hoc cua khoa CO PHI (10/10/2026).
 *
 * Khoa mien phi va khoa quan tri tang: expiresAt = null, hoc mai mai.
 * Khoa co phi: thanh toan xong duoc hoc `accessDays` ngay (mac dinh 30, quan tri
 * sua tung khoa). Mua lai khi CON han thi cong don vao han cu, khong mat ngay nao
 * da tra tien; mua lai khi DA het han thi tinh tu luc thanh toan.
 *
 * Ghi danh tao truoc ngay nay khong co expiresAt -> coi la khong gioi han: nguoi
 * ta da tra tien voi dieu kien "hoc mai mai", khong rut lai sau.
 */
const DEFAULT_ACCESS_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

const isExpired = (enrollment, now = new Date()) =>
    Boolean(enrollment && enrollment.expiresAt && new Date(enrollment.expiresAt) <= now);

/** Han moi khi thanh toan them `days` ngay. */
function extendExpiry(currentExpiry, days, now = new Date()) {
    const base = currentExpiry && new Date(currentExpiry) > now ? new Date(currentExpiry) : now;
    const n = Number.isFinite(Number(days)) && Number(days) > 0 ? Number(days) : DEFAULT_ACCESS_DAYS;
    return new Date(base.getTime() + n * DAY_MS);
}

/** Dieu kien Mongo: ghi danh con hieu luc (khong co han, hoac han chua toi). */
const activeFilter = (now = new Date()) => ({ $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] });

/** So ngay con lai (lam tron len), null khi khong gioi han. */
function daysLeft(enrollment, now = new Date()) {
    if (!enrollment || !enrollment.expiresAt) return null;
    return Math.max(0, Math.ceil((new Date(enrollment.expiresAt) - now) / DAY_MS));
}

module.exports = { DEFAULT_ACCESS_DAYS, DAY_MS, isExpired, extendExpiry, activeFilter, daysLeft };
