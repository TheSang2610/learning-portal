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
    // Video o KHO KIN Cloudinary - chi luu public_id, link ky duoc sinh moi lan
    // xem. Rong = bai cu dung videoUrl (link cong khai / YouTube). Xem
    // utils/privateVideo.js.
    videoPublicId: { type: String, default: "" },
    documentUrl: { type: String, default: "" },
    duration: { type: String }, 
    order: { type: Number, default: 0 }
}, { timestamps: true });

lessonSchema.index({ courseId: 1, slug: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);