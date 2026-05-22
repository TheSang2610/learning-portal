const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    courseId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    content: { type: String }, 
    videoUrl: { type: String },
    documentUrl: { type: String, default: "" },
    duration: { type: String }, 
    order: { type: Number, default: 0 }
}, { timestamps: true });

lessonSchema.index({ courseId: 1, slug: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);