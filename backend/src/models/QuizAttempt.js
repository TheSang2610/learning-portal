const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Câu trả lời của student
    answers: [
        {
            questionId: mongoose.Schema.Types.ObjectId,
            studentAnswer: {
                type: mongoose.Schema.Types.Mixed // Có thể là string, boolean, etc
            },
            isCorrect: Boolean,
            pointsEarned: Number
        }
    ],

    // Kết quả
    score: {
        type: Number, // Tổng điểm
        required: true
    },

    percentage: {
        type: Number, // %
        required: true
    },

    passed: {
        type: Boolean, // score >= passingScore
        required: true
    },

    // Thời gian
    timeSpent: {
        type: Number, // seconds
        default: 0
    },

    startedAt: {
        type: Date,
        default: Date.now
    },

    submittedAt: {
        type: Date,
        required: true
    },

    // Lần thứ mấy (1st, 2nd, 3rd attempt)
    attemptNumber: {
        type: Number,
        default: 1
    },

    retryReason: {
        type: String,
        default: ""
    },

    // Feedback từ instructor (tuỳ chọn)
    feedback: String,

    status: {
        type: String,
        enum: ['submitted', 'graded', 'reviewed', 'reset'],
        default: 'submitted'
    }

}, { timestamps: true });

// Index: Track attempts của student cho từng quiz
quizAttemptSchema.index({ quiz: 1, student: 1, attemptNumber: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
