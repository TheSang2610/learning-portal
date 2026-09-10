const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const mongoose = require('mongoose');

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

        // 2. Nếu người dùng đăng nhập là Học viên (Student)
        if (req.user.role === 'student') {
            if (!isQuizPublished) {
                return res.status(403).json({ message: 'Bài tập/Đề thi này chưa được giảng viên công bố!' });
            }

            // 🎯 SỬA TẠI ĐÂY: Thay vì lấy cái mới nhất bất kỳ, ta tìm lượt làm bài nào ĐANG CÓ HIỆU LỰC ('submitted')
            const latestAttempt = await QuizAttempt.findOne({ 
                quiz: quiz._id, 
                student: req.user._id,
                status: 'submitted' 
            })
            .sort({ createdAt: -1 })
            .lean();

            if (latestAttempt) {
                quiz.latestAttempt = latestAttempt;
            }

            // 🎯 SỬA TẠI ĐÂY: Chỉ đếm các lượt làm bài hợp lệ thực sự để tính toán quyền xem đáp án
            const maxAttempts = quiz.attempts || 1;
            const validAttemptCount = await QuizAttempt.countDocuments({ 
                quiz: quiz._id, 
                student: req.user._id, 
                status: 'submitted' 
            });

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
            status: 'submitted'
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
                isCorrect = answer.studentAnswer && question.correctAnswer &&
                            answer.studentAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
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
            attemptNumber: attemptCount + 1, // Số lượt làm tiếp theo dựa trên số lượt hợp lệ thực tế
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

        const attempt = await QuizAttempt.findById(attemptId)
            .populate('student', 'name email')
            .populate('quiz');

        if (!attempt) return res.status(404).json({ message: 'Không tìm thấy dữ liệu lượt làm bài này' });

        if (attempt.student._id.toString() !== req.user._id.toString() && req.user.role !== 'instructor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xem kết quả của người khác' });
        }

        // Nếu hệ thống cấu hình ẩn đáp án sau khi làm xong, tiến hành xóa thông tin nhạy cảm trước khi trả về
        if (req.user.role === 'student' && !attempt.quiz.showAnswers) {
            const sanitizedAttempt = attempt.toObject();
            if (sanitizedAttempt.quiz && sanitizedAttempt.quiz.questions) {
                sanitizedAttempt.quiz.questions = sanitizedAttempt.quiz.questions.map((q) => ({
                    ...q,
                    correctAnswer: undefined,
                    explanation: undefined
                }));
            }
            return res.json(sanitizedAttempt);
        }

        res.json(attempt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc     Lấy lịch sử tất cả các lần làm bài của học viên hiện tại
// @route    GET /api/quizzes/:id/attempts
const getQuizAttempts = async (req, res) => {
    try {
        const { id } = req.params;

        const attempts = await QuizAttempt.find({ quiz: id, student: req.user._id })
            .sort({ createdAt: -1 });

        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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

        // 🎯 THAY VÌ UPDATE, TA XÓA BẢN GHI CŨ ĐỂ TRÁNH TRÙNG INDEX UNIQUE
        const deletedAttempt = await QuizAttempt.findOneAndDelete({ quiz: quizId, student: studentId });

        if (!deletedAttempt) {
            return res.status(404).json({ message: "Không tìm thấy lượt làm bài của học sinh này." });
        }

        // Tùy chọn: Bạn có thể lưu lý do này vào một bảng Log hệ thống khác nếu cần lưu vết,
        // hoặc đơn giản là giải phóng để học sinh được làm lại sạch sẽ.

        res.status(200).json({
            message: `Đã giải phóng bài làm cũ. Học sinh có thể làm lại bài mới ngay lập tức!`
        });

    } catch (error) {
        console.error("Lỗi allowStudentRetry:", error);
        res.status(500).json({ message: error.message });
    }
};

// Đừng quên export hàm này ra ở cuối file module.exports nhé!
// @desc     Lấy thống kê tổng hợp kết quả (Chỉ dành cho Giảng viên)
// @route    GET /api/quizzes/:id/stats
// @desc     Lấy thống kê kết quả Quiz và danh sách học viên chưa làm bài
// @route    GET /api/quizzes/:id/stats
const getQuizStats = async (req, res) => {
    try {
        const { id } = req.params;

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: 'Quiz không tồn tại' });

        // 1. Lấy tất cả lượt làm bài hợp lệ ('submitted') của bài quiz này
        const attempts = await QuizAttempt.find({ quiz: id, status: 'submitted' })
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
    getQuizById,
    updateQuiz,
    publishQuiz,
    deleteQuiz,
    submitQuizAttempt,
    allowStudentRetry,
    getQuizAttemptResult,
    getQuizAttempts,
    getQuizStats
};