// Ham thuan ve ten truong dai hoc - khong CSDL, test duoc o CI.

const { normalizeSubject } = require('./rankDocuments');

// Tien to loai truong, dai nhat truoc de "Truong Dai hoc" khong bi cat thanh
// "Dai hoc" roi con sot chu "Truong".
const PREFIX = [
    'trường cao đẳng',
    'trường đại học',
    'đại học',
    'học viện',
    'trường',
];

/**
 * "Ten chinh" cua truong - bo tien to loai truong:
 *   "Trường Đại học Tôn Đức Thắng" -> "Tôn Đức Thắng"
 *   "Học viện Ngân hàng"           -> "Ngân hàng"
 *   "International University"     -> "International University" (giu nguyen)
 *
 * Dung de xep theo CHU CAI DAU (ai cung la "Truong...", xep theo ten day du
 * thi gan nhu moi truong nam o chu T) va de nhan ra hai cach viet cua cung
 * mot truong ("Đại học Tôn Đức Thắng" / "Trường Đại học Tôn Đức Thắng").
 */
const mainSchoolName = (name) => {
    let s = String(name || '').replace(/\s+/g, ' ').trim();
    const thuong = s.toLowerCase();
    for (const t of PREFIX) {
        if (thuong.startsWith(`${t} `)) {
            s = s.slice(t.length).trim();
            break;
        }
    }
    return s;
};

/** Khoa so sanh theo ten chinh - hai cach viet cua cung mot truong ra cung khoa. */
const mainNameKey = (name) => normalizeSubject(mainSchoolName(name));

/**
 * Logo truong: duong dan trong du an (/images/institution/...) hoac https.
 * Rong = chua co logo. Chan moi thu khac (javascript:, data:, http tran...).
 */
const isValidLogo = (v) => {
    const s = String(v || '').trim();
    if (!s) return true;
    if (s.length > 300) return false;
    return /^\/images\/institution\/[\w.-]+\.(png|jpe?g|svg|webp)$/i.test(s) || /^https:\/\/[^\s"'<>]+$/i.test(s);
};

module.exports = { mainSchoolName, mainNameKey, logoHopLe: isValidLogo };
