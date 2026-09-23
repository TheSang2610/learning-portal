const mongoose = require('mongoose');

/**
 * Mot cau hoi cua hoc vien ve MOT bai hoc, kem cac cau tra loi.
 *
 * VI SAO CAN DU CA TRO LY AI:
 *   Tro ly AI (xem Conversation.js) tra loi duoc phan ly thuyet trong bai, va
 *   tra loi ngay. Nhung no khong biet gi ngoai van ban bai hoc: hoc vien hoi
 *   "cho nay thi lam de thi nam ngoai kieu gi", "em lam theo video ma bao loi
 *   X" thi phai co NGUOI tra loi. Tro ly khong thay duoc giang vien, va loi
 *   nhac he thong cua no da ghi ro dieu do.
 *
 * VI SAO TRA LOI LA MANG NHUNG TRONG CHU KHONG PHAI MOT BANG RIENG:
 *   Cau tra loi khong bao gio duoc doc tach khoi cau hoi - luc nao cung hien
 *   ca cum. Tach bang la moi lan mo bai hoc phai them mot luot truy van de ghep
 *   lai. Mang nhung trong co tran 16MB cua mot tai lieu Mongo, nhung mot cuoc
 *   hoi dap vai chuc cau tra loi 2000 ky tu van con cach tran rat xa.
 *
 * KHONG dat unique nao: mot hoc vien hoi nhieu cau trong cung mot bai la binh
 * thuong.
 */

const traLoiSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Chep lai vai tro tai THOI DIEM tra loi thay vi doc tu User luc hien.
        //
        // Giang vien nghi day thi vai tro trong User doi, nhung cau tra loi cu
        // van phai hien la "Giang vien" - luc do ho dang la giang vien that.
        // Doc tu User luc hien la viet lai lich su.
        vaiTro: {
            type: String,
            enum: ['hocVien', 'giangVien', 'quanTri'],
            required: true,
        },

        noiDung: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },
    },
    { timestamps: true },
);

const cauHoiSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },

        // Gan theo BAI chu khong theo khoa: hoi ve bai 3 ma hien o bai 1 thi
        // danh sach cau hoi thanh mot dong nhieu thu khong lien quan, va hoc
        // vien phai tu loc bang mat.
        lesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true,
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        noiDung: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 2000,
        },

        traLoi: [traLoiSchema],

        // Giang vien danh dau da xong de biet cau nao con phai xu ly. Hoc vien
        // khong dat co nay - ho luon thay cau cua minh la chua xong cho toi khi
        // co nguoi tra loi thoa dang.
        daGiaiQuyet: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

// Truy van duy nhat cua man hinh hoc bai: cau hoi cua MOT bai, moi nhat truoc.
cauHoiSchema.index({ lesson: 1, createdAt: -1 });

// Cho giang vien: cau chua tra loi cua MOT khoa. Khong co index nay thi trang
// quan ly cua giang vien phai quet ca bang moi lan mo.
cauHoiSchema.index({ course: 1, daGiaiQuyet: 1, createdAt: -1 });

module.exports = mongoose.model('CauHoiBaiHoc', cauHoiSchema);
