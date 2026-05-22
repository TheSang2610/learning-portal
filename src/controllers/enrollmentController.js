const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

// @desc    Lấy tất cả khóa học của student
// @route   GET /api/enrollments/my-courses
const getMyEnrolledCourses = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user._id })
            .populate('course', 'title thumbnail price rating instructor')
            .sort({ createdAt: -1 });

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy chi tiết enrollment của 1 khóa học
// @route   GET /api/enrollments/course/:courseId
const getEnrollmentByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({
            course: courseId,
            student: req.user._id
        })
            .populate('course')
            .populate({
                path: 'lessonProgress.lesson',
                select: 'title duration order content videoUrl'
            });

        if (!enrollment) {
            return res.status(404).json({ message: 'Bạn chưa đăng ký khóa học này' });
        }

        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Đánh dấu bài học là đã hoàn thành
// @route   PUT /api/enrollments/course/:courseId/complete-lesson
const markLessonComplete = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { lessonId, watchedDuration } = req.body;

        if (!lessonId) {
            return res.status(400).json({ message: 'Vui lòng cung cấp lessonId' });
        }

        // Tìm enrollment
        const enrollment = await Enrollment.findOne({
            course: courseId,
            student: req.user._id
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Bạn chưa đăng ký khóa học này' });
        }

        // Kiểm tra bài học tồn tại
        const lesson = await Lesson.findById(lessonId);
        if (!lesson || lesson.courseId.toString() !== courseId) {
            return res.status(404).json({ message: 'Bài học không tồn tại' });
        }

        // Tìm hoặc tạo lesson progress
        let lessonProgressIndex = enrollment.lessonProgress.findIndex(
            (lp) => lp.lesson.toString() === lessonId
        );

        if (lessonProgressIndex === -1) {
            enrollment.lessonProgress.push({
                lesson: lessonId,
                status: 'completed',
                watchedDuration: watchedDuration || 0,
                completedAt: new Date()
            });
        } else {
            enrollment.lessonProgress[lessonProgressIndex].status = 'completed';
            enrollment.lessonProgress[lessonProgressIndex].watchedDuration = 
                watchedDuration || enrollment.lessonProgress[lessonProgressIndex].watchedDuration;
            enrollment.lessonProgress[lessonProgressIndex].completedAt = new Date();
        }

        // Cập nhật lastAccessedAt
        enrollment.lastAccessedAt = new Date();

        // Cập nhật totalProgress (Tính toán dựa trên lessonProgress)
        await updateEnrollmentProgress(enrollment, courseId);

        const updatedEnrollment = await enrollment.save();
        await updatedEnrollment.populate({
            path: 'lessonProgress.lesson',
            select: 'title duration'
        });

        res.json(updatedEnrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Bắt đầu học bài
// @route   PUT /api/enrollments/course/:courseId/start-lesson
const startLesson = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { lessonId } = req.body;

        if (!lessonId) {
            return res.status(400).json({ message: 'Vui lòng cung cấp lessonId' });
        }

        const enrollment = await Enrollment.findOne({
            course: courseId,
            student: req.user._id
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Bạn chưa đăng ký khóa học này' });
        }

        const lesson = await Lesson.findById(lessonId);
        if (!lesson || lesson.courseId.toString() !== courseId) {
            return res.status(404).json({ message: 'Bài học không tồn tại' });
        }

        // Kiểm tra xem đã có progress chưa
        let lessonProgressIndex = enrollment.lessonProgress.findIndex(
            (lp) => lp.lesson.toString() === lessonId
        );

        if (lessonProgressIndex === -1) {
            enrollment.lessonProgress.push({
                lesson: lessonId,
                status: 'in_progress',
                watchedDuration: 0
            });
        } else if (enrollment.lessonProgress[lessonProgressIndex].status === 'not_started') {
            enrollment.lessonProgress[lessonProgressIndex].status = 'in_progress';
        }

        enrollment.lastAccessedAt = new Date();
        const updatedEnrollment = await enrollment.save();

        res.json(updatedEnrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật thời gian xem video
// @route   PUT /api/enrollments/course/:courseId/update-watch-time
const updateWatchTime = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { lessonId, watchedDuration } = req.body;

        if (!lessonId || watchedDuration === undefined) {
            return res.status(400).json({ message: 'Vui lòng cung cấp lessonId và watchedDuration' });
        }

        const enrollment = await Enrollment.findOne({
            course: courseId,
            student: req.user._id
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Bạn chưa đăng ký khóa học này' });
        }

        const lessonProgressIndex = enrollment.lessonProgress.findIndex(
            (lp) => lp.lesson.toString() === lessonId
        );

        if (lessonProgressIndex === -1) {
            return res.status(404).json({ message: 'Chưa bắt đầu học bài này' });
        }

        enrollment.lessonProgress[lessonProgressIndex].watchedDuration = watchedDuration;
        enrollment.lastAccessedAt = new Date();

        const updatedEnrollment = await enrollment.save();
        res.json(updatedEnrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy thống kê tiến độ học
// @route   GET /api/enrollments/course/:courseId/progress
const getProgressStats = async (req, res) => {
    try {
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({
            course: courseId,
            student: req.user._id
        }).populate({
            path: 'lessonProgress.lesson',
            select: 'title duration order'
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Bạn chưa đăng ký khóa học này' });
        }

        // Tính toán thống kê từ mảng lessonProgress mới
        const course = await Course.findById(courseId);
        const totalLessons = course.lessons.length;
        
        // Đếm các bài học có trạng thái là completed trong mảng lessonProgress
        const completedLessonsCount = enrollment.lessonProgress.filter(
            (lp) => lp.status === 'completed'
        ).length;

        const progressPercentage = totalLessons > 0 
            ? Math.round((completedLessonsCount / totalLessons) * 100)
            : 0;

        const stats = {
            totalLessons,
            completedLessons: completedLessonsCount,
            inProgressLessons: enrollment.lessonProgress.filter(
                (lp) => lp.status === 'in_progress'
            ).length,
            progressPercentage,
            completionStatus: enrollment.status,
            lastAccessedAt: enrollment.lastAccessedAt,
            completedAt: enrollment.completedAt,
            lessonDetails: enrollment.lessonProgress.map((lp) => ({
                lesson: lp.lesson,
                status: lp.status,
                watchedDuration: lp.watchedDuration,
                completedAt: lp.completedAt
            }))
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Đánh dấu khóa học là hoàn thành
// @route   PUT /api/enrollments/course/:courseId/complete-course
const completeCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({
            course: courseId,
            student: req.user._id
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Bạn chưa đăng ký khóa học này' });
        }

        const course = await Course.findById(courseId);
        const totalLessons = course.lessons.length;
        const completedLessonsCount = enrollment.lessonProgress.filter(
            (lp) => lp.status === 'completed'
        ).length;

        if (completedLessonsCount < totalLessons) {
            return res.status(400).json({
                message: `Bạn chưa hoàn thành tất cả bài học (${completedLessonsCount}/${totalLessons})`
            });
        }

        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
        enrollment.totalProgress = 100;

        const updatedEnrollment = await enrollment.save();
        res.json(updatedEnrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Hủy đăng ký khóa học
// @route   PUT /api/enrollments/course/:courseId/drop
const dropCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const enrollment = await Enrollment.findOne({
            course: courseId,
            student: req.user._id
        });

        if (!enrollment) {
            return res.status(404).json({ message: 'Bạn chưa đăng ký khóa học này' });
        }

        enrollment.status = 'dropped';
        const updatedEnrollment = await enrollment.save();

        res.json(updatedEnrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy danh sách students đăng ký khóa học (instructor only)
// @route   GET /api/enrollments/course/:courseId/students
const getCourseStudents = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Khóa học không tồn tại' });
        }

        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xem danh sách này' });
        }

        // Đọc danh sách học viên từ bảng Enrollment thay vì mảng của Course
        const enrollments = await Enrollment.find({ course: courseId })
            .populate('student', 'name email avatar')
            .sort({ createdAt: -1 });

        res.json(enrollments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function: Cập nhật tiến độ enrollment dựa vào trạng thái bài học
const updateEnrollmentProgress = async (enrollment, courseId) => {
    try {
        const course = await Course.findById(courseId);
        if (!course) return;

        const totalLessons = course.lessons.length;
        const completedLessonsCount = enrollment.lessonProgress.filter(
            (lp) => lp.status === 'completed'
        ).length;

        const totalProgress = totalLessons > 0
            ? Math.round((completedLessonsCount / totalLessons) * 100)
            : 0;

        enrollment.totalProgress = totalProgress;

        if (totalProgress === 100 && enrollment.status === 'active') {
            enrollment.status = 'completed';
            enrollment.completedAt = new Date();
        }
    } catch (error) {
        console.error('Lỗi cập nhật tiến độ:', error.message);
    }
};

module.exports = {
    getMyEnrolledCourses,
    getEnrollmentByCourse,
    markLessonComplete,
    startLesson,
    updateWatchTime,
    getProgressStats,
    completeCourse,
    dropCourse,
    getCourseStudents
};