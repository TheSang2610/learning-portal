const mongoose = require('mongoose');

/**
 * Khoa hoc mot nguoi DA DANG NHAP da mo xem - cho muc "Xem gan day" o trang
 * chu cua ho (dashboard).
 *
 * Moi cap (nguoi, khoa) chi MOT dong; xem lai thi chi doi `viewedAt`. Khong
 * luu tung luot: muc nay chi can "khoa nao, lan cuoi luc nao", con tong luot
 * xem cua khoa da co bo dem rieng (Course.luotXem, utils/viewCount.js).
 */
const courseViewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    viewedAt: {
        type: Date,
        default: Date.now
    }
});

// Unique o CSDL: hai tab mo cung luc la hai upsert song song - khong co index
// nay thi ra hai dong trung (cung loi da gap o DocumentActivity).
courseViewSchema.index({ user: 1, course: 1 }, { unique: true });
// "Xem gan day": moi nhat truoc.
courseViewSchema.index({ user: 1, viewedAt: -1 });

module.exports = mongoose.model('CourseView', courseViewSchema);
