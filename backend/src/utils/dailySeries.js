// Chuoi so lieu theo NGAY cho bieu do o dashboard admin.
//
// Ngay tinh theo gio Viet Nam (UTC+7, khong doi gio mua he): CSDL luu UTC,
// mot dang ky luc 6 gio sang ngay 15 la 23 gio ngay 14 theo UTC - gom theo UTC
// thi cot ngay 14 bi tinh nham.

const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** "YYYY-MM-DD" theo gio Viet Nam. */
const vnDateKey = (date) => new Date(new Date(date).getTime() + VN_OFFSET_MS).toISOString().slice(0, 10);

/**
 * Danh sach `days` ngay lien tiep, ket thuc o hom nay (gio VN), moi ngay mot
 * dong { date, ...series } - ngay khong co ban ghi thi la 0.
 *
 * @param series  { ten: [{ _id: "YYYY-MM-DD", count }] } - ket qua $group theo ngay.
 */
const buildDailySeries = (series, days, now = new Date()) => {
    const n = Math.min(Math.max(parseInt(days, 10) || 90, 1), 366);
    const tables = Object.fromEntries(
        Object.entries(series || {}).map(([name, rows]) => [
            name,
            new Map((Array.isArray(rows) ? rows : []).map((r) => [String(r._id), Number(r.count) || 0])),
        ])
    );

    const out = [];
    for (let i = n - 1; i >= 0; i--) {
        const date = vnDateKey(now.getTime() - i * DAY_MS);
        const row = { date };
        for (const [name, table] of Object.entries(tables)) row[name] = table.get(date) || 0;
        out.push(row);
    }
    return out;
};

/**
 * Tong `window` ngay cuoi va `window` ngay ngay truoc do cua mot cot, kem %
 * thay doi. Ky truoc bang 0 thi % la null (khong chia cho 0 - giao dien ghi "moi").
 */
const compareWindows = (rows, key, window = 30) => {
    const list = Array.isArray(rows) ? rows : [];
    const sum = (part) => part.reduce((s, r) => s + (Number(r[key]) || 0), 0);
    const current = sum(list.slice(-window));
    const previous = sum(list.slice(-2 * window, -window));
    const change = previous === 0 ? null : Math.round(((current - previous) / previous) * 1000) / 10;
    return { current, previous, change };
};

module.exports = { buildDailySeries, compareWindows, vnDateKey };
