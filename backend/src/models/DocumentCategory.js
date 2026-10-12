const mongoose = require('mongoose');

/**
 * Linh vuc - nhom LON chua nhieu mon hoc cua kho tai lieu (vd. "Luật" gom
 * "Luật dân sự", "Luật hình sự"...). Hien o trang /share-document thanh cac o
 * "Kham pha theo linh vuc"; bam vao la danh sach tai lieu cua moi mon trong nhom.
 *
 * Mot mon thuoc TOI DA mot linh vuc (DocumentSubject.nhom). Tai lieu khong tro
 * thang toi linh vuc - di qua mon: doi mon sang nhom khac thi tai lieu tu di
 * theo, khong phai cap nhat tung tai lieu.
 *
 * Rieng cho kho tai lieu, KHONG dung Category cua khoa hoc - hai luong doc lap
 * (xem ghi chu o models/DocumentSubject.js).
 */

// Bieu tuong cho phep - khop bang ICONS o frontend
// (src/components/document/DocumentCategories.tsx). Luu ten chu khong luu SVG:
// admin chon trong danh sach, khong dan duoc ma tuy y vao trang.
const ICONS = [
    'sach', 'luat', 'kinh-doanh', 'kinh-te', 'he-thong', 'lap-trinh', 'toan',
    'khoa-hoc', 'y-te', 'ngoai-ngu', 'chinh-tri', 'ky-thuat', 'thiet-ke', 'giao-duc',
];

const documentCategorySchema = new mongoose.Schema({
    ten: {
        type: String,
        required: true,
        trim: true,
        maxlength: 60,
    },
    // Khoa chuan hoa (normalizeSubject) - dung tren dia chi ?nhom= va de chan trung.
    key: {
        type: String,
        required: true,
        unique: true,
    },
    bieuTuong: {
        type: String,
        enum: ICONS,
        default: 'sach',
    },
    // Thu tu hien, nho truoc. Bang nhau thi theo ten.
    thuTu: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('DocumentCategory', documentCategorySchema);
module.exports.ICONS = ICONS;
