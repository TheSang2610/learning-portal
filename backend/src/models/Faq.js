const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: false, // 🎯 KHÔNG BẮT BUỘC: Nếu null thì tự hiểu là FAQ của Trang chủ!
        index: true 
    },
    question: {
        type: String,
        required: true,
        trim: true
    },
    answer: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Faq', faqSchema);