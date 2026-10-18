// Chon danh sach "Xem gan day" tu lich su xem khoa hoc (models/CourseView.js).
//
// Tach khoi controller de kiem duoc khong can CSDL.

/** So khoa toi da muc "Xem gan day" tra ve. */
const MAX_RECENT = 12;

/**
 * @param views     [{ course, viewedAt }] - moi nhat truoc.
 * @param courses   khoa hoc tuong ung (da loc isPublished), bat ky thu tu.
 * @param enrolled  id cac khoa nguoi nay da ghi danh - bo ra: khoa dang hoc da
 *                  co o phan "Tiep tuc hoc", lap lai o day la thua.
 * @param count     so khoa can lay.
 * @returns khoa hoc, giu dung thu tu xem, kem `viewedAt`.
 */
const pickRecentViews = (views, courses, enrolled = [], count = 3) => {
    if (!Array.isArray(views) || !Array.isArray(courses)) return [];
    const limit = Math.min(Math.max(parseInt(count, 10) || 3, 1), MAX_RECENT);
    const skip = new Set(enrolled.map(String));
    const byId = new Map(courses.map((k) => [String(k._id), k]));
    const out = [];

    for (const v of views) {
        const id = String(v.course);
        const k = byId.get(id);
        // Khoa da xoa / an (khong co trong `courses`) hoac da ghi danh -> bo.
        if (!k || skip.has(id)) continue;
        out.push({ ...k, viewedAt: v.viewedAt });
        if (out.length >= limit) break;
    }
    return out;
};

module.exports = { pickRecentViews, MAX_RECENT };
