// Danh sach khoa cua mot don hang, dung chung cho moi cho can mo khoa / hien ten.
//
// Don mua le chi co `course`; don gio hang co them `courses` (da gom ca `course`).
// Doc thang `don.course` o cho xac nhan don la loi that: don gio hang 3 khoa se
// chi mo 1 khoa trong khi hoc vien da chuyen tien cho ca 3.

// Lay id duoi dang chuoi, chap nhan ca ObjectId tran lan ban da populate.
const layId = (x) => {
    if (!x) return null;
    if (typeof x === 'object' && x._id) return String(x._id);
    return String(x);
};

/** Tra ve mang id (chuoi) khong trung, `course` dung dau. */
const cacKhoaCuaDon = (don) => {
    const ds = [layId(don?.course), ...(don?.courses || []).map(layId)].filter(Boolean);
    return [...new Set(ds)];
};

/** Dieu kien Mongo "don co chua khoa nay", bat ca don le lan don gio hang. */
const donChuaKhoa = (courseId) => ({ $or: [{ course: courseId }, { courses: courseId }] });

/** Kiem danh sach id gui len cho don gio hang: bo trung, giu thu tu. */
const SO_KHOA_TOI_DA = 20;
const locDanhSachKhoa = (ds, laIdHopLe) => {
    if (!Array.isArray(ds)) return { loi: 'Thiếu danh sách khóa học' };
    const sach = [...new Set(ds.map((x) => String(x || '').trim()).filter(Boolean))];
    if (sach.length === 0) return { loi: 'Giỏ hàng đang trống' };
    if (sach.length > SO_KHOA_TOI_DA) {
        return { loi: `Mỗi đơn tối đa ${SO_KHOA_TOI_DA} khóa học` };
    }
    if (!sach.every(laIdHopLe)) return { loi: 'Có mã khóa học không hợp lệ' };
    return { ds: sach };
};

module.exports = { cacKhoaCuaDon, donChuaKhoa, locDanhSachKhoa, SO_KHOA_TOI_DA };
