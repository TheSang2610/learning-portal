/**
 * Gan DANH MUC MON HOC cho mot so truong (DocumentUniversity.monHoc) - de trang
 * truong co san mon va linh vuc truoc khi co tai lieu.
 *
 *   node scripts/seed-university-subjects.js          # xem truoc, KHONG ghi
 *   node scripts/seed-university-subjects.js --ghi    # ghi that
 *
 * Dot dau: PTIT va FPT nhan TAT CA mon dang co trong danh sach mon. Chi THEM
 * mon con thieu, khong bo mon da co - chay lai bao nhieu lan cung duoc.
 */
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const DocumentUniversity = require('../src/models/DocumentUniversity');
const DocumentSubject = require('../src/models/DocumentSubject');
const { chuanHoaMon } = require('../src/utils/rankDocuments');

const GHI = process.argv.includes('--ghi');

const TRUONG = [
    'Học viện Công nghệ Bưu chính Viễn thông',
    'Trường Đại học FPT',
];

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    try {
        const tatCaMon = (await DocumentSubject.find().sort({ ten: 1 }).select('ten key').lean());
        console.log(`Danh sach mon hien co: ${tatCaMon.length} mon`);

        for (const ten of TRUONG) {
            const t = await DocumentUniversity.findOne({ key: chuanHoaMon(ten) });
            if (!t) {
                console.log(`- Khong thay truong "${ten}" - bo qua (chay seed-document-universities.js truoc).`);
                continue;
            }
            const daCo = new Set(t.monHoc || []);
            const them = tatCaMon.filter((m) => !daCo.has(m.key));
            console.log(`- ${t.ten}: dang co ${daCo.size} mon, them ${them.length}: ${them.map((m) => m.ten).join(', ') || '(khong)'}`);
            if (GHI && them.length) {
                await DocumentUniversity.updateOne(
                    { _id: t._id },
                    { $addToSet: { monHoc: { $each: them.map((m) => m.key) } } },
                );
            }
        }
        console.log(GHI ? 'Da ghi.' : 'Chi xem truoc. Them --ghi de ghi that.');
    } finally {
        await mongoose.disconnect();
    }
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
