const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    type: {
        type: String,
        enum: [
            'first_course_completed', // Hoàn thành khóa đầu tiên
            'course_completed', // Hoàn thành khóa học
            'perfect_score', // Đạt 100% trong quiz
            'high_score', // Đạt 90%+ trong quiz
            'multiple_quizzes_passed', // Vượt qua 5+ quizzes
            'course_reviewer', // Viết 10+ reviews
            'helpful_reviewer', // Review được 50+ helpful votes
            'learning_streak', // Học liên tục 7 ngày
            'course_enrollment', // Đăng ký khóa thứ N
            'milestone_lessons', // Hoàn thành 50+ bài
            'custom' // Custom achievement
        ],
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    // Badge/Icon
    badgeImage: String, // URL to badge image

    // Thông tin liên quan
    relatedCourse: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },

    relatedQuiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },

    // Mức độ
    level: {
        type: String,
        enum: ['bronze', 'silver', 'gold', 'platinum'],
        default: 'bronze'
    },

    // Points (để ranking)
    points: {
        type: Number,
        default: 10
    },

    // Public profile
    isPublic: {
        type: Boolean,
        default: true
    },

    unlockedAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
