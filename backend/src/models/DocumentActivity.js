const mongoose = require('mongoose');

/**
 * Lich su xem / tai / tim cua MOT nguoi dung trong kho tai lieu chia se.
 *
 * Chi dung cho goi y (xem getRecommendations trong documentController).
 * Rieng cho kho tai lieu, khong gop voi Enrollment hay tien do bai hoc: kho tai
 * lieu la luong doc lap voi khoa hoc.
 *
 * CHI ghi khi biet nguoi do la ai (da dang nhap). Khach vang lai khong de lai
 * dau vet nao - khong ghi theo IP hay cookie an danh.
 */
const documentActivitySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    loai: {
        type: String,
        enum: ['xem', 'tai', 'tim'],
        required: true,
    },

    // Rong voi loai 'tim'.
    document: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        default: null,
    },

    // Chup lai khoa mon LUC GHI, khong tra cuu lai tu Document khi goi y.
    // Hai loi ich: goi y khong can mot lan join nua, va tai lieu da bi go
    // xuong van de lai dau "nguoi nay quan tam mon X" - ly do ban dau van dung.
    //
    // Mang vi mot tai lieu co nhieu mon. Ban ghi cu la chuoi - script
    // migrate-document-files-subjects.js doi sang mang; tongHopLichSu van doc
    // duoc ca hai dang.
    monHocKey: {
        type: [String],
        default: [],
    },

    // Chi voi loai 'tim'.
    tuKhoa: {
        type: String,
        trim: true,
        maxlength: 100,
        default: '',
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    // Khoa chong ghi trung: "<user>:<loai>:<tai lieu hoac tu khoa>:<so khung>",
    // moi khung dai 30 phut. Chi muc UNIQUE ben duoi bat CSDL tu chan ban ghi
    // thu hai trong cung mot khung. Xem ghiHoatDong trong controller.
    //
    // KHONG co default: ban ghi tao TRUOC khi co truong nay thi khong co no -
    // va phai de thieu han, xem ghi chu `sparse` o chi muc.
    khoaChongTrung: {
        type: String,
    },
});

// Doc lich su cua mot nguoi, moi nhat truoc - truy van duy nhat tren bang nay.
documentActivitySchema.index({ user: 1, createdAt: -1 });

// Chong ghi trung - de CSDL dam bao, khong tu kiem trong code.
//
// Ban dau lam kieu "kiem xem co chua -> chua thi ghi" (exists() roi create()).
// DU LIEU THAT cho thay no hong: moi lan mo trang chi tiet sinh ra DUNG MOT
// CAP ban ghi cung mot giay. Hai request den cung luc thi ca hai deu kiem
// truoc khi ben nao kip ghi, nen ca hai deu ghi. O che do dev, React
// StrictMode chay useEffect hai lan nen lan nao cung dinh; len that thi hiem
// hon nhung van con, vi du bam nhanh hai lan.
// Chi muc unique thi CSDL tu tu choi ban thu hai (E11000), khong con khe ho.
//
// `sparse: true` BAT BUOC: ban ghi cu khong co truong nay, ma MongoDB coi
// truong thieu la null - chi muc unique thuong se thay chung trung nhau va
// tu choi. Cung bai hoc da ghi o chi muc email trong models/User.js.
documentActivitySchema.index({ khoaChongTrung: 1 }, { unique: true, sparse: true });

// Tu xoa sau 180 ngay.
//
// Hai ly do. Mot: so thich doi theo hoc ky - thu xem tu nam ngoai it noi len
// gi ve dieu can hom nay. Hai: day la du lieu hanh vi cua tung nguoi, khong co
// ly do gi de giu mai mai. TTL cua MongoDB xoa ma khong can viec dinh ky nao.
documentActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

module.exports = mongoose.model('DocumentActivity', documentActivitySchema);
