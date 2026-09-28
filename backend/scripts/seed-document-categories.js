/**
 * Tao cac LINH VUC mac dinh cho kho tai lieu va xep cac mon san co vao do.
 *
 *   node scripts/seed-document-categories.js          # xem truoc, KHONG ghi
 *   node scripts/seed-document-categories.js --ghi    # ghi that
 *
 * - Linh vuc da co (trung ten) thi bo qua, khong ghi de.
 * - Chi xep nhung mon CHUA thuoc linh vuc nao, theo tu khoa trong ten mon.
 *   Mon admin da xep tay thi khong dung vao. Doan sai thi admin sua o
 *   /admin/document-subjects.
 *
 * Chay lai bao nhieu lan cung duoc.
 */
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const DocumentCategory = require('../src/models/DocumentCategory');
const DocumentSubject = require('../src/models/DocumentSubject');
const { chuanHoaMon } = require('../src/utils/rankDocuments');

const GHI = process.argv.includes('--ghi');

// [ten, bieu tuong, tu khoa trong ten mon (da bo dau)]
const MAC_DINH = [
    ['Công nghệ thông tin', 'lap-trinh', ['lap trinh', 'du lieu', 'giai thuat', 'phan mem', 'mang may tinh', 'he dieu hanh', 'tri tue nhan tao', 'web']],
    ['Hệ thống thông tin', 'he-thong', ['he thong', 'phan tich thiet ke']],
    ['Kinh doanh', 'kinh-doanh', ['kinh doanh', 'quan tri', 'marketing', 'ke toan', 'tai chinh', 'business']],
    ['Kinh tế', 'kinh-te', ['kinh te']],
    ['Luật', 'luat', ['luat', 'phap luat']],
    ['Toán học', 'toan', ['toan', 'dai so', 'giai tich', 'xac suat', 'thong ke']],
    ['Lý luận chính trị', 'chinh-tri', ['triet', 'mac', 'chinh tri', 'tu tuong', 'lich su dang']],
    ['Ngoại ngữ', 'ngoai-ngu', ['tieng anh', 'ngoai ngu', 'english', 'tieng nhat', 'tieng trung']],
    ['Khoa học tự nhiên', 'khoa-hoc', ['vat ly', 'hoa hoc', 'sinh hoc']],
    ['Kỹ thuật', 'ky-thuat', ['ky thuat', 'dien tu', 'co khi', 'vien thong']],
];

// Khop theo TU tron (bao quanh boi dau cach): "toan" khong duoc khop "toan ven".
const coTu = (khoa, tu) => ` ${khoa} `.includes(` ${tu} `);

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(GHI ? '== GHI THAT ==' : '== XEM TRUOC (them --ghi de ghi) ==');

    const idTheoTen = new Map();
    for (const [i, [ten, bieuTuong]] of MAC_DINH.entries()) {
        const key = chuanHoaMon(ten);
        const co = await DocumentCategory.findOne({ key }).lean();
        if (co) {
            idTheoTen.set(ten, co._id);
            console.log(`  linh vuc da co : ${ten}`);
            continue;
        }
        console.log(`  them linh vuc  : ${ten}`);
        if (GHI) idTheoTen.set(ten, (await DocumentCategory.create({ ten, key, bieuTuong, thuTu: i }))._id);
    }

    const monChuaXep = await DocumentSubject.find({ nhom: null }).lean();
    for (const m of monChuaXep) {
        const hop = MAC_DINH.find(([, , tuKhoa]) => tuKhoa.some((t) => coTu(m.key, t)));
        if (!hop) {
            console.log(`  de nguyen      : "${m.ten}" (khong doan duoc linh vuc)`);
            continue;
        }
        console.log(`  xep mon        : "${m.ten}" -> ${hop[0]}`);
        if (GHI && idTheoTen.get(hop[0])) {
            await DocumentSubject.updateOne({ _id: m._id, nhom: null }, { nhom: idTheoTen.get(hop[0]) });
        }
    }

    await mongoose.disconnect();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
