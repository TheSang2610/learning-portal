/**
 * MOT CUA DUY NHAT cho moi chuc nang gan theo bai hoc.
 *
 * Hoi dap, ghi chu, va moi thu them vao sau nay deu can dung day kiem nay:
 *
 *   1. courseId / lessonId co dung dinh dang khong
 *   2. khoa co that khong
 *   3. nguoi goi co quyen xem noi dung khoa do khong  (duocXemNoiDung)
 *   4. bai co THUOC dung khoa vua kiem quyen khong
 *
 * Buoc 4 la buoc de quen nhat va la buoc nguy hiem nhat. Thieu no thi mot nguoi
 * ghi danh khoa re tro lessonId cua khoa dat vao la doc/ghi duoc du lieu gan
 * voi bai do - dung kieu lo hong ma troLyController da phai va rieng.
 *
 * Gom vao day chu khong chep lai o tung controller, vi day kiem nay la thu
 * KHONG duoc phep khac nhau giua cac duong. Chep lam hai ban la som muon co mot
 * ban thieu mot buoc, va do chinh la cach lo hong cu o contentAccess.js sinh ra.
 */

const mongoose = require('mongoose');

const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { duocXemNoiDung } = require('./contentAccess');

/**
 * Tra ve { khoa, bai } khi duoc di tiep, hoac { ma, loi } khi khong.
 *
 * Khong nem ngoai le: noi goi tu quyet dinh ma HTTP, cung kieu voi locCauHoi
 * trong assistantPrompt.js va timNguoiDungTuToken trong authMiddleware.
 */
const layBaiTrongKhoa = async (courseId, lessonId, nguoiDung) => {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return { ma: 400, loi: 'Mã khóa học không hợp lệ.' };
    }
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        return { ma: 400, loi: 'Mã bài học không hợp lệ.' };
    }

    const khoa = await Course.findById(courseId).select('title instructor price');
    if (!khoa) {
        return { ma: 404, loi: 'Không tìm thấy khóa học.' };
    }

    if (!(await duocXemNoiDung(khoa, nguoiDung))) {
        return {
            ma: 403,
            loi: 'Bạn cần đăng ký khóa học này để dùng chức năng này.',
            canGhiDanh: true,
        };
    }

    const bai = await Lesson.findById(lessonId).select('title courseId');
    if (!bai || String(bai.courseId) !== String(khoa._id)) {
        return { ma: 404, loi: 'Không tìm thấy bài học trong khóa này.' };
    }

    return { khoa, bai };
};

/** Tra loi HTTP chuan cho truong hop cong tu choi. */
const traLoiCong = (res, cong) =>
    res.status(cong.ma).json({
        message: cong.loi,
        ...(cong.canGhiDanh ? { requiresEnrollment: true } : {}),
    });

/**
 * Vai tro cua mot nguoi XET THEO KHOA NAY, khong phai theo he thong.
 *
 * Mot nguoi co `role === 'instructor'` nhung day khoa khac thi voi khoa nay ho
 * chi la hoc vien. Gan nhan "Giang vien" cho ho se lam hoc vien tuong do la cau
 * tra loi chinh thuc cua nguoi day mon nay.
 */
const vaiTroTrongKhoa = (khoa, nguoiDung) => {
    if (nguoiDung.role === 'admin') return 'quanTri';
    if (String(khoa.instructor) === String(nguoiDung._id)) return 'giangVien';
    return 'hocVien';
};

module.exports = { layBaiTrongKhoa, traLoiCong, vaiTroTrongKhoa };
