const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const Review = require('../models/Review');
const Quiz = require('../models/Quiz');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/statistics
const getDashboardStatistics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalInstructors = await User.countDocuments({ role: 'instructor' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });

        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ isPublished: true });
        const draftCourses = await Course.countDocuments({ isPublished: false });

        const totalEnrollments = await Enrollment.countDocuments();
        const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });
        const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });

        const totalCertificates = await Certificate.countDocuments();
        const validCertificates = await Certificate.countDocuments({ isValid: true });

        const totalReviews = await Review.countDocuments();
        const averageRating = await Review.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);

        const totalQuizzes = await Quiz.countDocuments();

        res.json({
            users: {
                total: totalUsers,
                students: totalStudents,
                instructors: totalInstructors,
                admins: totalAdmins
            },
            courses: {
                total: totalCourses,
                published: publishedCourses,
                draft: draftCourses
            },
            enrollments: {
                total: totalEnrollments,
                active: activeEnrollments,
                completed: completedEnrollments
            },
            certificates: {
                total: totalCertificates,
                valid: validCertificates
            },
            reviews: {
                total: totalReviews,
                averageRating: averageRating[0]?.avgRating || 0
            },
            quizzes: {
                total: totalQuizzes
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
    try {
        const { role, status, page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (role) filter.role = role;
        if (status !== undefined) filter.status = status === 'true';
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { userId: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .limit(limit * 1)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(filter);

        res.json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('enrolledCourses', 'title price')
            .populate('createdCourses', 'title isPublished');

        if (!user) {
            return res.status(404).json({ message: 'User không tìm thấy' });
        }

        // Get enrollment stats
        const enrollmentStats = await Enrollment.aggregate([
            { $match: { student: user._id } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get certificates count
        const certificatesCount = await Certificate.countDocuments({ student: user._id });

        res.json({
            ...user.toObject(),
            enrollmentStats,
            certificatesCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (status === undefined) {
            return res.status(400).json({ message: 'Status là bắt buộc' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User không tìm thấy' });
        }

        user.status = status;
        const updatedUser = await user.save();

        res.json({
            message: status ? 'User đã được kích hoạt' : 'User đã bị khóa',
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                status: updatedUser.status
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
const deleteUserAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User không tìm thấy' });
        }

        // Delete user's courses
        if (user.createdCourses && user.createdCourses.length > 0) {
            await Course.deleteMany({ instructor: user._id });
        }

        // Delete user's enrollments
        await Enrollment.deleteMany({ student: user._id });

        await user.deleteOne();
        res.json({ message: 'User đã bị xóa' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all courses
// @route   GET /api/admin/courses
const getAllCourses = async (req, res) => {
    try {
        const { isPublished, page = 1, limit = 10, search } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const courses = await Course.find(filter)
            .populate('instructor', 'name email')
            .populate('category', 'name')
            .limit(limit * 1)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Course.countDocuments(filter);

        res.json({
            courses,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get course details
// @route   GET /api/admin/courses/:id
const getCourseDetailsAdmin = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name email')
            .populate('category', 'name')
            .populate('lessons')
            .populate('students', 'name email');

        if (!course) {
            return res.status(404).json({ message: 'Khóa học không tìm thấy' });
        }

        const enrollmentsCount = await Enrollment.countDocuments({ course: course._id });
        const completedCount = await Enrollment.countDocuments({
            course: course._id,
            status: 'completed'
        });

        res.json({
            ...course.toObject(),
            enrollmentsCount,
            completedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Publish/Unpublish course
// @route   PUT /api/admin/courses/:id/publish
const updateCoursePublishStatus = async (req, res) => {
    try {
        const { isPublished } = req.body;

        if (isPublished === undefined) {
            return res.status(400).json({ message: 'isPublished là bắt buộc' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Khóa học không tìm thấy' });
        }

        course.isPublished = isPublished;
        const updatedCourse = await course.save();

        res.json({
            message: isPublished ? 'Khóa học đã được công bố' : 'Khóa học đã bị rút khỏi công bố',
            course: {
                _id: updatedCourse._id,
                title: updatedCourse.title,
                isPublished: updatedCourse.isPublished
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete course
// @route   DELETE /api/admin/courses/:id
const deleteCourseAdmin = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Khóa học không tìm thấy' });
        }

        // Delete enrollments
        await Enrollment.deleteMany({ course: course._id });

        // Delete certificates
        await Certificate.deleteMany({ course: course._id });

        await course.deleteOne();
        res.json({ message: 'Khóa học đã bị xóa' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all enrollments
// @route   GET /api/admin/enrollments
const getAllEnrollments = async (req, res) => {
    try {
        const { status, page = 1, limit = 10, courseId, studentId } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (status) filter.status = status;
        if (courseId) filter.course = courseId;
        if (studentId) filter.student = studentId;

        const enrollments = await Enrollment.find(filter)
            .populate('course', 'title')
            .populate('student', 'name email')
            .limit(limit * 1)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Enrollment.countDocuments(filter);

        res.json({
            enrollments,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get enrollment details
// @route   GET /api/admin/enrollments/:id
const getEnrollmentDetailsAdmin = async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.id)
            .populate('course')
            .populate('student')
            .populate('completedLessons');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment không tìm thấy' });
        }

        res.json(enrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update enrollment status
// @route   PUT /api/admin/enrollments/:id/status
const updateEnrollmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowedStatus = ['active', 'completed', 'dropped'];

        if (!status || !allowedStatus.includes(status)) {
            return res.status(400).json({ message: 'Status không hợp lệ' });
        }

        const enrollment = await Enrollment.findById(req.params.id);
        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment không tìm thấy' });
        }

        enrollment.status = status;
        if (status === 'completed') {
            enrollment.completedAt = new Date();
        }

        const updatedEnrollment = await enrollment.save();
        res.json(updatedEnrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all certificates
// @route   GET /api/admin/certificates
const getAllCertificates = async (req, res) => {
    try {
        const { isValid, page = 1, limit = 10, studentId, courseId } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (isValid !== undefined) filter.isValid = isValid === 'true';
        if (studentId) filter.student = studentId;
        if (courseId) filter.course = courseId;

        const certificates = await Certificate.find(filter)
            .populate('student', 'name email')
            .populate('course', 'title')
            .limit(limit * 1)
            .skip(skip)
            .sort({ issuedAt: -1 });

        const total = await Certificate.countDocuments(filter);

        res.json({
            certificates,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify certificate
// @route   POST /api/admin/certificates/:verificationCode/verify
const verifyCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findOne({
            verificationCode: req.params.verificationCode
        }).populate('student', 'name email').populate('course', 'title');

        if (!certificate) {
            return res.status(404).json({ message: 'Chứng chỉ không tìm thấy' });
        }

        res.json({
            isValid: certificate.isValid,
            certificate
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Revoke certificate
// @route   PUT /api/admin/certificates/:id/revoke
const revokeCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);
        if (!certificate) {
            return res.status(404).json({ message: 'Chứng chỉ không tìm thấy' });
        }

        certificate.isValid = false;
        const updatedCert = await certificate.save();

        res.json({
            message: 'Chứng chỉ đã bị thu hồi',
            certificate: updatedCert
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
const getAllReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10, courseId, studentId, rating } = req.query;
        const skip = (page - 1) * limit;

        const filter = {};
        if (courseId) filter.course = courseId;
        if (studentId) filter.student = studentId;
        if (rating) filter.rating = parseInt(rating);

        const reviews = await Review.find(filter)
            .populate('course', 'title')
            .populate('student', 'name email avatar')
            .limit(limit * 1)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await Review.countDocuments(filter);

        res.json({
            reviews,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / limit),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete review
// @route   DELETE /api/admin/reviews/:id
const deleteReviewAdmin = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review không tìm thấy' });
        }

        await review.deleteOne();
        res.json({ message: 'Review đã bị xóa' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStatistics,
    getAllUsers,
    getUserDetails,
    updateUserStatus,
    deleteUserAdmin,
    getAllCourses,
    getCourseDetailsAdmin,
    updateCoursePublishStatus,
    deleteCourseAdmin,
    getAllEnrollments,
    getEnrollmentDetailsAdmin,
    updateEnrollmentStatus,
    getAllCertificates,
    verifyCertificate,
    revokeCertificate,
    getAllReviews,
    deleteReviewAdmin
};
