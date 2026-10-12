const User = require('../models/User');
const Course = require('../models/Course');
const { createEnrollment } = require('../utils/enrollment');
const { sendNotification } = require('./notificationController');

/**
 * POST /api/admin/enrollments/tang-khoa - quan tri tang thang mot khoa hoc.
 *
 * Mo khoa mien phi cho mot nguoi (hoc bong, bu loi, khach quen), khong qua don
 * hang. Truoc 08/10/2026 nam trong trang coin; coin bo di thi day la duong duy
 * nhat de quan tri tu mo khoa cho ai do, nen tach ra giu lai.
 */
const giftCourseToStudent = async (req, res) => {
    try {
        const { userId, courseId } = req.body || {};
        if (!userId || !courseId) {
            return res.status(400).json({ message: 'Thiếu học viên hoặc khóa học' });
        }

        const [student, course] = await Promise.all([
            User.findById(userId).select('name'),
            Course.findById(courseId).select('title slug')
        ]);

        if (!student) return res.status(404).json({ message: 'Không tìm thấy học viên' });
        if (!course) return res.status(404).json({ message: 'Không tìm thấy khóa học' });

        const { created } = await createEnrollment(course._id, student._id, { lifetime: true });
        if (!created) {
            return res.status(400).json({ message: `${student.name} đã có khóa học này rồi` });
        }

        // Bat buoc phai bao: hoc vien KHONG CO MAT luc quan tri bam tang. Khong
        // bao thi ho chi tinh co thay minh co them mot khoa ma khong hieu vi sao.
        await sendNotification(student._id, 'khoa_duoc_mo', {
            tenKhoa: course.title,
            courseSlug: course.slug
        });

        return res.json({ message: `Đã tặng khóa "${course.title}" cho ${student.name}` });
    } catch (error) {
        console.error('tangKhoaChoHocVien:', error.message);
        return res.status(500).json({ message: 'Không tặng được khóa học' });
    }
};

module.exports = { giftCourseToStudent };
