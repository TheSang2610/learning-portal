// Danh sach khoa cua mot don hang, dung chung cho moi cho can mo khoa / hien ten.
//
// Don mua le chi co `course`; don gio hang co them `courses` (da gom ca `course`).
// Doc thang `don.course` o cho xac nhan don la loi that: don gio hang 3 khoa se
// chi mo 1 khoa trong khi hoc vien da chuyen tien cho ca 3.

// Lay id duoi dang chuoi, chap nhan ca ObjectId tran lan ban da populate.
const getId = (x) => {
    if (!x) return null;
    if (typeof x === 'object' && x._id) return String(x._id);
    return String(x);
};

/** Tra ve mang id (chuoi) khong trung, `course` dung dau. */
const orderCourses = (order) => {
    const items = [getId(order?.course), ...(order?.courses || []).map(getId)].filter(Boolean);
    return [...new Set(items)];
};

/** Dieu kien Mongo "don co chua khoa nay", bat ca don le lan don gio hang. */
const ordersContainingCourse = (courseId) => ({ $or: [{ course: courseId }, { courses: courseId }] });

/** Kiem danh sach id gui len cho don gio hang: bo trung, giu thu tu. */
const MAX_COURSES = 20;
const filterCourseIds = (items, isValidId) => {
    if (!Array.isArray(items)) return { loi: 'Thiếu danh sách khóa học' };
    const clean = [...new Set(items.map((x) => String(x || '').trim()).filter(Boolean))];
    if (clean.length === 0) return { loi: 'Giỏ hàng đang trống' };
    if (clean.length > MAX_COURSES) {
        return { loi: `Mỗi đơn tối đa ${MAX_COURSES} khóa học` };
    }
    if (!clean.every(isValidId)) return { loi: 'Có mã khóa học không hợp lệ' };
    return { ds: clean };
};

module.exports = { orderCourses, ordersContainingCourse, filterCourseIds, MAX_COURSES };
