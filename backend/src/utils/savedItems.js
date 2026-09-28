// Ham thuan cho tinh nang "da luu" - khong dung CSDL nen test duoc o CI.

const TOI_DA_NHAP = 200;

const laObjectId = (s) => /^[a-f0-9]{24}$/i.test(String(s || ''));

/**
 * Doc danh sach duong dan cu trong localStorage ("feedBookmarks") thanh cac
 * muc can luu vao tai khoan.
 *
 *   /blog/<slug>            -> { loai: 'baiViet', slug }
 *   /share-document/<id>    -> { loai: 'taiLieu', id }
 *
 * Moi thu khac bi bo qua: day la du lieu tu trinh duyet gui len, ai cung sua
 * duoc - khong tin, khong bao loi, chi nhat ra cai hop le. Bo trung, va cat o
 * TOI_DA_NHAP de mot request khong bat may chu tra ca nghin truy van.
 */
function docDuongDanCu(dsTho) {
    if (!Array.isArray(dsTho)) return [];
    const daGap = new Set();
    const kq = [];

    for (const tho of dsTho) {
        if (kq.length >= TOI_DA_NHAP) break;
        if (typeof tho !== 'string' || tho.length > 300) continue;

        // Bo ?query va #hash - nut luu cu luu dung href cua the.
        const duong = tho.split(/[?#]/)[0].replace(/\/+$/, '');

        let muc = null;
        const blog = duong.match(/^\/blog\/([a-z0-9-]{1,220})$/i);
        const taiLieu = duong.match(/^\/share-document\/([a-f0-9]{24})$/i);
        if (blog) muc = { loai: 'baiViet', slug: blog[1].toLowerCase() };
        else if (taiLieu) muc = { loai: 'taiLieu', id: taiLieu[1].toLowerCase() };
        if (!muc) continue;

        const khoa = `${muc.loai}:${muc.slug || muc.id}`;
        if (daGap.has(khoa)) continue;
        daGap.add(khoa);
        kq.push(muc);
    }
    return kq;
}

module.exports = { docDuongDanCu, laObjectId, TOI_DA_NHAP };
