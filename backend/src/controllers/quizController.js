const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const { canViewContent } = require('../utils/contentAccess');

// Trang thai cua mot luot HOP LE (tinh vao so luot, la "luot gan nhat").
// 'graded'/'reviewed' do ban code cu dat (23 luot thang 8/2026) - truoc
// 12/10/2026 cac luot nay bi lam ngo: mo de thay nhu chua lam, khong tinh luot,
// giang vien khong thay trong thong ke. Chi 'reset' (cho/tu lam lai) la khong tinh.
const VALID_ATTEMPT_STATUSES = ['submitted', 'graded', 'reviewed'];
const mongoose = require('mongoose');
const { attachPracticeQuiz } = require('../utils/practiceList');

// @desc    Danh sach bai luyen tap cho trang /practice (cong khai, khong can dang nhap)
// @route   GET /api/quizzes/practice
//
// Chi lay quiz DA XUAT BAN nam trong khoa hoc DA XUAT BAN. Tra thong tin tom tat,
// khong tra cau hoi - xem utils/practiceList.js. Lam bai thi van phai vao khoa
// hoc, nen cong noi dung co phi (contentAccess) khong bi di vong qua duong nay.
const getPracticeList = async (req, res) => {
    try {
        const publishedCourseIds = await Course.find({ isPublished: true }).select('_id').lean();

        const quizzes = await Quiz.find({
            isPublished: true,
            course: { $in: publishedCourseIds.map((k) => k._id) }
        })
            // Chi can _id cua cau hoi de dem so cau; khong keo noi dung/dap an ve
            .select('title description course questions._id')
            .populate('course', 'title slug')
            .lean();

        const attemptRecord = await QuizAttempt.aggregate([
            { $match: { quiz: { $in: quizzes.map((q) => q._id) } } },
            { $group: { _id: '$quiz', n: { $sum: 1 } } }
        ]);
        const attemptTotal = new Map(attemptRecord.map((x) => [String(x._id), x.n]));

        res.json(attachPracticeQuiz(quizzes, attemptTotal));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Tạo quiz mới
// @route   POST /api/quizzes
const createQuiz = async (req, res) => {
    try {
        const { courseId, lessonId, title, description, questions, passingScore, timeLimit, attempts } = req.body;

        if (!courseId || !title || !questions || questions.length === 0) {
            return res.status(400).json({ message: 'Vui lòng cung cấp courseId, title và ít nhất 1 câu hỏi' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Khóa học không tồn tại' });
        }

        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền tạo quiz cho khóa học này' });
        }

        // Tự động gán ObjectId cho từng câu hỏi mới tạo
        const questionsWithIds = questions.map((q) => ({
            _id: new mongoose.Types.ObjectId(),
            ...q,
            points: Number(q.points) || 1 // Đảm bảo points luôn là Number
        }));

        // 🎯 TÍNH TỔNG ĐIỂM CỦA BÀI QUIZ TRƯỚC KHI LƯU
        const totalPoints = questionsWithIds.reduce((sum, q) => sum + q.points, 0);

        const quiz = new Quiz({
            course: courseId,
            lesson: lessonId || undefined,
            title,
            description,
            questions: questionsWithIds,
            totalPoints, // 🎯 Đưa trường này vào để tránh lỗi Schema Validation
            passingScore: passingScore || 70,
            timeLimit: timeLimit || null,
            attempts: attempts || 1,
            isPublished: false
        });

        const createdQuiz = await quiz.save();
        res.status(201).json(createdQuiz);
    } catch (error) {
        // Trả về log chi tiết trên console của terminal backend để bạn dễ debug
        console.error("LỖI TẠI BACKEND CREATE QUIZ:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc     Lấy tất cả quizzes của course (Có lọc theo bài học)
// @route    GET /api/quizzes/course/:courseId
const getCourseQuizzes = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { lessonId } = req.query; // Nhận lessonId từ query string

        // Tối ưu hóa bảo mật ẩn đáp án đối với học viên
        const selectFields = req.user && req.user.role === 'student' 
            ? '-questions.correctAnswer -questions.options.isCorrect' 
            : '';

        // Tạo object bộ lọc động
        let filter = { course: courseId };
        if (lessonId) {
            filter.lesson = lessonId; // Lọc chính xác theo bài học nếu truyền lên
        }

        // 🎯 ĐÃ SỬA: Truyền object filter vào hàm find thay vì fix cứng courseId
        const quizzes = await Quiz.find(filter)
            .select(selectFields)
            .populate('lesson', 'title')
            .sort({ createdAt: -1 });

        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc     Lấy chi tiết quiz (Tự động đính kèm lượt làm bài mới nhất của học sinh)
// @route    GET /api/quizzes/:id
const getQuizById = async (req, res) => {
    try {
        // 1. Sử dụng .lean() để biến đổi kết quả thành Plain JavaScript Object nhằm thêm thuộc tính động dễ dàng
        const quiz = await Quiz.findById(req.params.id)
            .populate('lesson', 'title')
            .lean();

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz không tồn tại trong hệ thống' });
        }

        // Kiểm tra an toàn trạng thái Published
        const isQuizPublished = quiz.isPublished === true || String(quiz.isPublished) === 'true';

        // 2. Luot lam cua CHINH nguoi dang xem - moi vai tro, khong chi hoc vien.
        //
        // Truoc 10/10/2026 doan nay nam trong nhanh `role === 'student'`: admin hay
        // giang vien tu lam thu bai thi khong nhan latestAttempt, giao dien hien de
        // trang nhu chua lam, nop thi may chu bao "da het luot" (may chu van dem
        // luot cua ho). Rieng viec GIAU DAP AN ben duoi van chi ap cho hoc vien.
        const latestAttempt = await QuizAttempt.findOne({
            quiz: quiz._id,
            student: req.user._id,
            status: { $in: VALID_ATTEMPT_STATUSES }
        })
        .sort({ createdAt: -1 })
        .lean();
        if (latestAttempt) quiz.latestAttempt = latestAttempt;

        const validAttemptCount = await QuizAttempt.countDocuments({
            quiz: quiz._id,
            student: req.user._id,
            status: { $in: VALID_ATTEMPT_STATUSES }
        });
        quiz.usedAttempts = validAttemptCount;

        // 3. Hoc vien: chan de chua cong bo va giau dap an
        if (req.user.role === 'student') {
            if (!isQuizPublished) {
                return res.status(403).json({ message: 'Bài tập/Đề thi này chưa được giảng viên công bố!' });
            }

            const maxAttempts = quiz.attempts || 1;

            // Học sinh chỉ được xem đáp án đúng/sai nếu đã PASSED hoặc ĐÃ HẾT LƯỢT LÀM BÀI HỢP LỆ
            const canSeeAnswers = latestAttempt && (latestAttempt.passed || validAttemptCount >= maxAttempts);
            if (quiz.questions && Array.isArray(quiz.questions)) {
                quiz.questions = quiz.questions.map((q) => {
                    delete q.correctAnswer;
                    delete q.explanation;
                    
                    if (q.options && Array.isArray(q.options)) {
                        q.options = q.options.map((opt) => {
                            const baseOption = { _id: opt._id, text: opt.text };
                            // Nếu đủ điều kiện xem lại bài, gửi kèm isCorrect về cho Frontend render màu xanh/đỏ
                            if (canSeeAnswers) {
                                baseOption.isCorrect = opt.isCorrect;
                            }
                            return baseOption;
                        });
                    } else {
                        q.options = [];
                    }
                    return q;
                });
            }
        }

        // Trả về object quiz đã được gộp trường `latestAttempt`
        res.json(quiz);
    } catch (error) {
        console.error("LỖI TẠI GET_QUIZ_BY_ID BACKEND:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// @desc     Cập nhật cấu trúc quiz
// @route    PUT /api/quizzes/:id
const updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz không tồn tại' });
        }

        const course = await Course.findById(quiz.course);
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa quiz này' });
        }

        // Chặn chỉnh sửa tuyệt đối nếu đã phát sinh dữ liệu bài làm lịch sử
        const attemptCount = await QuizAttempt.countDocuments({ quiz: quiz._id });
        if (attemptCount > 0) {
            return res.status(400).json({ message: 'Không thể chỉnh sửa cấu trúc đề thi vì đã có học viên làm bài' });
        }

        const fieldsToUpdate = [
            'title', 'description', 'passingScore', 'timeLimit', 
            'attempts', 'randomizeQuestions', 'randomizeOptions', 'showAnswers'
        ];

        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) quiz[field] = req.body[field];
        });

        if (req.body.questions) {
            quiz.questions = req.body.questions.map((q) => ({
                _id: q._id || new mongoose.Types.ObjectId(),
                ...q
            }));
        }

        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc     Publish/Unpublish công bố quiz
// @route    PUT /api/quizzes/:id/publish
const publishQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz không tồn tại' });

        const course = await Course.findById(quiz.course);
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền thao tác trên quiz này' });
        }

        quiz.isPublished = !quiz.isPublished;
        const updatedQuiz = await quiz.save();

        res.json({
            message: quiz.isPublished ? 'Quiz đã được công bố rộng rãi' : 'Quiz đã được chuyển về trạng thái ẩn',
            quiz: updatedQuiz
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc     Xóa bài quiz hệ thống
// @route    DELETE /api/quizzes/:id
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz không tồn tại' });

        const course = await Course.findById(quiz.course);
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa quiz này' });
        }

        // Xóa sạch các tài liệu liên quan thông qua transaction hoặc lệnh xóa hàng loạt
        await QuizAttempt.deleteMany({ quiz: quiz._id });
        await Quiz.findByIdAndDelete(req.params.id);

        res.json({ message: 'Xóa bài thi và dữ liệu lịch sử liên quan thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc     Nộp bài và chấm điểm tự động
// @route    POST /api/quizzes/:id/submit
const submitQuizAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        const { answers, startedAt } = req.body; 

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: 'Quiz không tồn tại' });
        if (!quiz.isPublished) return res.status(403).json({ message: 'Bài thi này chưa được mở' });

        // 🎯 SỬA TẠI ĐÂY: Chỉ đếm những lượt đã nộp thành công, bỏ qua lượt bị giảng viên 'reset'
        const attemptCount = await QuizAttempt.countDocuments({ 
            quiz: id, 
            student: req.user._id,
            status: { $in: VALID_ATTEMPT_STATUSES }
        });
        
        if (attemptCount >= quiz.attempts) {
            return res.status(400).json({ message: `Bạn đã dùng hết giới hạn lượt làm bài (${quiz.attempts} lượt)` });
        }

        let totalScore = 0;
        const gradedAnswers = (answers || []).map((answer) => {
            const question = quiz.questions.find((q) => q._id.toString() === answer.questionId);
            if (!question) return null;

            let isCorrect = false;
            let pointsEarned = 0;

            if (question.type === 'multiple_choice' || question.type === 'true_false') {
                const correctOption = question.options.find((opt) => opt.isCorrect);
                isCorrect = correctOption && answer.studentAnswer === correctOption.text;
            } else if (question.type === 'short_answer') {
                // Boolean(...) bat buoc: bo trong o tra loi thi bieu thuc && tra ve
                // chuoi rong "", Mongoose khong ep "" thanh Boolean duoc va ca bai
                // nop bi tu choi voi loi "Cast to Boolean failed".
                isCorrect = Boolean(
                    answer.studentAnswer && question.correctAnswer &&
                    String(answer.studentAnswer).toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
                );
            }

            if (isCorrect) {
                pointsEarned = question.points || 1;
                totalScore += pointsEarned;
            }

            return {
                questionId: question._id,
                studentAnswer: answer.studentAnswer,
                isCorrect,
                pointsEarned
            };
        }).filter((a) => a !== null);

        const percentage = quiz.totalPoints > 0 ? Math.round((totalScore / quiz.totalPoints) * 100) : 0;
        const passed = percentage >= quiz.passingScore;

        const startTime = startedAt ? new Date(startedAt) : new Date();
        const endTime = new Date();
        const timeSpent = Math.max(0, Math.round((endTime.getTime() - startTime.getTime()) / 1000));

        const quizAttempt = new QuizAttempt({
            quiz: id,
            student: req.user._id,
            answers: gradedAnswers,
            score: totalScore,
            percentage,
            passed,
            timeSpent,
            startedAt: startTime,
            submittedAt: endTime,
            // So thu tu dem tren MOI luot (ke ca luot giang vien da cho lam lai),
            // khong chi luot hop le: luot cu nay gio duoc GIU lai de hoc vien xem
            // lai, ma index unique { quiz, student, attemptNumber } khong cho trung.
            attemptNumber: (await QuizAttempt.countDocuments({ quiz: id, student: req.user._id })) + 1,
            status: 'submitted'
        });

        const savedAttempt = await quizAttempt.save();

        let lessonCompletedMessage = '';
        if (passed && quiz.lesson) {
            const Enrollment = require('../models/Enrollment');
            const Course = require('../models/Course'); 
            
            const enrollment = await Enrollment.findOne({
                course: quiz.course,
                student: req.user._id
            });

            if (enrollment) {
                const currentCourse = await Course.findById(quiz.course);
                const totalLessons = currentCourse ? currentCourse.lessons.length : 0;

                // Tìm index của bài học hiện tại trong mảng tiến độ
                let lpIndex = enrollment.lessonProgress.findIndex(
                    (lp) => lp.lesson && lp.lesson.toString() === quiz.lesson.toString()
                );

                if (lpIndex !== -1) {
                    // Nếu bài học chưa hoàn thành, cập nhật thành hoàn thành
                    if (enrollment.lessonProgress[lpIndex].status !== 'completed') {
                        enrollment.lessonProgress[lpIndex].status = 'completed';
                        enrollment.lessonProgress[lpIndex].completedAt = new Date();
                        lessonCompletedMessage = ' Bài học này của bạn đã được đánh dấu hoàn thành 100% nhờ vượt qua bài Quiz!';
                    }
                } else {
                    // Trường hợp hy hữu: Bài học chưa có trong danh sách tiến độ, thêm mới chuẩn xác
                    enrollment.lessonProgress.push({
                        lesson: quiz.lesson,
                        status: 'completed',
                        watchedDuration: 0,
                        completedAt: new Date()
                    });
                    lessonCompletedMessage = ' Bài học này của bạn đã được đánh dấu hoàn thành 100%!';
                }

                enrollment.lastAccessedAt = new Date();
                
                // Tính toán lại tổng tiến độ dựa trên số bài học thực tế đạt 'completed'
                const completedLessonsCount = enrollment.lessonProgress.filter(lp => lp.status === 'completed').length;
                enrollment.totalProgress = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

                // Tự động hoàn thành khóa học nếu tiến độ đạt 100%
                if (enrollment.totalProgress === 100 && enrollment.status === 'active') {
                    enrollment.status = 'completed';
                    enrollment.completedAt = new Date();
                }
                
                await enrollment.save();
            }
        }

        res.status(201).json({
            _id: savedAttempt._id,
            attemptId: savedAttempt._id,
            score: savedAttempt.score,
            percentage: savedAttempt.percentage,
            passed: savedAttempt.passed,
            totalPoints: quiz.totalPoints,
            timeSpent,
            attemptNumber: savedAttempt.attemptNumber,
            // So luot HOP LE da dung (khong tinh luot giang vien cho lam lai) -
            // giao dien dung so nay de biet con duoc lam nua khong.
            usedAttempts: attemptCount + 1,
            answers: savedAttempt.answers,
            message: passed 
                ? `Chúc mừng bạn đã vượt qua bài kiểm tra!${lessonCompletedMessage}` 
                : 'Rất tiếc, bạn chưa đạt mức điểm yêu cầu. Hãy thử lại ở lượt sau.'
        });
    } catch (error) {
        console.error("LỖI TẠI SUBMIT_QUIZ_ATTEMPT:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc     Xem kết quả chi tiết của lượt làm bài cụ thể
// @route    GET /api/quizzes/:id/attempt/:attemptId
const getQuizAttemptResult = async (req, res) => {
    try {
        const { attemptId } = req.params;

        const attempt = await QuizAttempt.findById(attemptId).lean();
        if (!attempt || String(attempt.quiz) !== String(req.params.id)) {
            return res.status(404).json({ message: 'Không tìm thấy dữ liệu lượt làm bài này' });
        }

        const isOwner = String(attempt.student) === String(req.user._id);
        const isStaff = req.user.role === 'instructor' || req.user.role === 'admin';
        if (!isOwner && !isStaff) {
            return res.status(403).json({ message: 'Bạn không có quyền xem kết quả của người khác' });
        }

        const quiz = await Quiz.findById(attempt.quiz).select('title questions attempts passingScore').lean();
        if (!quiz) return res.status(404).json({ message: 'Quiz không tồn tại' });

        // Cung luat voi getQuizById: hoc vien chi thay DAP AN DUNG khi da dat hoac
        // da het luot hop le. Truoc 10/10/2026 duong nay tra nguyen de kem
        // options.isCorrect cho moi luot - hoc vien con luot mo cong cu nha phat
        // trien la doc duoc dap an. Cau nao minh lam dung/sai thi luon thay
        // (attempt.answers[].isCorrect), vi do la bai cua chinh ho.
        let canSeeAnswers = isStaff;
        if (!canSeeAnswers) {
            const [passedAny, used] = await Promise.all([
                QuizAttempt.exists({ quiz: quiz._id, student: req.user._id, status: { $in: VALID_ATTEMPT_STATUSES }, passed: true }),
                QuizAttempt.countDocuments({ quiz: quiz._id, student: req.user._id, status: { $in: VALID_ATTEMPT_STATUSES } }),
            ]);
            canSeeAnswers = Boolean(passedAny) || used >= (quiz.attempts || 1);
        }

        const questions = (quiz.questions || []).map((q) => ({
            _id: q._id,
            text: q.text,
            type: q.type,
            points: q.points,
            options: (q.options || []).map((o) => (canSeeAnswers
                ? { _id: o._id, text: o.text, isCorrect: o.isCorrect }
                : { _id: o._id, text: o.text })),
            ...(canSeeAnswers ? { correctAnswer: q.correctAnswer, explanation: q.explanation } : {}),
        }));

        res.json({
            attempt,
            quiz: { _id: quiz._id, title: quiz.title, passingScore: quiz.passingScore, questions },
            canSeeAnswers,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc     Lich su cac luot lam cua chinh minh (ban tom tat, khong kem bai lam)
// @route    GET /api/quizzes/:id/attempts
const getQuizAttempts = async (req, res) => {
    try {
        const { id } = req.params;

        // Ca luot giang vien da cho lam lai (status 'reset') cung tra ve, de hoc
        // vien xem lai minh tung sai cau nao - chi danh dau la "khong tinh".
        const attempts = await QuizAttempt.find({ quiz: id, student: req.user._id })
            .select('attemptNumber score percentage passed submittedAt timeSpent status retryReason')
            .sort({ createdAt: -1 })
            .lean();

        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * Ai duoc quan ly luot lam cua mot bai kiem tra: admin, hoac giang vien CUA
 * KHOA chua bai do. Truoc 10/10/2026 route chi co middleware `instructor`, nen
 * giang vien khoa A cung "cho lam lai" duoc bai cua khoa B.
 */
const canManageQuiz = async (quiz, user) => {
    if (!quiz || !user) return false;
    if (user.role === 'admin') return true;
    if (user.role !== 'instructor') return false;
    const course = await Course.findById(quiz.course).select('instructor').lean();
    return Boolean(course && String(course.instructor) === String(user._id));
};

// @desc     Cho phép một học sinh làm lại bài (Giảng viên/Admin kích hoạt)
// @route    PUT /api/quizzes/:id/allow-retry/:studentId
const allowStudentRetry = async (req, res) => {
    try {
        const { id: quizId, studentId } = req.params;
        const { reason } = req.body;

        if (!reason || !reason.trim()) {
            return res.status(400).json({ message: "Vui lòng cung cấp lý do cho phép làm lại bài!" });
        }

        const quiz = await Quiz.findById(quizId).select('course').lean();
        if (!quiz) return res.status(404).json({ message: 'Quiz không tồn tại' });
        if (!(await canManageQuiz(quiz, req.user))) {
            return res.status(403).json({ message: 'Bạn không quản lý bài kiểm tra này' });
        }

        // Truoc 10/10/2026 cho nay XOA luot cu (de tranh trung attemptNumber).
        // Gio GIU lai, chi doi sang 'reset' - khong tinh vao so luot, nhung hoc
        // vien van xem lai duoc minh da sai cau nao. attemptNumber cua luot moi
        // dem tren moi luot nen khong con trung (xem submitQuizAttempt).
        const resetAttempt = await QuizAttempt.findOneAndUpdate(
            { quiz: quizId, student: studentId, status: { $in: VALID_ATTEMPT_STATUSES } },
            { $set: { status: 'reset', retryReason: reason.trim().slice(0, 500) } },
            { sort: { createdAt: -1 }, new: true }
        );

        if (!resetAttempt) {
            return res.status(404).json({ message: "Không tìm thấy lượt làm bài của học sinh này." });
        }

        res.status(200).json({
            message: `Đã cho phép làm lại. Lượt cũ vẫn được giữ trong lịch sử của học sinh nhưng không tính vào số lượt.`
        });

    } catch (error) {
        console.error("Lỗi allowStudentRetry:", error);
        res.status(500).json({ message: error.message });
    }
};

// Đừng quên export hàm này ra ở cuối file module.exports nhé!
// @desc     Lấy thống kê tổng hợp kết quả (Chỉ dành cho Giảng viên)
// @route    GET /api/quizzes/:id/stats

// @desc     Tu DAT LAI bai lam cua chinh minh de lam lai tu dau
// @route    PUT /api/quizzes/:id/reset-mine
// Ai dang co quyen hoc khoa (hoc vien da ghi danh con han, giang vien cua khoa,
// admin) deu dung duoc - chu du an chon vay (10/10/2026). Doi lai, gioi han so
// luot khong con chan duoc: hoc vien het luot thi tu dat lai. Lich su van giu
// du (luot cu doi sang 'reset'), va bai da dat thi van tinh la da hoan thanh.
const resetMyAttempts = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).select('course').lean();
        if (!quiz) return res.status(404).json({ message: 'Quiz không tồn tại' });
        const course = await Course.findById(quiz.course).select('instructor').lean();
        if (!course || !(await canViewContent(course, req.user))) {
            return res.status(403).json({ message: 'Bạn chưa có quyền học khóa này' });
        }

        // Giu lai cac luot cu trong lich su, chi danh dau 'reset' (khong tinh luot).
        const out = await QuizAttempt.updateMany(
            { quiz: quiz._id, student: req.user._id, status: { $in: VALID_ATTEMPT_STATUSES } },
            { $set: { status: 'reset', retryReason: 'Tự đặt lại để làm lại' } }
        );
        res.json({ message: 'Đã đặt lại bài làm, bạn có thể làm lại từ đầu.', reset: out.modifiedCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc     Lấy thống kê kết quả Quiz và danh sách học viên chưa làm bài
// @route    GET /api/quizzes/:id/stats
const getQuizStats = async (req, res) => {
    try {
        const { id } = req.params;

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: 'Quiz không tồn tại' });

        // 1. Lấy tất cả lượt làm bài hợp lệ ('submitted') của bài quiz này
        const attempts = await QuizAttempt.find({ quiz: id, status: { $in: VALID_ATTEMPT_STATUSES } })
            .populate('student', 'name email');

        // 2. Lấy danh sách TẤT CẢ học sinh đã ghi danh vào khóa học này
        const Enrollment = require('../models/Enrollment'); // Thay đường dẫn bằng model của bạn
        const enrolledStudents = await Enrollment.find({ course: quiz.course })
            .populate('student', 'name email')
            .lean();

        // Lấy ra mảng các ID của học sinh đã nộp bài
        const submittedStudentIds = attempts.map(a => a.student._id.toString());

        // 3. Lọc danh sách những học sinh CHƯA LÀM BÀI (Có tên trong lớp nhưng không có trong danh sách đã nộp)
        const unsubmittedList = enrolledStudents
            .map(e => e.student)
            .filter(student => student && !submittedStudentIds.includes(student._id.toString()));

        // 4. Gom nhóm lượt làm bài mới nhất của những người ĐÃ LÀM để hiển thị lên bảng điểm
        const latestAttemptsMap = {};
        attempts.forEach(a => {
            const studentId = a.student._id.toString();
            if (!latestAttemptsMap[studentId] || new Date(a.submittedAt) > new Date(latestAttemptsMap[studentId].submittedAt)) {
                latestAttemptsMap[studentId] = a;
            }
        });

        // Tính toán các thông số tổng quan
        const totalAttempts = attempts.length;
        const passCount = attempts.filter(a => a.passed).length;
        const averageScore = totalAttempts > 0 
            ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts) 
            : 0;

        res.json({
            title: quiz.title,
            totalAttempts,
            averageScore,
            passRate: totalAttempts > 0 ? Math.round((passCount / totalAttempts) * 100) : 0,
            submittedList: Object.values(latestAttemptsMap).map((a) => ({
                _id: a._id,
                student: a.student,
                score: a.score,
                percentage: a.percentage,
                passed: a.passed,
                attemptNumber: a.attemptNumber,
                submittedAt: a.submittedAt
            })),
            unsubmittedList // 🎯 Danh sách học sinh làm thiếu gửi về đây
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đừng quên viết thêm route tương ứng cho hàm này nhé!
// router.get('/:id/stats', protect, instructorOnly, getQuizStats);

module.exports = {
    createQuiz,
    getCourseQuizzes,
    getPracticeList,
    getQuizById,
    updateQuiz,
    publishQuiz,
    deleteQuiz,
    submitQuizAttempt,
    allowStudentRetry,
    resetMyAttempts,
    getQuizAttemptResult,
    getQuizAttempts,
    getQuizStats
};