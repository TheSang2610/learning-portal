const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 2000
    },

    helpful: {
        type: Number,
        default: 0
    },

    unhelpful: {
        type: Number,
        default: 0
    },

    isVerifiedPurchase: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

// Đảm bảo mỗi student chỉ review 1 lần cho 1 course
reviewSchema.index({ course: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
