// Ra soat noi dung DA nam trong co so du lieu de tim ma doc con sot.
//
// Vi sao can: ban va o documentController va htmlBaiViet chi chan du lieu MOI
// ghi vao. Nhung ban ghi luu tu truoc do van nguyen nhu luc duoc gui len - loc
// o cong vao khong hoi to duoc.
//
// CACH CHAY (tu thu muc backend):
//
//   node src/utils/scanStoredContent.js
//
// Mac dinh CHI DOC va in bao cao, khong sua gi. Muon sua that thi them --sua:
//
//   node src/utils/scanStoredContent.js --sua
//
// Doc truoc, sua sau. Xem bao cao roi hay quyet dinh - day la du lieu that.

require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Document = require('../models/Document');
const Post = require('../models/Post');
const { normalizeContent, DANGEROUS_SCHEME } = require('./postHtml');

// Moi bang, va truong nao cua no duoc do ra man hinh duoi dang HTML.
const SCAN_TARGETS = [
    { ten: 'Tài liệu', model: Document, truong: 'description' },
    { ten: 'Bài viết', model: Post, truong: 'content' },
];

const chay = async () => {
    const applyFix = process.argv.includes('--sua');

    await connectDB();

    let totalRecords = 0;
    let totalFixed = 0;

    for (const { ten: name, model, truong: school } of SCAN_TARGETS) {
        // Chi keo ve _id, tieu de va dung truong can xet - khong keo ca ban ghi.
        const dsach = await model.find({}, { [school]: 1, title: 1 }).lean();

        const record = dsach.filter((b) => DANGEROUS_SCHEME.test(String(b[school] || '')));
        totalRecords += record.length;

        console.log(`\n${name}: ${dsach.length} bản ghi, ${record.length} có dấu hiệu nguy hiểm`);

        for (const b of record) {
            const tho = String(b[school] || '');
            const clean = normalizeContent(tho);
            const head = (tho.match(DANGEROUS_SCHEME) || [''])[0];

            console.log(`  ${b._id}  ${String(b.title || '').slice(0, 40)}`);
            console.log(`     dấu hiệu: ${JSON.stringify(head)}   ${tho.length} -> ${clean.length} ký tự`);

            if (applyFix) {
                await model.updateOne({ _id: b._id }, { $set: { [school]: clean } });
                totalFixed += 1;
            }
        }
    }

    console.log(
        `\nTổng: ${totalRecords} bản ghi có dấu hiệu.` +
            (applyFix
                ? ` Đã sửa ${totalFixed}.`
                : ' Chưa sửa gì — thêm --sua nếu muốn ghi đè.')
    );

    await mongoose.connection.close();
};

chay().catch(async (err) => {
    console.error('Quét thất bại:', err.message);
    try {
        await mongoose.connection.close();
    } catch {
        // Dang thoat vi loi roi, dong khong duoc thi thoi.
    }
    process.exit(1);
});
