const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Tạo quiz mới
// @route   POST /api/quizzes
const createQuiz = async (req, res) => {
    try {
        const { courseId, lessonId, title, description, questions, passingScore, timeLimit, attempts } = req.body;

        // Validate
        if (!courseId || !title || !questions || questions.length === 0) {
            return res.status(400).json({ message: 'Vui lòng cung cấp courseId, title và ít nhất 1 câu hỏi' });
        }

        // Kiểm tra quyền instructor
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Khóa học không tồn tại' });
        }

        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền tạo quiz cho khóa học này' });
        }

        // Validate questions
        const questionsWithIds = questions.map((q) => ({
            _id: new mongoose.Types.ObjectId(),
            ...q
        }));

        const quiz = new Quiz({
            course: courseId,
            lesson: lessonId || undefined,
            title,
            description,
            questions: questionsWithIds,
            passingScore: passingScore || 70,
            timeLimit: timeLimit || null,
            attempts: attempts || 1,
            isPublished: false
        });

        const createdQuiz = await quiz.save();
        res.status(201).json(createdQuiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy tất cả quizzes của course
// @route   GET /api/quizzes/course/:courseId
const getCourseQuizzes = async (req, res) => {
    try {
        const { courseId } = req.params;

        const quizzes = await Quiz.find({ course: courseId })
            .populate('lesson', 'title')
            .sort({ createdAt: -1 });

        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy chi tiết quiz (không có đáp án đúng)
// @route   GET /api/quizzes/:id
const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('lesson', 'title');

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz không tồn tại' });
        }

        // Kiểm tra xem student có được phép xem không
        if (!quiz.isPublished && req.user.role === 'student') {
            // Chỉ instructor mới xem được quiz chưa publish
            const course = await Course.findById(quiz.course);
            if (course.instructor.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Quiz chưa được công bố' });
            }
        }

        // Nếu là student, ẩn đáp án
        if (req.user.role === 'student') {
            const quizObj = quiz.toObject();
            quizObj.questions = quizObj.questions.map((q) => {
                delete q.correctAnswer;
                q.options = q.options ? q.options.map((opt) => ({ text: opt.text })) : [];
                return q;
            });
            return res.json(quizObj);
        }

        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cập nhật quiz
// @route   PUT /api/quizzes/:id
const updateQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz không tồn tại' });
        }

        // Kiểm tra quyền
        const course = await Course.findById(quiz.course);
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa quiz này' });
        }

        // Không cho sửa nếu đã có attempts
        const attemptCount = await QuizAttempt.countDocuments({ quiz: quiz._id });
        if (attemptCount > 0) {
            return res.status(400).json({ message: 'Không thể chỉnh sửa quiz đã có người làm' });
        }

        quiz.title = req.body.title || quiz.title;
        quiz.description = req.body.description || quiz.description;
        quiz.passingScore = req.body.passingScore !== undefined ? req.body.passingScore : quiz.passingScore;
        quiz.timeLimit = req.body.timeLimit !== undefined ? req.body.timeLimit : quiz.timeLimit;
        quiz.attempts = req.body.attempts !== undefined ? req.body.attempts : quiz.attempts;
        quiz.randomizeQuestions = req.body.randomizeQuestions !== undefined ? req.body.randomizeQuestions : quiz.randomizeQuestions;
        quiz.randomizeOptions = req.body.randomizeOptions !== undefined ? req.body.randomizeOptions : quiz.randomizeOptions;
        quiz.showAnswers = req.body.showAnswers !== undefined ? req.body.showAnswers : quiz.showAnswers;

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

