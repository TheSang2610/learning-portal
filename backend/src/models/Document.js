const mongoose = require('mongoose');

// Mot bai chia se duoc toi da 5 file (vd. chuong 1..5) va gan toi da 5 mon
// (vd. "Toán", "Toán cao cấp", "Toán rời rạc").
const MAX_FILES = 5;
const MAX_SUBJECTS = 5;

// Mot file dinh kem. _id: false - file khong co trang rieng, duoc goi theo VI
// TRI trong mang (GET /api/documents/:id/file?i=2).
const fileSchema = new mongoose.Schema({
    fileUrl: { type: String, required: true },
    // Can de xoa dung file tren Cloudinary khi nguoi dang go bai.
    filePublicId: { type: String, default: '' },
    fileName: { type: String, required: true },
    fileExt: { type: String, required: true, enum: ['pdf', 'doc', 'docx'] },
    fileSize: { type: Number, required: true },
}, { _id: false });

const documentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Vui lòng nhập tiêu đề tài liệu'],
        trim: true,
        maxlength: [200, 'Tiêu đề tối đa 200 ký tự']
    },

    description: {
        type: String,
        required: [true, 'Vui lòng nhập nội dung mô tả tài liệu'],
        trim: true,
        // 20.000: bai huong dan kieu blog (buoc 1 + anh, buoc 2 + anh...) dai
        // hon mo ta tai lieu nhieu - moi anh la ca mot the <img> kem link.
        maxlength: [20000, 'Nội dung tối đa 20000 ký tự']
    },

    // Cac file dinh kem, dung thu tu nguoi dang chon (chuong 1, 2, 3...).
    // KHONG bat buoc: bai chia se kieu blog (huong dan co anh chup man hinh)
    // co the khong kem file nao.
    //
    // Truoc day moi bai chi MOT file, nam o cac truong le fileUrl / fileName /
    // fileExt / fileSize. scripts/migrate-document-files-subjects.js chuyen
    // chung vao mang nay. Script CO Y giu lai cac truong le tren tai lieu cu:
    // ban backend cu (neu con chay chung CSDL) van doc duoc file dau.
    files: {
        type: [fileSchema],
        validate: {
            validator: (v) => Array.isArray(v) && v.length <= MAX_FILES,
            message: `Mỗi tài liệu có tối đa ${MAX_FILES} file`,
        },
    },

    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    downloadCount: {
        type: Number,
        default: 0
    },

    // Luot mo trang chi tiet - ca khach. Nguoi da dang nhap chi tinh MOT lan
    // moi khung 30 phut (cung co che chong trung voi lich su xem). Cung
    // downloadCount lam diem "pho bien" cho goi y (getDocuments ?sapXep=phoBien).
    luotXem: {
        type: Number,
        default: 0
    },

    // Mon hoc - chu nguoi dang go, giu nguyen dau de hien ra.
    //
    // CO Y la mot truong rieng, KHONG tro sang Category cua khoa hoc: kho tai
    // lieu la luong doc lap voi khoa hoc va bai hoc, chu du an chua muon hai
    // luong dinh vao nhau.
    //
    // Khong bat buoc o tang schema vi tai lieu dang TRUOC khi co truong nay
    // khong co mon. Bat buoc voi tai lieu MOI thi kiem o createDocument.
    // Mang TEN mon (toi da MAX_SUBJECTS), lay tu danh sach admin quan ly.
    monHoc: {
        type: [String],
        default: []
    },

    // Khoa so sanh cua monHoc: bo dau, chu thuong, gop dau cach. Xem
    // normalizeSubject trong utils/rankDocuments.js. Loc theo mon va goi y "cung
    // mon" deu so bang truong nay, khong so monHoc - nguoi go tay thi "Toán",
    // "toan", "TOÁN " la ba chuoi khac nhau nhung la mot mon.
    //
    // PHAI gan cung luc voi monHoc o moi duong ghi (createDocument,
    // updateDocument, updateSubject). Khong dung hook pre('save') vi findByIdAndUpdate
    // khong chay hook do - hai truong se lech nhau ma khong ai hay.
    //
    // Mang, CUNG THU TU voi monHoc: monHocKey[i] la khoa cua monHoc[i].
    // MongoDB tu khop { monHocKey: 'toan' } voi moi phan tu, chi muc tu thanh
    // multikey - loc theo mon khong phai doi gi.
    monHocKey: {
        type: [String],
        default: [],
        index: true
    },

    // Truong dai hoc (khong bat buoc) - TEN chuan lay tu danh sach admin quan
    // ly (DocumentUniversity) va KHOA de loc (?truong=). Gan ca hai cung luc
    // o moi duong ghi, giong monHoc/monHocKey.
    truong: {
        type: String,
        default: ''
    },
    truongKey: {
        type: String,
        default: '',
        index: true
    },

    // Admin an tai lieu (vi pham, sai noi dung) ma chua xoa han. Tai lieu an
    // bien mat khoi MOI duong cong khai - danh sach, chi tiet, file, goi y, lich
    // su, dem mon - chi con thay trong trang quan tri.
    //
    // Loc bang { daAn: { $ne: true } } chu KHONG phai { daAn: false }: tai lieu
    // dang truoc khi co truong nay khong co no, va { daAn: false } se loai het
    // chung ra khoi trang.
    daAn: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Danh sach luon sap xep moi nhat truoc -> can chi muc de khoi quet ca collection.
documentSchema.index({ createdAt: -1 });

// Tim kiem theo tieu de. Dung chi muc text thay vi regex vi regex khong
// dung duoc chi muc, cang nhieu tai lieu cang cham tuyen tinh.
documentSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Document', documentSchema);
module.exports.MAX_FILES = MAX_FILES;
module.exports.MAX_SUBJECTS = MAX_SUBJECTS;
