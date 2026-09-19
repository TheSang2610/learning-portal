const mongoose = require('mongoose');

/**
 * Mot thong bao gui toi MOT nguoi dung.
 *
 * VI SAO CAN:
 *   Truoc day he thong khong co duong nao bao cho hoc vien biet chuyen gi vua
 *   xay ra voi ho. Cu the nhat la luong chuyen khoan: hoc vien chuyen tien xong
 *   thi don o trang thai cho duyet, quan tri vien duyet luc nao khong ai biet -
 *   hoc vien phai tu vao lai trang khoa hoc bam thu xem da mo chua. Ai khong
 *   nghi ra viec bam thu thi ngoi cho vo thoi han du da tra tien.
 *
 * VI SAO LUU CA `duongDan` THAY VI DE TRINH DUYET TU DUNG:
 *   Cho can den phu thuoc vao viec gi da xay ra - don duoc duyet thi ve trang
 *   khoa hoc, chung nhan duoc cap thi ve ho so. De trinh duyet tu suy ra thi
 *   cai bang anh xa do bi chep lam hai ban, va ban o trinh duyet se lac hau
 *   ngay lan dau them mot loai thong bao moi.
 *
 * KHONG dat rang buoc unique nao o day: cung mot loai thong bao co the den
 * nhieu lan mot cach hoan toan hop le (mua hai khoa khac nhau).
 */

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // Dung de chon bieu tuong va mau o giao dien. Enum chu khong phai chuoi
        // tu do: them loai moi thi phai sua ca day, va do la chu dich - de khong
        // ai am tham sinh ra mot loai ma giao dien khong biet ve gi.
        loai: {
            type: String,
            enum: [
                'don_duoc_duyet',
                'don_bi_tu_choi',
                'khoa_duoc_mo',
                'chung_nhan',
                'tra_loi_hoi_dap',
                'coin_duoc_cong',
                'he_thong',
            ],
            required: true,
        },

        tieuDe: {
            type: String,
            required: true,
            maxlength: 200,
        },

        noiDung: {
            type: String,
            default: '',
            maxlength: 1000,
        },

        // Duong dan trong ung dung, luon bat dau bang '/'. Kiem o controller
        // chu khong o day: mot thong bao hong duong dan van dang duoc luu va
        // hien, chi la bam vao khong di dau - con hon mat ca thong bao.
        duongDan: {
            type: String,
            default: '',
            maxlength: 500,
        },

        daDoc: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

// Truy van duy nhat cua man hinh chuong: lay thong bao cua MOT nguoi, moi nhat
// truoc. Khong co index nay thi moi lan mo chuong la mot lan quet ca bang.
notificationSchema.index({ user: 1, createdAt: -1 });

// Dem so chua doc cho cai cham do tren chuong. Loc theo hai truong nen phai co
// index rieng, index tren khong dung duoc vi daDoc khong nam trong do.
notificationSchema.index({ user: 1, daDoc: 1 });

// Tu xoa sau 90 ngay.
//
// Thong bao la thu doc mot lan roi thoi, nhung neu khong don thi bang nay chi
// co phinh: moi don hang, moi chung nhan, moi cau tra loi deu de lai mot dong
// vinh vien. Mongo tu don nen khong can viet tac vu dinh ky nao.
//
// 90 ngay la de hoc vien quay lai sau mot hoc ky van con thay lich su gan day,
// khong phai con so tuy tien.
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
