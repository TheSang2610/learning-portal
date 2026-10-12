// Ham thuan cho tinh nang "da luu" - khong dung CSDL nen test duoc o CI.

const MAX_IMPORT = 200;

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
 * MAX_IMPORT de mot request khong bat may chu tra ca nghin truy van.
 */
function parseLegacyPath(dsTho) {
    if (!Array.isArray(dsTho)) return [];
    const seen = new Set();
    const outcome = [];

    for (const tho of dsTho) {
        if (outcome.length >= MAX_IMPORT) break;
        if (typeof tho !== 'string' || tho.length > 300) continue;

        // Bo ?query va #hash - nut luu cu luu dung href cua the.
        const route = tho.split(/[?#]/)[0].replace(/\/+$/, '');

        let item = null;
        const blog = route.match(/^\/blog\/([a-z0-9-]{1,220})$/i);
        const document = route.match(/^\/share-document\/([a-f0-9]{24})$/i);
        if (blog) item = { loai: 'baiViet', slug: blog[1].toLowerCase() };
        else if (document) item = { loai: 'taiLieu', id: document[1].toLowerCase() };
        if (!item) continue;

        const course = `${item.loai}:${item.slug || item.id}`;
        if (seen.has(course)) continue;
        seen.add(course);
        outcome.push(item);
    }
    return outcome;
}

module.exports = { parseLegacyPath, laObjectId, MAX_IMPORT };
