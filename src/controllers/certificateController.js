const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const crypto = require('crypto');

// @desc    Tạo chứng chỉ khi hoàn thành khóa học
// @route   POST /api/certificates
// @access  Private (Auto-triggered)
const createCertificate = async (req, res) => {
    try {
        const { enrollmentId } = req.body;

        const enrollment = await Enrollment.findById(enrollmentId)
            .populate('course')
            .populate('student');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment không tồn tại' });
        }

        if (enrollment.status !== 'completed') {
            return res.status(400).json({ message: 'Khóa học chưa hoàn thành' });
        }

        // Kiểm tra đã có chứng chỉ chưa
        const existingCert = await Certificate.findOne({
            course: enrollment.course._id,
            student: enrollment.student._id
        });

        if (existingCert) {
            return res.status(400).json({ message: 'Đã trao chứng chỉ cho khóa học này' });
        }

        // Tạo verification code
        const verificationCode = crypto.randomBytes(16).toString('hex');

        const certificate = new Certificate({
            course: enrollment.course._id,
            student: enrollment.student._id,
            title: `Certificate of Completion - ${enrollment.course.title}`,
            description: `Successfully completed ${enrollment.course.title}`,
            completionDate: enrollment.completedAt,
            courseName: enrollment.course.title,
            instructorName: enrollment.course.instructor.name || 'Instructor',
            finalScore: enrollment.finalScore,
            scorePercentage: enrollment.totalProgress,
            verificationCode,
            signedBy: enrollment.course.instructor.name || 'Learning Portal',
            issuedAt: new Date()
        });

        const savedCertificate = await certificate.save();

        // Tạo achievement
        await createAchievement(enrollment.student._id, 'course_completed', {
            courseId: enrollment.course._id,
            courseName: enrollment.course.title
        });

        res.status(201).json(savedCertificate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy chứng chỉ của student
// @route   GET /api/certificates/my-certificates
const getMyCertificates = async (req, res) => {
    try {
        const certificates = await Certificate.find({
            student: req.user._id,
            isValid: true
        })
            .populate('course', 'title thumbnail')
            .sort({ completionDate: -1 });

        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy chi tiết chứng chỉ
// @route   GET /api/certificates/:id
const getCertificateById = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate('course')
            .populate('student', 'name email');

        if (!certificate) {
            return res.status(404).json({ message: 'Chứng chỉ không tồn tại' });
        }

        // Kiểm tra quyền (public hoặc student của mình)
        if (!certificate.isPublic && certificate.student._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền xem chứng chỉ này' });
        }

        res.json(certificate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify chứng chỉ
// @route   GET /api/certificates/verify/:code
const verifyCertificate = async (req, res) => {
    try {
        const { code } = req.params;

        const certificate = await Certificate.findOne({
            verificationCode: code,
            isValid: true
        })
            .populate('course', 'title')
            .populate('student', 'name');

        if (!certificate) {
            return res.status(404).json({ message: 'Chứng chỉ không hợp lệ' });
        }

        // Check expiry
        if (certificate.expiresAt && new Date() > certificate.expiresAt) {
            return res.status(400).json({ message: 'Chứng chỉ đã hết hạn' });
        }

        res.json({
            valid: true,
            certificate: {
                certificateNumber: certificate.certificateNumber,
                student: certificate.student.name,
                course: certificate.courseName,
                completionDate: certificate.completionDate,
                issuedAt: certificate.issuedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật chứng chỉ (công khai/riêng tư)
// @route   PUT /api/certificates/:id
const updateCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);

        if (!certificate) {
            return res.status(404).json({ message: 'Chứng chỉ không tồn tại' });
        }

        // Kiểm tra quyền
        if (certificate.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền sửa chứng chỉ này' });
        }

        certificate.isPublic = req.body.isPublic !== undefined ? req.body.isPublic : certificate.isPublic;

        const updatedCertificate = await certificate.save();
        res.json(updatedCertificate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy chứng chỉ công khai của user
// @route   GET /api/certificates/user/:userId
const getUserPublicCertificates = async (req, res) => {
    try {
        const { userId } = req.params;

        const certificates = await Certificate.find({
            student: userId,
            isPublic: true,
            isValid: true
        })
            .populate('course', 'title thumbnail')
            .select('-verificationCode');

        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy achievements của student
// @route   GET /api/achievements/my-achievements
const getMyAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find({
            student: req.user._id
        })
            .populate('relatedCourse', 'title')
            .sort({ unlockedAt: -1 });

        // Tính total points
        const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);

        res.json({
            totalAchievements: achievements.length,
            totalPoints,
            achievements
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy achievement công khai của user
// @route   GET /api/achievements/user/:userId
const getUserPublicAchievements = async (req, res) => {
    try {
        const { userId } = req.params;

        const achievements = await Achievement.find({
            student: userId,
            isPublic: true
        })
            .populate('relatedCourse', 'title')
            .sort({ unlockedAt: -1 });

        const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);

        res.json({
            totalAchievements: achievements.length,
            totalPoints,
            achievements
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy leaderboard
// @route   GET /api/achievements/leaderboard?limit=10
const getLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Aggregate achievements by student
        const leaderboard = await Achievement.aggregate([
            {
                $group: {
                    _id: '$student',
                    totalPoints: { $sum: '$points' },
                    achievements: { $sum: 1 }
                }
            },
            {
                $sort: { totalPoints: -1 }
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            {
                $unwind: '$student'
            },
            {
                $project: {
                    _id: 0,
                    student: {
                        _id: '$student._id',
                        name: '$student.name',
                        avatar: '$student.avatar'
                    },
                    totalPoints: 1,
                    achievements: 1
                }
            }
        ]);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper: Tạo achievement
const createAchievement = async (studentId, type, metadata = {}) => {
    try {
        // Định nghĩa achievements
        const achievementDefs = {
            course_completed: {
                title: `Course Master: ${metadata.courseName}`,
                description: `Completed ${metadata.courseName}`,
                points: 50,
                level: 'silver',
                badgeImage: 'https://via.placeholder.com/100?text=Completed'
            },
            first_course_completed: {
                title: 'First Step',
                description: 'Completed your first course',
                points: 100,
                level: 'gold',
                badgeImage: 'https://via.placeholder.com/100?text=First'
            },
            perfect_score: {
                title: 'Perfect Score',
                description: 'Achieved 100% on a quiz',
                points: 75,
                level: 'platinum',
                badgeImage: 'https://via.placeholder.com/100?text=Perfect'
            },
            high_score: {
                title: 'Quiz Master',
                description: 'Achieved 90%+ on a quiz',
                points: 30,
                level: 'gold',
                badgeImage: 'https://via.placeholder.com/100?text=HighScore'
            }
        };

        const achDef = achievementDefs[type];
        if (!achDef) return;

        // Check if already exists
        const existing = await Achievement.findOne({
            student: studentId,
            type: type,
            relatedCourse: metadata.courseId || null
        });

        if (existing) return;

        const achievement = new Achievement({
            student: studentId,
            type,
            title: achDef.title,
            description: achDef.description,
            points: achDef.points,
            level: achDef.level,
            badgeImage: achDef.badgeImage,
            relatedCourse: metadata.courseId || null,
            relatedQuiz: metadata.quizId || null
        });

        await achievement.save();
    } catch (error) {
        console.error('Error creating achievement:', error.message);
    }
};

module.exports = {
    createCertificate,
    getMyCertificates,
    getCertificateById,
    verifyCertificate,
    updateCertificate,
    getUserPublicCertificates,
    getMyAchievements,
    getUserPublicAchievements,
    getLeaderboard,
    createAchievement
};
