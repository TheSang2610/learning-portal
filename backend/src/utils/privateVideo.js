/**
 * Video bai giang o KHO KIN cua Cloudinary (type 'authenticated').
 *
 * Truoc 04/10/2026 video upload o che do cong khai va CSDL luu thang link: ai co
 * link (hoc vien chep ra, gui nhom chat) la xem mai duoc, khong can tai khoan.
 * Cong canViewContent chi chan duoc LUC LAY link, khong chan duoc link da lot ra.
 *
 * Gio:
 *   - Trinh duyet giang vien upload THANG len Cloudinary (videoUploadParams cap
 *     chu ky). File khong di qua backend - Vercel chi nhan request ~4.5 MB, video
 *     bai giang di qua backend la hong tren ban that.
 *   - CSDL chi luu public_id (Lesson.videoPublicId), khong luu link.
 *   - May chu dung playbackUrl() sinh link CO CHU KY de tu tai video ve. Link
 *     khong ky bi Cloudinary tra 401. Da thu that 04/10/2026: link ky phat duoc ca
 *     HLS, cac doan con trong manifest cung tu duoc ky.
 *
 * Chu ky cua Cloudinary goi mien phi KHONG het han, nen tu 10/10/2026 link ky
 * nay chi con dung o PHIA MAY CHU: trinh duyet nhan link phat cua minh, gan voi
 * nguoi xem va het han sau 2 gio - xem utils/videoStream.js.
 */
const getCloudinary = require('../config/cloudinary');
const { streamPath } = require('./videoStream');

const LECTURE_FOLDER = 'learning-portal/bai-giang';

// public_id Cloudinary tu sinh khi chi gui `folder`: thu muc + chuoi ngau nhien.
// Chi nhan dung dang nay: nhan bua thi giang vien gui public_id cua video khoa
// KHAC (hoac anh dai dien cua ai do) vao bai hoc cua minh.
const MAU_ID = /^learning-portal\/bai-giang\/[A-Za-z0-9_-]{1,120}$/;

const isValidVideoId = (x) => typeof x === 'string' && MAU_ID.test(x);

/** Link phat HLS co chu ky cho mot video o kho kin. */
const playbackUrl = (publicId, cld = getCloudinary()) =>
    cld.url(publicId, {
        resource_type: 'video',
        type: 'authenticated',
        sign_url: true,
        format: 'm3u8',
        streaming_profile: 'auto',
        secure: true
    });

/**
 * Tra bai hoc ve dang gui duoc cho NGUOI DA DUOC XEM: video kho kin -> link ky
 * vao `videoUrl`, va KHONG BAO GIO tra `videoPublicId` ra ngoai (co no la tu ky
 * duoc link... neu lo ca khoa API, nhung khong co ly do gi de lo no).
 *
 * Bai cu (video cong khai, link YouTube) giu nguyen `videoUrl` nhu truoc.
 * Chi goi SAU khi canViewContent() da cho qua.
 */
// Tu 10/10/2026 trinh duyet KHONG nhan link Cloudinary nua ma nhan link phat
// cua chinh may chu, gan voi nguoi xem va het han sau 2 gio (utils/videoStream.js).
const defaultLink = (lesson, user) => streamPath(lesson._id, user._id);

const attachPlaybackUrl = (lesson, user, sinhLink = defaultLink) => {
    if (!lesson || typeof lesson !== 'object') return lesson;
    const copy = typeof lesson.toObject === 'function' ? lesson.toObject() : { ...lesson };
    // videoKin: de form sua bai biet video dang o kho kin ma hien "da luu",
    // thay vi hien link ky trong o nhap link (va gui nguoc no len khi luu).
    copy.videoKin = Boolean(copy.videoPublicId);
    // Khong biet ai xem thi khong cap link - ve phat phai gan voi mot nguoi.
    if (copy.videoPublicId) copy.videoUrl = user ? sinhLink(copy, user) : '';
    delete copy.videoPublicId;
    return copy;
};

/**
 * Tham so de trinh duyet upload thang len Cloudinary vao kho kin.
 *
 * Chi ky ba tham so folder / timestamp / type - trinh duyet phai gui DUNG ba tham
 * so do, nen khong doi duoc thu muc hay bien video thanh cong khai. Cloudinary
 * tu choi chu ky cu hon 1 gio.
 */
const videoUploadParams = (cld = getCloudinary()) => {
    const cfg = cld.config();
    const timestamp = Math.round(Date.now() / 1000);
    const signFor = { folder: LECTURE_FOLDER, timestamp, type: 'authenticated' };
    return {
        cloudName: cfg.cloud_name,
        apiKey: cfg.api_key,
        ...signFor,
        signature: cld.utils.api_sign_request(signFor, cfg.api_secret)
    };
};

module.exports = { LECTURE_FOLDER, isValidVideoId, playbackUrl, attachPlaybackUrl, videoUploadParams };