// @desc    Publish/Unpublish quiz
// @route   PUT /api/quizzes/:id/publish
const publishQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz không tồn tại' });
        }

        // Kiểm tra quyền
        const course = await Course.findById(quiz.course);
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền thay đổi quiz này' });
        }

        quiz.isPublished = !quiz.isPublished;
        const updatedQuiz = await quiz.save();

        res.json({
            message: quiz.isPublished ? 'Quiz đã được công bố' : 'Quiz đã ẩn',
            quiz: updatedQuiz
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Xóa quiz
// @route   DELETE /api/quizzes/:id
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz không tồn tại' });
        }

        // Kiểm tra quyền
        const course = await Course.findById(quiz.course);
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa quiz này' });
        }

        // Xóa tất cả attempts
        await QuizAttempt.deleteMany({ quiz: quiz._id });
        await Quiz.findByIdAndDelete(req.params.id);

        res.json({ message: 'Xóa quiz thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/submit
const submitQuizAttempt = async (req, res) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;

        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz không tồn tại' });
        }

        if (!quiz.isPublished) {
            return res.status(403).json({ message: 'Quiz chưa được công bố' });
        }

        // Kiểm tra số lần attempt
        const attemptCount = await QuizAttempt.countDocuments({
            quiz: id,
            student: req.user._id
        });

        if (attemptCount >= quiz.attempts) {
            return res.status(400).json({
                message: `Bạn đã hết lần làm bài (${quiz.attempts} lần)`
            });
        }

        // Tính điểm
        let totalScore = 0;
        const gradedAnswers = answers.map((answer) => {
            const question = quiz.questions.find((q) => q._id.toString() === answer.questionId);

            if (!question) {
                return null;
            }

            let isCorrect = false;
            let pointsEarned = 0;

            if (question.type === 'multiple_choice' || question.type === 'true_false') {
                const correctOption = question.options.find((opt) => opt.isCorrect);
                isCorrect = answer.studentAnswer === correctOption.text;
            } else if (question.type === 'short_answer') {
                // Case-insensitive comparison
                isCorrect = answer.studentAnswer.toLowerCase().trim() === 
                           question.correctAnswer.toLowerCase().trim();
            }
            // Essay type: không tự động chấm, cần instructor review

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

        const percentage = Math.round((totalScore / quiz.totalPoints) * 100);
        const passed = percentage >= quiz.passingScore;

        const quizAttempt = new QuizAttempt({
            quiz: id,
            student: req.user._id,
            answers: gradedAnswers,
            score: totalScore,
            percentage,
            passed,
            submittedAt: new Date(),
            attemptNumber: attemptCount + 1
        });

        const savedAttempt = await quizAttempt.save();

        res.status(201).json({
            attemptId: savedAttempt._id,
            score: savedAttempt.score,
            percentage: savedAttempt.percentage,
            passed: savedAttempt.passed,
            totalPoints: quiz.totalPoints,
            message: passed ? 'Bạn đã đạt điểm yêu cầu!' : 'Bạn chưa đạt điểm yêu cầu'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy kết quả quiz attempt
// @route   GET /api/quizzes/:id/attempt/:attemptId
const getQuizAttemptResult = async (req, res) => {
    try {
        const { id, attemptId } = req.params;

        const attempt = await QuizAttempt.findById(attemptId)
            .populate('student', 'name email')
            .populate('quiz');

        if (!attempt) {
            return res.status(404).json({ message: 'Attempt không tồn tại' });
        }

        // Kiểm tra quyền: student xem kết quả của mình, instructor xem tất cả
        if (attempt.student._id.toString() !== req.user._id.toString() && req.user.role !== 'instructor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xem kết quả này' });
        }

        // Nếu là student, chỉ show đáp án nếu quiz cho phép
        if (req.user.role === 'student' && !attempt.quiz.showAnswers) {
            attempt.quiz.questions = attempt.quiz.questions.map((q) => ({
                ...q,
                correctAnswer: undefined,
                explanation: undefined
            }));
        }

        res.json(attempt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy tất cả attempts của student cho 1 quiz
// @route   GET /api/quizzes/:id/attempts
const getQuizAttempts = async (req, res) => {
    try {
        const { id } = req.params;

        const attempts = await QuizAttempt.find({
            quiz: id,
            student: req.user._id
        })
            .sort({ createdAt: -1 });

        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Lấy thống kê quiz results (instructor only)
// @route   GET /api/quizzes/:id/stats
const getQuizStats = async (req, res) => {
    try {
        const { id } = req.params;

        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz không tồn tại' });
        }

        // Kiểm tra quyền
        const course = await Course.findById(quiz.course);
        if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xem thống kê này' });
        }

        const attempts = await QuizAttempt.find({ quiz: id });

        if (attempts.length === 0) {
            return res.json({
                totalAttempts: 0,
                averageScore: 0,
                passRate: 0,
                attempts: []
            });
        }

        const passCount = attempts.filter((a) => a.passed).length;
        const averageScore = Math.round(
            attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
        );

        const stats = {
            totalAttempts: attempts.length,
            averageScore,
            passRate: Math.round((passCount / attempts.length) * 100),
            passCount,
            failCount: attempts.length - passCount,
            attempts: attempts.map((a) => ({
                _id: a._id,
                student: a.student,
                score: a.score,
                percentage: a.percentage,
                passed: a.passed,
                attemptNumber: a.attemptNumber,
                submittedAt: a.submittedAt
            }))
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createQuiz,
    getCourseQuizzes,
    getQuizById,
    updateQuiz,
    publishQuiz,
    deleteQuiz,
    submitQuizAttempt,
    getQuizAttemptResult,
    getQuizAttempts,
    getQuizStats
};
