/**
 * Hoi dap giua hoc vien va giang vien, gan theo tung bai hoc.
 *
 * CONG KIEM QUYEN: moi duong o day deu goi canViewContent() truoc khi lam bat
 * cu viec gi. Ly do khong phai vi cau hoi la "noi dung bai hoc", ma vi:
 *
 *   - Cau hoi va cau tra loi trich thang noi dung bai ra ("doan video phut 12
 *     thay noi ... em khong hieu"). Mo cho khach doc la mo mot duong vong de
 *     doc noi dung khoa co phi ma khong tra tien - dung cai lo ma
 *     utils/contentAccess.js sinh ra de va.
 *   - Danh sach nguoi hoi la danh sach nguoi da mua khoa. Do la du lieu cua
 *     hoc vien, khong phai thu de ban khoa hoc.
 *
 * Day kiem do nam o utils/lessonGate.js va dung CHUNG voi ghi chu bai hoc.
 * Dung tu kiem lai o day: chep lam hai ban la som muon co mot ban thieu buoc
 * "bai co thuoc dung khoa vua kiem quyen khong".
 */

const mongoose = require('mongoose');

const Course = require('../models/Course');
const LessonQuestion = require('../models/LessonQuestion');

const {
    getLessonInCourse,
    bonusReply,
    roleInCourse,
} = require('../utils/lessonGate');
const { sendNotification } = require('./notificationController');

const PAGE_SIZE = 20;
const MAX_LENGTH = 2000;

// @desc    Danh sach cau hoi cua mot bai hoc
// @route   GET /api/hoi-dap?courseId=...&lessonId=...&trang=1
// @access  nguoi da ghi danh / giang vien cua khoa / admin
const getQuestions = async (req, res) => {
    try {
        const { courseId, lessonId } = req.query || {};
        const add = await getLessonInCourse(courseId, lessonId, req.user);
        if (add.loi) return bonusReply(res, add);

        const page = Math.max(parseInt(req.query.trang, 10) || 1, 1);

        const [list, total] = await Promise.all([
            LessonQuestion.find({ lesson: add.bai._id })
                .sort({ createdAt: -1 })
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE)
                .populate('student', 'name email avatar')
                .populate('traLoi.user', 'name email avatar')
                .lean(),
            LessonQuestion.countDocuments({ lesson: add.bai._id }),
        ]);

        res.status(200).json({
            danhSach: list,
            trang: page,
            tong: total,
            conNua: page * PAGE_SIZE < total,
            // De giao dien biet co hien nut cua giang vien hay khong, thay vi tu
            // doan tu `role` - vai tro he thong khong noi len vai tro o khoa nay.
            vaiTro: roleInCourse(add.khoa, req.user),
        });
    } catch (error) {
        console.error('[hoi-dap]', error.message);
        res.status(500).json({ message: 'Không đọc được phần hỏi đáp.' });
    }
};

// @desc    Dat cau hoi moi
// @route   POST /api/hoi-dap
// @access  nguoi da ghi danh / giang vien cua khoa / admin
const questionShape = async (req, res) => {
    try {
        const { courseId, lessonId, noiDung: content } = req.body || {};

        // Kiem do dai TRUOC khi di CSDL: mot chuoi mot megabyte khong dang de
        // ton mot luot truy van.
        const questionItem = typeof content === 'string' ? content.trim() : '';
        if (questionItem.length < 5) {
            return res.status(400).json({ message: 'Câu hỏi quá ngắn (tối thiểu 5 ký tự).' });
        }
        if (questionItem.length > MAX_LENGTH) {
            return res
                .status(400)
                .json({ message: `Câu hỏi quá dài (tối đa ${MAX_LENGTH} ký tự).` });
        }

        const add = await getLessonInCourse(courseId, lessonId, req.user);
        if (add.loi) return bonusReply(res, add);

        const recent = await LessonQuestion.create({
            course: add.khoa._id,
            lesson: add.bai._id,
            student: req.user._id,
            noiDung: questionItem,
        });

        const day = await LessonQuestion.findById(recent._id)
            .populate('student', 'name email avatar')
            .lean();

        res.status(201).json({ cauHoi: day });
    } catch (error) {
        console.error('[hoi-dap]', error.message);
        res.status(500).json({ message: 'Không đăng được câu hỏi.' });
    }
};

