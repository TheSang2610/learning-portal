const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },

    lesson: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: false // Optional: có thể gắn với lesson cụ thể
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        default: ''
    },

    questions: [
        {
            _id: mongoose.Schema.Types.ObjectId,
            text: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: ['multiple_choice', 'true_false', 'short_answer', 'essay'],
                default: 'multiple_choice'
            },
            // Cho multiple choice & true/false
            options: [
                {
                    text: String,
                    isCorrect: Boolean
                }
            ],
            // Cho short answer & essay
            correctAnswer: String,
            explanation: String,
            points: {
                type: Number,
                default: 1
            }
        }
    ],

    // Cấu hình bài quiz
    passingScore: {
        type: Number,
        default: 70 // %
    },

    timeLimit: {
        type: Number, // minutes
        default: null // null = unlimited
    },

    attempts: {
        type: Number, // Số lần làm được phép
        default: 1
    },

    randomizeQuestions: {
        type: Boolean,
        default: false
    },

    randomizeOptions: {
        type: Boolean,
        default: false
    },

    showAnswers: {
        type: Boolean,
        default: true // Hiển thị đáp án sau khi nộp
    },

    totalPoints: {
        type: Number,
        default: 0
    },

    isPublished: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

// Tính totalPoints từ questions
quizSchema.pre('save', function (next) {
    if (this.questions.length > 0) {
        this.totalPoints = this.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    }
});

module.exports = mongoose.model('Quiz', quizSchema);
