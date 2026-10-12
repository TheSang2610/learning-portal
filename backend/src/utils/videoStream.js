/**
 * Phat video kho kin QUA MAY CHU, de link chep ra ngoai thanh vo dung (10/10/2026).
 *
 * Truoc day trinh duyet nhan thang link HLS co chu ky cua Cloudinary. Goi mien phi
 * khong cho chu ky het han, nen hoc vien da mua chep link gui ban la ban xem mai.
 *
 * Gio trinh duyet chi nhan link cua CHINH MINH: /api/video/<idBai>/master.m3u8?t=<ve>.
 *   - `t` la ve ky HMAC gom id bai + id nguoi xem + han dung (2 gio).
 *   - Moi request (danh sach phat VA tung doan video) phai kem cookie dang nhap
 *     cua DUNG nguoi trong ve. Link gui sang may khac: khong co cookie -> 401.
 *     Gui kem ca cookie (tuc la dua mat khau) thi van het han sau 2 gio.
 *   - Danh sach phat lay tu Cloudinary o phia may chu roi viet lai: moi dong tro
 *     toi Cloudinary bi doi thanh link cua minh. Trinh duyet khong bao gio thay
 *     link Cloudinary nao.
 *
 * Khong chan duoc quay man hinh - viec do can DRM (Widevine...) co phi. Thay vao
 * do khung phat hien watermark email nguoi xem (frontend).
 */
const crypto = require('crypto');

const STREAM_TTL_MS = 2 * 60 * 60 * 1000;

// Doan video di qua ham Vercel: phan hoi lon hon ~4,5 MB bi cat. Doan HLS ~10s o
// 720p khoang 3 MB, 1080p vuot nguong - nen bo cac muc chat luong tren nguong nay.
const MAX_BANDWIDTH = 3500000;

const secret = () => process.env.VIDEO_STREAM_SECRET || process.env.JWT_SECRET || '';

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const hmac = (data) => b64(crypto.createHmac('sha256', secret()).update(data).digest());

/** Ve phat: "<idBai>.<idNguoi>.<hanMs>.<chuKy>". */
function signStreamToken(lessonId, userId, now = Date.now()) {
    const body = `${lessonId}.${userId}.${now + STREAM_TTL_MS}`;
    return `${body}.${hmac(body)}`;
}

/** Tra { lessonId, userId } khi ve dung chu ky va con han, khong thi null. */
function verifyStreamToken(token, now = Date.now()) {
    if (typeof token !== 'string' || !secret()) return null;
    const parts = token.split('.');
    if (parts.length !== 4) return null;
    const [lessonId, userId, exp, sig] = parts;
    const expected = hmac(`${lessonId}.${userId}.${exp}`);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    if (!(Number(exp) > now)) return null;
    return { lessonId, userId };
}

/** Link phat dua cho trinh duyet (tuong doi, di qua /api cua chinh trang). */
const streamPath = (lessonId, userId, now) =>
    `/api/video/${lessonId}/master.m3u8?t=${encodeURIComponent(signStreamToken(String(lessonId), String(userId), now))}`;

/**
 * Chi cho may chu tai ve tu kho video kin cua CHINH tai khoan Cloudinary nay.
 * Khong co cho chan nay thi ?u= thanh cua cho ai cung bat may chu tai bat ky
 * dia chi nao (SSRF).
 */
function isAllowedUpstream(rawUrl, cloudName) {
    let u;
    try { u = new URL(rawUrl); } catch { return false; }
    return u.protocol === 'https:'
        && u.hostname === 'res.cloudinary.com'
        && Boolean(cloudName)
        && u.pathname.startsWith(`/${cloudName}/video/authenticated/`);
}

/**
 * Viet lai mot danh sach phat HLS: moi URI (dong khong bat dau bang # va
 * thuoc tinh URI="..." trong the #EXT-X-...) duoc giai theo link goc roi doi
 * qua `makeUrl(linkTuyetDoi, laDanhSachCon)`.
 *
 * Danh sach tong (master): bo cac muc #EXT-X-STREAM-INF co BANDWIDTH vuot
 * MAX_BANDWIDTH cung dong URI ngay sau no - tru khi bo het thi giu nguyen.
 */
function rewritePlaylist(text, upstreamUrl, makeUrl, maxBandwidth = MAX_BANDWIDTH) {
    const lines = String(text).split(/\r?\n/);
    const abs = (x) => new URL(x, upstreamUrl).toString();
    const isList = (x) => /\.m3u8(\?|$)/i.test(new URL(x, upstreamUrl).pathname);

    const variants = lines.filter((l) => l.startsWith('#EXT-X-STREAM-INF'));
    const bw = (l) => Number((l.match(/BANDWIDTH=(\d+)/) || [])[1] || 0);
    const keepAll = variants.length > 0 && variants.every((l) => bw(l) > maxBandwidth);

    const out = [];
    let skipNext = false;
    for (const line of lines) {
        if (line.startsWith('#EXT-X-STREAM-INF') && !keepAll && bw(line) > maxBandwidth) {
            skipNext = true;
            continue;
        }
        if (!line || line.startsWith('#')) {
            out.push(line.replace(/URI="([^"]+)"/g, (_, x) => `URI="${makeUrl(abs(x), isList(x))}"`));
            continue;
        }
        if (skipNext) { skipNext = false; continue; }
        out.push(makeUrl(abs(line.trim()), isList(line.trim())));
    }
    return out.join('\n');
}

module.exports = {
    STREAM_TTL_MS, MAX_BANDWIDTH, signStreamToken, verifyStreamToken, streamPath, isAllowedUpstream, rewritePlaylist,
};