// @desc    Tra loi mot cau hoi
// @route   POST /api/hoi-dap/:id/tra-loi
// @access  nguoi da ghi danh / giang vien cua khoa / admin
const replyQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã câu hỏi không hợp lệ.' });
        }

        const questionItem = typeof req.body?.noiDung === 'string' ? req.body.noiDung.trim() : '';
        if (!questionItem) {
            return res.status(400).json({ message: 'Bạn chưa nhập nội dung trả lời.' });
        }
        if (questionItem.length > MAX_LENGTH) {
            return res
                .status(400)
                .json({ message: `Câu trả lời quá dài (tối đa ${MAX_LENGTH} ký tự).` });
        }

        const question = await LessonQuestion.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
        }

        // Kiem quyen theo chinh khoa/bai CUA CAU HOI, khong lay tu req.body.
        // Lay tu body thi nguoi goi tu khai mot khoa ma ho co quyen, roi tra
        // loi vao cau hoi thuoc khoa khac.
        const add = await getLessonInCourse(question.course, question.lesson, req.user);
        if (add.loi) return bonusReply(res, add);

        const role = roleInCourse(add.khoa, req.user);

        question.traLoi.push({ user: req.user._id, vaiTro: role, noiDung: questionItem });

        // Giang vien hoac admin tra loi thi coi nhu da xu ly. Hoc vien tra loi
        // nhau thi khong - cau van con nam trong danh sach cho nguoi day.
        if (role !== 'hocVien') question.daGiaiQuyet = true;

        await question.save();

        // Bao cho nguoi hoi, tru khi ho tu tra loi chinh minh.
        if (String(question.student) !== String(req.user._id)) {
            await sendNotification(question.student, 'tra_loi_hoi_dap', {
                tenBai: add.bai.title,
                courseId: String(question.course),
                lessonId: String(question.lesson),
            });
        }

        const day = await LessonQuestion.findById(id)
            .populate('student', 'name email avatar')
            .populate('traLoi.user', 'name email avatar')
            .lean();

        res.status(201).json({ cauHoi: day });
    } catch (error) {
        console.error('[hoi-dap]', error.message);
        res.status(500).json({ message: 'Không gửi được câu trả lời.' });
    }
};

// @desc    Cau hoi CHUA TRA LOI trong cac khoa minh day
// @route   GET /api/hoi-dap/cho-giang-vien?trang=1&tatCa=0
// @access  giang vien (chi khoa cua minh) / admin (moi khoa)
//
// Day la duong dung toi index { course, daGiaiQuyet, createdAt } cua model.
// Khong co man hinh nay thi giang vien phai mo tung bai cua tung khoa de xem co
// ai hoi khong - tuc la ho se khong xem, va phan hoi dap thanh mot noi hoc vien
// dat cau hoi roi khong bao gio duoc tra loi.
//
// KHONG goi canViewContent() o day, va do la co chu dich: ham do kiem quyen
// XEM NOI DUNG cua mot khoa cu the. O day pham vi da bi chan hep ngay tu truy
// van - chi lay cau hoi cua nhung khoa ma chinh nguoi goi dang day.
const instructorQuestions = async (req, res) => {
    try {
        const isAdmin = req.user.role === 'admin';

        // Admin thay moi khoa; giang vien chi thay khoa minh day. Hoc vien
        // thuong se ra danh sach khoa rong -> cau hoi rong, khong can chan rieng.
        const courseFilter = isAdmin ? {} : { instructor: req.user._id };

        const myCourses = await Course.find(courseFilter).select('_id title slug').lean();
        if (myCourses.length === 0) {
            return res.status(200).json({ danhSach: [], trang: 1, tong: 0, conNua: false });
        }

        // tatCa=1 de xem ca cau da tra loi. Mac dinh chi hien cau CHUA xu ly -
        // day la mot hang doi viec, khong phai mot kho luu tru.
        const onlyUnresolved = req.query.tatCa !== '1';

        const conditions = {
            course: { $in: myCourses.map((k) => k._id) },
            ...(onlyUnresolved ? { daGiaiQuyet: false } : {}),
        };

        const page = Math.max(parseInt(req.query.trang, 10) || 1, 1);

        const [list, total] = await Promise.all([
            LessonQuestion.find(conditions)
                .sort({ createdAt: -1 })
                .skip((page - 1) * PAGE_SIZE)
                .limit(PAGE_SIZE)
                .populate('student', 'name email avatar')
                .populate('course', 'title slug')
                .populate('lesson', 'title')
                .populate('traLoi.user', 'name email avatar')
                .lean(),
            LessonQuestion.countDocuments(conditions),
        ]);

        res.status(200).json({
            danhSach: list,
            trang: page,
            tong: total,
            conNua: page * PAGE_SIZE < total,
            chiChuaXong: onlyUnresolved,
        });
    } catch (error) {
        console.error('[hoi-dap]', error.message);
        res.status(500).json({ message: 'Không đọc được danh sách câu hỏi.' });
    }
};

// @desc    Xoa cau hoi
// @route   DELETE /api/hoi-dap/:id
// @access  nguoi dat cau hoi / giang vien cua khoa / admin
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Mã câu hỏi không hợp lệ.' });
        }

        const question = await LessonQuestion.findById(id);
        if (!question) {
            return res.status(404).json({ message: 'Không tìm thấy câu hỏi.' });
        }

        const course = await Course.findById(question.course).select('instructor');

        const isOwner = String(question.student) === String(req.user._id);
        const isTeacher = !!course && String(course.instructor) === String(req.user._id);
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isTeacher && !isAdmin) {
            return res.status(403).json({ message: 'Bạn không có quyền xóa câu hỏi này.' });
        }

        await question.deleteOne();

        res.status(200).json({ message: 'Đã xóa câu hỏi.' });
    } catch (error) {
        console.error('[hoi-dap]', error.message);
        res.status(500).json({ message: 'Không xóa được câu hỏi.' });
    }
};

module.exports = {
    getQuestions,
    questionShape,
    replyQuestion,
    deleteQuestion,
    instructorQuestions,
    PAGE_SIZE,
    MAX_LENGTH,
};
