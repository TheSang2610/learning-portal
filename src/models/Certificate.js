const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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

    certificateNumber: {
        type: String,
        unique: true,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        default: ''
    },

    // Thông tin hoàn thành
    completionDate: {
        type: Date,
        required: true
    },

    // Khoá học info
    courseName: String,
    instructorName: String,
    courseDuration: String, // e.g., "4 weeks"

    // Điểm cuối cùng (nếu có)
    finalScore: Number,
    scorePercentage: Number,

    // Chứng chỉ được share công khai
    isPublic: {
        type: Boolean,
        default: false
    },

    // URL để verify chứng chỉ
    verificationUrl: String,
    verificationCode: {
        type: String,
        unique: true,
        sparse: true
    },

    // Issue & Expiry
    issuedAt: {
        type: Date,
        default: Date.now
    },

    expiresAt: {
        type: Date,
        default: null // null = never expires
    },

    isValid: {
        type: Boolean,
        default: true
    },

    // Signature (instructor name)
    signedBy: String

}, { timestamps: true });

// Index: 1 student chỉ nhận 1 lần chứng chỉ/course
certificateSchema.index({ course: 1, student: 1 }, { unique: true });

// Auto-generate certificateNumber
certificateSchema.pre('save', async function (next) {
    if (!this.certificateNumber) {
        const count = await mongoose.model('Certificate').countDocuments();
        this.certificateNumber = `CERT-${Date.now()}-${count + 1}`;
    }
});

module.exports = mongoose.model('Certificate', certificateSchema);
