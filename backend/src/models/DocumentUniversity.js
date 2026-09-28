const mongoose = require('mongoose');

/**
 * Truong dai hoc cua kho tai lieu - do ADMIN quan ly, nguoi dang tai lieu chi
 * CHON (khong bat buoc). Hien thanh danh sach truong o trang /share-document;
 * bam vao la tai lieu cua truong do.
 *
 * Tai lieu CHEP ten + khoa truong vao chinh no (Document.truong, truongKey) -
 * cung cach lam voi mon hoc, de loc khong can join. Doi ten truong thi
 * documentUniversityController cap nhat lai cac tai lieu.
 */
const documentUniversitySchema = new mongoose.Schema({
    ten: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    // Khoa chuan hoa (chuanHoaMon) - dung tren dia chi ?truong= va de chan trung.
    key: {
        type: String,
        required: true,
        unique: true,
    },
    // Logo truong - de trong cho toi khi co. Dat file vao
    // frontend/public/images/institution/ roi ghi duong dan
    // "/images/institution/<ten-file>.png", hoac mot link https. Kiem o
    // utils/universityName.js (logoHopLe) truoc khi luu.
    logo: {
        type: String,
        default: '',
    },
    // Danh muc mon hoc cua truong: KHOA mon (DocumentSubject.key) truong co
    // day, ke ca mon chua ai dang tai lieu - giong trang truong cua ban mau
    // tham chieu, mon co san truoc, tai lieu den sau. Admin chinh; doi ten /
    // xoa mon thi documentController cap nhat lai mang nay.
    monHoc: {
        type: [String],
        default: [],
    },
    // Thu tu hien, nho truoc. Bang nhau thi theo ten.
    thuTu: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

module.exports = mongoose.model('DocumentUniversity', documentUniversitySchema);
