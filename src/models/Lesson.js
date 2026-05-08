const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    courseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    title: { type: String, required: true },
    content: { type: String }, // Có thể là text hoặc mô tả
    videoUrl: { type: String },
    duration: { type: String }, // Thời lượng bài học
    order: { type: Number, default: 0 } // Thứ tự bài học trong khóa học
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);