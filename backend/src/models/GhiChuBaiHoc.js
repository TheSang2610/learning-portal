const mongoose = require('mongoose');

/**
 * Ghi chu RIENG cua mot hoc vien ve mot bai hoc.
 *
 * KHAC HOI DAP O CHO NAO:
 *   Hoi dap la cong khai trong khoa - ai hoc khoa do cung doc duoc, va muc dich
 *   la de nguoi khac tra loi. Ghi chu thi chi CHU NHAN doc duoc, va khong ai tra
 *   loi ca. Hai thu khac muc dich nen khong gop chung mot bang: gop lai la phai
 *   them mot co "rieng tu" vao moi truy van hoi dap, va quen mot cho la lo ghi
 *   chu ca nhan ra ca lop.
 *
 * VI SAO CO `mocGiay`:
 *   Ghi chu luc dang xem video thi thu dang gia nhat khong phai chu, ma la
 *   "cho nay o phut may". Luu giay thi bam vao ghi chu la nhay dung doan do,
 *   khong phai keo tim lai ca video.
 *
 *   Null khi ghi chu o bai doc (khong co video) - dung 0, vi 0 la giay thu 0,
 *   mot gia tri hop le.
 */

const ghiChuSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
        },

        lesson: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson',
            required: true,
        },

        noiDung: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },

        mocGiay: {
            type: Number,
            default: null,
            min: 0,
        },
    },
    { timestamps: true },
);

// Truy van duy nhat cua man hinh hoc bai: ghi chu CUA MOT NGUOI trong MOT bai.
// Ca hai truong deu phai co trong index - loc theo lesson khong thoi la quet
// qua ghi chu cua moi hoc vien khac roi moi bo di.
ghiChuSchema.index({ user: 1, lesson: 1, mocGiay: 1, createdAt: 1 });

// Cho man hinh "tat ca ghi chu cua toi" gom theo khoa.
ghiChuSchema.index({ user: 1, course: 1, createdAt: -1 });

module.exports = mongoose.model('GhiChuBaiHoc', ghiChuSchema);
