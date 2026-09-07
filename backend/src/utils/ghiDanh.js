const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

/**
 * Ghi danh mot nguoi vao mot khoa hoc.
 *
 * Tach ra day vi co HAI duong dan toi cung viec nay: hoc vien bam hoc khoa
 * mien phi, va quan tri xac nhan da nhan tien cho khoa co phi. Truoc day chi
 * co duong thu nhat nen logic nam thang trong controller; de nguyen roi chep
 * sang cho thu hai thi hai ban se troi khac nhau theo thoi gian.
 *
 * Tra ve { enrollment, moiTao }. moiTao = false khi nguoi do da hoc roi, hoac
 * khi don duoc xac nhan hai lan - goi lai khong nhan doi so hoc vien.
 */
const taoGhiDanh = async (courseId, studentId) => {
    const daCo = await Enrollment.findOne({ course: courseId, student: studentId });

    if (daCo) {
        // Da bo hoc thi mo lai, va dem lai vao so hoc vien vi luc bo da tru ra.
        if (daCo.status === 'dropped') {
            daCo.status = 'active';
            await daCo.save();
            await Course.findByIdAndUpdate(courseId, { $inc: { studentsCount: 1 } });
            await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: courseId } });
            return { enrollment: daCo, moiTao: true };
        }
        return { enrollment: daCo, moiTao: false };
    }

    const khoaHoc = await Course.findById(courseId).select('lessons');
    if (!khoaHoc) {
        throw new Error('Không tìm thấy khóa học');
    }

    const enrollment = await Enrollment.create({
        course: courseId,
        student: studentId,
        status: 'active',
        totalProgress: 0,
        lessonProgress: (khoaHoc.lessons || []).map((lessonId) => ({
            lesson: lessonId,
            status: 'not_started',
            watchedDuration: 0
        })),
        lastAccessedAt: new Date()
    });

    await Course.findByIdAndUpdate(courseId, { $inc: { studentsCount: 1 } });

    // Danh sach khoa hoc tren ho so nguoi dung. Bo buoc nay thi hoc vien duoc
    // quan tri mo khoa qua don hang se khong thay khoa do o trang ca nhan.
    await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: courseId } });

    return { enrollment, moiTao: true };
};

module.exports = { taoGhiDanh };
