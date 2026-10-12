const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { extendExpiry, isExpired } = require('./accessPeriod');

/**
 * Ghi danh mot nguoi vao mot khoa hoc.
 *
 * Tach ra day vi co HAI duong dan toi cung viec nay: hoc vien bam hoc khoa
 * mien phi, va quan tri xac nhan da nhan tien cho khoa co phi. Truoc day chi
 * co duong thu nhat nen logic nam thang trong controller; de nguyen roi chep
 * sang cho thu hai thi hai ban se troi khac nhau theo thoi gian.
 *
 * Tra ve { enrollment, created }. created = false khi nguoi do da hoc roi, hoac
 * khi don duoc xac nhan hai lan - goi lai khong nhan doi so hoc vien.
 *
 * `accessDays` chi truyen khi mo khoa CO PHI (don hang da tra tien): dat hoac gia
 * han expiresAt. Khong truyen (khoa mien phi, quan tri tang) thi khong gioi han.
 */
const createEnrollment = async (courseId, studentId, { accessDays, lifetime } = {}) => {
    const existing = await Enrollment.findOne({ course: courseId, student: studentId });

    // Quan tri tang khoa (lifetime): mo quyen hoc khong gioi han, ke ca khi nguoi
    // do dang co ghi danh co phi DA HET HAN - truoc day truong hop nay bao "da co
    // khoa nay roi" ma nguoi ta van khong vao hoc duoc.
    if (existing && lifetime && existing.status !== 'dropped' && existing.expiresAt) {
        const wasExpired = isExpired(existing);
        existing.expiresAt = null;
        await existing.save();
        return { enrollment: existing, created: wasExpired };
    }

    if (existing && accessDays) {
        // Mua lai / gia han: cong ngay vao han (con han thi cong don).
        const wasExpired = isExpired(existing);
        const wasDropped = existing.status === 'dropped';
        // Ghi danh khong co han (mua truoc khi co tinh nang nay, duoc tang) thi
        // giu nguyen - khong tu dung bien quyen hoc mai mai thanh co han.
        if (existing.expiresAt || wasDropped) {
            existing.expiresAt = extendExpiry(existing.expiresAt, accessDays);
        }
        if (wasDropped) existing.status = 'active';
        await existing.save();
        if (wasDropped) {
            await Course.findByIdAndUpdate(courseId, { $inc: { studentsCount: 1 } });
            await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: courseId } });
        }
        return { enrollment: existing, created: wasDropped || wasExpired };
    }

    if (existing) {
        // Da bo hoc thi mo lai, va dem lai vao so hoc vien vi luc bo da tru ra.
        if (existing.status === 'dropped') {
            existing.status = 'active';
            await existing.save();
            await Course.findByIdAndUpdate(courseId, { $inc: { studentsCount: 1 } });
            await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: courseId } });
            return { enrollment: existing, created: true };
        }
        return { enrollment: existing, created: false };
    }

    const course = await Course.findById(courseId).select('lessons');
    if (!course) {
        throw new Error('Không tìm thấy khóa học');
    }

    const enrollment = await Enrollment.create({
        course: courseId,
        student: studentId,
        status: 'active',
        totalProgress: 0,
        lessonProgress: (course.lessons || []).map((lessonId) => ({
            lesson: lessonId,
            status: 'not_started',
            watchedDuration: 0
        })),
        lastAccessedAt: new Date(),
        expiresAt: accessDays ? extendExpiry(null, accessDays) : null
    });

    await Course.findByIdAndUpdate(courseId, { $inc: { studentsCount: 1 } });

    // Danh sach khoa hoc tren ho so nguoi dung. Bo buoc nay thi hoc vien duoc
    // quan tri mo khoa qua don hang se khong thay khoa do o trang ca nhan.
    await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: courseId } });

    return { enrollment, created: true };
};

module.exports = { createEnrollment };
