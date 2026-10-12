/**
 * MOT CUA DUY NHAT cho moi chuc nang gan theo bai hoc.
 *
 * Hoi dap, ghi chu, va moi thu them vao sau nay deu can dung day kiem nay:
 *
 *   1. courseId / lessonId co dung dinh dang khong
 *   2. khoa co that khong
 *   3. nguoi goi co quyen xem noi dung khoa do khong  (canViewContent)
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
const { canViewContent } = require('./contentAccess');

/**
 * Tra ve { khoa, bai } khi duoc di tiep, hoac { ma, loi } khi khong.
 *
 * Khong nem ngoai le: noi goi tu quyet dinh ma HTTP, cung kieu voi filterQuestion
 * trong assistantPrompt.js va findUserFromToken trong authMiddleware.
 */
const getLessonInCourse = async (courseId, lessonId, user) => {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return { ma: 400, loi: 'Mã khóa học không hợp lệ.' };
    }
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        return { ma: 400, loi: 'Mã bài học không hợp lệ.' };
    }

    const course = await Course.findById(courseId).select('title instructor price');
    if (!course) {
        return { ma: 404, loi: 'Không tìm thấy khóa học.' };
    }

    if (!(await canViewContent(course, user))) {
        return {
            ma: 403,
            loi: 'Bạn cần đăng ký khóa học này để dùng chức năng này.',
            requiresEnrollment: true,
        };
    }

    const lesson = await Lesson.findById(lessonId).select('title courseId');
    if (!lesson || String(lesson.courseId) !== String(course._id)) {
        return { ma: 404, loi: 'Không tìm thấy bài học trong khóa này.' };
    }

    return { khoa: course, bai: lesson };
};

/** Tra loi HTTP chuan cho truong hop cong tu choi. */
const bonusReply = (res, add) =>
    res.status(add.ma).json({
        message: add.loi,
        ...(add.requiresEnrollment ? { requiresEnrollment: true } : {}),
    });

/**
 * Vai tro cua mot nguoi XET THEO KHOA NAY, khong phai theo he thong.
 *
 * Mot nguoi co `role === 'instructor'` nhung day khoa khac thi voi khoa nay ho
 * chi la hoc vien. Gan nhan "Giang vien" cho ho se lam hoc vien tuong do la cau
 * tra loi chinh thuc cua nguoi day mon nay.
 */
const roleInCourse = (course, user) => {
    if (user.role === 'admin') return 'quanTri';
    if (String(course.instructor) === String(user._id)) return 'giangVien';
    return 'hocVien';
};

module.exports = { getLessonInCourse, bonusReply, roleInCourse };
