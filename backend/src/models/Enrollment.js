const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Tiến độ theo bài học
    lessonProgress: [
        {
            lesson: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Lesson'
            },
            status: {
                type: String,
                enum: ['not_started', 'in_progress', 'completed'],
                default: 'not_started'
            },
            watchedDuration: {
                type: Number, // seconds
                default: 0
            },
            completedAt: Date
        }
    ],

    // Thống kê tổng quan
    totalProgress: {
        type: Number, // Phần trăm 0-100
        default: 0
    },

    status: {
        type: String,
        enum: ['active', 'completed', 'dropped'],
        default: 'active'
    },

    completedAt: Date,
    lastAccessedAt: Date,

    // Điểm tổng kết (nếu có quizzes)
    finalScore: {
        type: Number,
        default: null
    }

}, { timestamps: true });

// Index: 1 student chỉ enroll 1 lần/course
enrollmentSchema.index({ course: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
