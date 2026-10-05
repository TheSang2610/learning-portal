/**
 * Video bai giang o KHO KIN cua Cloudinary (type 'authenticated').
 *
 * Truoc 04/10/2026 video upload o che do cong khai va CSDL luu thang link: ai co
 * link (hoc vien chep ra, gui nhom chat) la xem mai duoc, khong can tai khoan.
 * Cong duocXemNoiDung chi chan duoc LUC LAY link, khong chan duoc link da lot ra.
 *
 * Gio:
 *   - Trinh duyet giang vien upload THANG len Cloudinary (thamSoUploadVideo cap
 *     chu ky). File khong di qua backend - Vercel chi nhan request ~4.5 MB, video
 *     bai giang di qua backend la hong tren ban that.
 *   - CSDL chi luu public_id (Lesson.videoPublicId), khong luu link.
 *   - Moi lan nguoi DA DUOC XEM mo bai, ganLinkPhat() sinh link CO CHU KY. Link
 *     khong ky bi Cloudinary tra 401. Da thu that 04/10/2026: link ky phat duoc ca
 *     HLS, cac doan con trong manifest cung tu duoc ky.
 *
 * Gioi han con lai: chu ky cua Cloudinary goi mien phi KHONG het han - link ky
 * lot ra van xem duoc. Link tu het han can token authentication (goi tra phi).
 */
const layCloudinary = require('../config/cloudinary');

const THU_MUC_BAI_GIANG = 'learning-portal/bai-giang';

// public_id Cloudinary tu sinh khi chi gui `folder`: thu muc + chuoi ngau nhien.
// Chi nhan dung dang nay: nhan bua thi giang vien gui public_id cua video khoa
// KHAC (hoac anh dai dien cua ai do) vao bai hoc cua minh.
const MAU_ID = /^learning-portal\/bai-giang\/[A-Za-z0-9_-]{1,120}$/;

const idVideoHopLe = (x) => typeof x === 'string' && MAU_ID.test(x);

/** Link phat HLS co chu ky cho mot video o kho kin. */
const linkPhatVideo = (publicId, cld = layCloudinary()) =>
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
 * Chi goi SAU khi duocXemNoiDung() da cho qua.
 */
const ganLinkPhat = (baiHoc, sinhLink = linkPhatVideo) => {
    if (!baiHoc || typeof baiHoc !== 'object') return baiHoc;
    const doi = typeof baiHoc.toObject === 'function' ? baiHoc.toObject() : { ...baiHoc };
    // videoKin: de form sua bai biet video dang o kho kin ma hien "da luu",
    // thay vi hien link ky trong o nhap link (va gui nguoc no len khi luu).
    doi.videoKin = Boolean(doi.videoPublicId);
    if (doi.videoPublicId) doi.videoUrl = sinhLink(doi.videoPublicId);
    delete doi.videoPublicId;
    return doi;
};

/**
 * Tham so de trinh duyet upload thang len Cloudinary vao kho kin.
 *
 * Chi ky ba tham so folder / timestamp / type - trinh duyet phai gui DUNG ba tham
 * so do, nen khong doi duoc thu muc hay bien video thanh cong khai. Cloudinary
 * tu choi chu ky cu hon 1 gio.
 */
const thamSoUploadVideo = (cld = layCloudinary()) => {
    const cfg = cld.config();
    const timestamp = Math.round(Date.now() / 1000);
    const kyTren = { folder: THU_MUC_BAI_GIANG, timestamp, type: 'authenticated' };
    return {
        cloudName: cfg.cloud_name,
        apiKey: cfg.api_key,
        ...kyTren,
        signature: cld.utils.api_sign_request(kyTren, cfg.api_secret)
    };
};

module.exports = { THU_MUC_BAI_GIANG, idVideoHopLe, linkPhatVideo, ganLinkPhat, thamSoUploadVideo };
