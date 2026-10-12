const mongoose = require('mongoose');

/**
 * Danh sach mon hoc cua kho tai lieu chia se - do ADMIN quan ly.
 *
 * Nguoi dang tai lieu chi duoc CHON trong danh sach nay, khong go tu do. Truoc
 * day la o go tu do kem goi y, doi theo y chu du an: go tu do thi cung mot mon
 * ra muoi cach viet, va bo loc theo mon thanh vo dung.
 *
 * RIENG cho kho tai lieu, KHONG dung Category cua khoa hoc: kho tai lieu la
 * luong doc lap voi khoa hoc va bai hoc.
 *
 * Document khong tro sang day bang ObjectId ma CHEP ten + khoa vao chinh no
 * (monHoc, monHocKey). Ly do: bo xep hang goi y, bo loc theo mon va lich su
 * deu da so bang monHocKey. Doi ten mon thi documentController tu cap nhat lai
 * cac tai lieu cung mon - xem updateSubject.
 */
const documentSubjectSchema = new mongoose.Schema(
    {
        ten: {
            type: String,
            required: [true, 'Vui lòng nhập tên môn học'],
            trim: true,
            maxlength: [80, 'Tên môn học tối đa 80 ký tự'],
        },

        // Khoa so sanh (normalizeSubject trong utils/rankDocuments.js). UNIQUE o day
        // la cho chan "Toán" va "toan" thanh hai mon.
        key: {
            type: String,
            required: true,
            unique: true,
        },

        // Linh vuc chua mon nay (vd. "Luật dân sự" thuoc "Luật"). null = chua
        // xep vao linh vuc nao - mon van dung binh thuong, chi khong hien duoi
        // o linh vuc nao o trang /share-document.
        nhom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DocumentCategory',
            default: null,
            index: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('DocumentSubject', documentSubjectSchema);
