const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const crypto = require('crypto');
const { phanTrang } = require('../utils/queryParams');
const { dungChungChiPdf } = require('../utils/certificatePdf');
const { guiThongBao } = require('./notificationController');

// @desc    Tạo chứng chỉ khi hoàn thành khóa học
// @route   POST /api/certificates
// @access  Private (Auto-triggered)
const createCertificate = async (req, res) => {
    try {
        const { enrollmentId } = req.body;

        const enrollment = await Enrollment.findById(enrollmentId)
            .populate({
                path: 'course',
                populate: {
                    path: 'instructor',
                    select: 'name'
                }
            })
            .populate('student', 'name email');

        if (!enrollment) {
            return res.status(404).json({ message: 'Enrollment không tồn tại' });
        }

        if (enrollment.status !== 'completed') {
            return res.status(400).json({ message: 'Khóa học chưa hoàn thành' });
        }

        // 🔥 SỬA: Nếu đã tồn tại, return cái cũ thay vì error
        const existingCert = await Certificate.findOne({
            course: enrollment.course._id,
            student: enrollment.student._id
        });

        if (existingCert) {
            console.log("✅ Certificate đã tồn tại, return cái cũ");
            return res.status(200).json(existingCert);  // ✅ Return 200 + dữ liệu cũ
        }

        // Tạo cái mới
        const certificate = new Certificate({
            certificateNumber: `CERT-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
            course: enrollment.course._id,
            student: enrollment.student._id,
            title: `Certificate of Completion - ${enrollment.course.title}`,
            description: `Successfully completed ${enrollment.course.title}`,
            completionDate: enrollment.completedAt || new Date(),
            courseName: enrollment.course.title,
            instructorName: enrollment.course.instructor?.name || 'Giảng viên hệ thống',
            courseDuration: enrollment.course.duration || 'N/A',
            finalScore: enrollment.finalScore || 100,
            scorePercentage: enrollment.totalProgress || 100,
            verificationCode: crypto.randomBytes(16).toString('hex'),
            verificationUrl: `${req.protocol}://${req.get('host')}/api/certificates/verify/${crypto.randomBytes(16).toString('hex')}`,
            signedBy: enrollment.course.instructor?.name || 'Giảng viên hệ thống',
            issuedAt: new Date()
        });

        const savedCertificate = await certificate.save();

        // Tạo achievement
        const completedCoursesCount = await Enrollment.countDocuments({
            student: enrollment.student._id,
            status: 'completed'
        });

        if (completedCoursesCount === 1) {
            await createAchievement(enrollment.student._id, 'first_course_completed', {
                courseId: enrollment.course._id,
                courseName: enrollment.course.title
            });
        } else {
            await createAchievement(enrollment.student._id, 'course_completed', {
                courseId: enrollment.course._id,
                courseName: enrollment.course.title
            });
        }

        // Bao cho hoc vien biet ho vua co chung nhan.
        //
        // Truoc day chung nhan duoc sinh am tham: khong co dau hieu nao o giao
        // dien, hoc vien phai tu vao ho so moi thay. Nguoi hoc xong roi khong
        // quay lai trang ho so thi khong bao gio biet minh co no.
        await guiThongBao(enrollment.student._id, 'chung_nhan', {
            tenKhoa: enrollment.course.title
        });

        res.status(201).json(savedCertificate);
    } catch (error) {
        console.error("❌ Lỗi tạo certificate:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy chứng chỉ của student hiện tại
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

// @desc    Lấy chi tiết chứng chỉ bằng ID
// @route   GET /api/certificates/:id
const getCertificateById = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id)
            .populate('course')
            .populate('student', 'name email');

        if (!certificate) {
            return res.status(404).json({ message: 'Chứng chỉ không tồn tại' });
        }

        // Kiểm tra quyền (phải là công khai HOẶC chính học viên đó sở hữu mới xem được)
        if (!certificate.isPublic && certificate.student._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền xem chứng chỉ riêng tư này' });
        }

        res.json(certificate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/certificates/:id/pdf - tai ban chung nhan dang PDF.
 *
 * Tep duoc DUNG TAI MAY CHU chu khong phai window.print() o trinh duyet nhu
 * truoc. Nho vay quan tri mo dung ban ma hoc vien cam, va moi may cho ra mot
 * ket qua giong nhau.
 *
 * Ai xem duoc: chinh chu, quan tri, hoac bat ky ai neu chung nhan de cong khai
 * - dung dung mot luat voi getCertificateById de khong co duong vong.
 */
const taiChungChiPdf = async (req, res) => {
    try {
        const cc = await Certificate.findById(req.params.id)
            .populate('course', 'title')
            .populate('student', 'name email');

        if (!cc) {
            return res.status(404).json({ message: 'Chứng chỉ không tồn tại' });
        }

        const laChu = req.user && String(cc.student?._id) === String(req.user._id);
        const laQuanTri = req.user && req.user.role === 'admin';
        if (!cc.isPublic && !laChu && !laQuanTri) {
            return res.status(403).json({ message: 'Bạn không có quyền xem chứng chỉ này' });
        }

        const ten = `chung-nhan-${cc.certificateNumber || cc._id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        // inline: bam vao la MO RA XEM ngay trong trinh duyet, van bam tai ve
        // duoc. attachment thi moi lan bam la mot tep roi xuong thu muc Downloads
        // - quan tri duyet vai chuc chung nhan se ngap tep.
        res.setHeader('Content-Disposition', `inline; filename="${ten}"`);

        const goc = process.env.FRONTEND_URL || '';
        dungChungChiPdf(cc, {
            tenHocVien: cc.student?.name,
            diaChiXacThuc: goc ? `${goc.replace(/\/+$/, '')}/certificates/verify` : ''
        }).pipe(res);
    } catch (error) {
        console.error('taiChungChiPdf:', error.message);
        // Da gui header roi thi khong the doi sang JSON - chi con cach ngat.
        if (res.headersSent) return res.end();
        return res.status(500).json({ message: 'Không tạo được tệp PDF' });
    }
};

// @desc    Verify chứng chỉ công khai thông qua Code
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
            return res.status(404).json({ message: 'Chứng chỉ không hợp lệ hoặc đã bị vô hiệu hóa' });
        }

        // Kiểm tra thời hạn hết hạn (Expiry Date)
        if (certificate.expiresAt && new Date() > certificate.expiresAt) {
            return res.status(400).json({ message: 'Chứng chỉ này đã quá hạn áp dụng' });
        }

        res.json({
            valid: true,
            certificate: {
                certificateNumber: certificate.certificateNumber,
                student: certificate.student.name,
                course: certificate.courseName,
                completionDate: certificate.completionDate,
                issuedAt: certificate.issuedAt,
                instructorName: certificate.instructorName,
                signedBy: certificate.signedBy
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật trạng thái hiển thị của chứng chỉ (Chuyển đổi Public / Private)
// @route   PUT /api/certificates/:id
const updateCertificate = async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);

        if (!certificate) {
            return res.status(404).json({ message: 'Chứng chỉ không tồn tại' });
        }

        // Chỉ chủ nhân của chứng chỉ mới có quyền ẩn/hiện
        if (certificate.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa chứng chỉ này' });
        }

        certificate.isPublic = req.body.isPublic !== undefined ? req.body.isPublic : certificate.isPublic;

        const updatedCertificate = await certificate.save();
        res.json(updatedCertificate);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy toàn bộ danh sách chứng chỉ công khai của một user bất kỳ
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
            .select('-verificationCode'); // Bảo mật mã gốc khi xem công khai bên ngoài

        res.json(certificates);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy danh sách thành tích của bản thân học viên
// @route   GET /api/achievements/my-achievements
const getMyAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.find({ student: req.user._id })
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

// @desc    Lấy thành tích công khai của user khác để hiển thị Profile
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

// @desc    Bảng xếp hạng học viên dựa theo tổng điểm tích lũy thành tích
// @route   GET /api/achievements/leaderboard
const getLeaderboard = async (req, res) => {
    try {
        // $limit cua Mongo tu choi so <= 0 -> ?limit=-1 tung lam duong nay tra 500.
        const { soDong: limit } = phanTrang(req.query, { macDinh: 10, toiDa: 50 });

        const leaderboard = await Achievement.aggregate([
            {
                $group: {
                    _id: '$student',
                    totalPoints: { $sum: '$points' },
                    achievements: { $sum: 1 }
                }
            },
            { $sort: { totalPoints: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'users', // Đảm bảo tên collection trong DB của bạn là 'users' viết thường số nhiều
                    localField: '_id',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
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

// Helper kết nối tự động ghi nhận Thành tích hệ thống
const createAchievement = async (studentId, type, metadata = {}) => {
    try {
        const achievementDefs = {
            course_completed: {
                title: `Bậc Thầy Khóa Học: ${metadata.courseName}`,
                description: `Chúc mừng bạn đã hoàn thành trọn vẹn khóa học ${metadata.courseName}`,
                points: 50,
                level: 'silver',
                badgeImage: 'https://via.placeholder.com/100?text=Completed'
            },
            first_course_completed: {
                title: 'Bước Tiến Đầu Tiên',
                description: 'Hoàn thành xuất sắc khóa học đầu tiên của bạn trên hệ thống',
                points: 100,
                level: 'gold',
                badgeImage: 'https://via.placeholder.com/100?text=First'
            },
            perfect_score: {
                title: 'Điểm Số Tuyệt Đối',
                description: 'Đạt thành tích 100% số điểm trong một bài Quiz bài học',
                points: 75,
                level: 'platinum',
                badgeImage: 'https://via.placeholder.com/100?text=Perfect'
            },
            high_score: {
                title: 'Kẻ Chinh Phục Thử Thách',
                description: 'Đạt điểm số từ 90%+ trở lên trong một bài kiểm tra',
                points: 30,
                level: 'gold',
                badgeImage: 'https://via.placeholder.com/100?text=HighScore'
            }
        };

        const achDef = achievementDefs[type];
        if (!achDef) return;

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
        console.error('Lỗi trong tiến trình sinh tự động Achievement:', error.message);
    }
};

module.exports = {
    createCertificate,
    getMyCertificates,
    getCertificateById,
    taiChungChiPdf,
    verifyCertificate,
    updateCertificate,
    getUserPublicCertificates,
    getMyAchievements,
    getUserPublicAchievements,
    getLeaderboard,
    createAchievement
};