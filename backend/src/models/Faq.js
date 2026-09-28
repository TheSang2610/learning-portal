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
    },
    // Khu vuc hien FAQ khi KHONG gan khoa hoc (courseId rong):
    //   trangChu - trang chu he thong (mac dinh; FAQ cu khong co truong nay
    //              cung duoc coi la trang chu)
    //   taiLieu  - trang chu khu Chia se tai lieu (/share-document)
    viTri: {
        type: String,
        enum: ['trangChu', 'taiLieu'],
        default: 'trangChu',
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Faq', faqSchema);