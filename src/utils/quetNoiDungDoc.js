// Ra soat noi dung DA nam trong co so du lieu de tim ma doc con sot.
//
// Vi sao can: ban va o documentController va htmlBaiViet chi chan du lieu MOI
// ghi vao. Nhung ban ghi luu tu truoc do van nguyen nhu luc duoc gui len - loc
// o cong vao khong hoi to duoc.
//
// CACH CHAY (tu thu muc backend):
//
//   node src/utils/quetNoiDungDoc.js
//
// Mac dinh CHI DOC va in bao cao, khong sua gi. Muon sua that thi them --sua:
//
//   node src/utils/quetNoiDungDoc.js --sua
//
// Doc truoc, sua sau. Xem bao cao roi hay quyet dinh - day la du lieu that.

require('dotenv').config();

const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Document = require('../models/Document');
const Post = require('../models/Post');
const { chuanHoaNoiDung, CO_MUI_NGUY_HIEM } = require('./htmlBaiViet');

// Moi bang, va truong nao cua no duoc do ra man hinh duoi dang HTML.
const CAN_QUET = [
    { ten: 'Tài liệu', model: Document, truong: 'description' },
    { ten: 'Bài viết', model: Post, truong: 'content' },
];

const chay = async () => {
    const suaThat = process.argv.includes('--sua');

    await connectDB();

    let tongBan = 0;
    let tongSua = 0;

    for (const { ten, model, truong } of CAN_QUET) {
        // Chi keo ve _id, tieu de va dung truong can xet - khong keo ca ban ghi.
        const dsach = await model.find({}, { [truong]: 1, title: 1 }).lean();

        const ban = dsach.filter((b) => CO_MUI_NGUY_HIEM.test(String(b[truong] || '')));
        tongBan += ban.length;

        console.log(`\n${ten}: ${dsach.length} bản ghi, ${ban.length} có dấu hiệu nguy hiểm`);

        for (const b of ban) {
            const tho = String(b[truong] || '');
            const sach = chuanHoaNoiDung(tho);
            const dau = (tho.match(CO_MUI_NGUY_HIEM) || [''])[0];

            console.log(`  ${b._id}  ${String(b.title || '').slice(0, 40)}`);
            console.log(`     dấu hiệu: ${JSON.stringify(dau)}   ${tho.length} -> ${sach.length} ký tự`);

            if (suaThat) {
                await model.updateOne({ _id: b._id }, { $set: { [truong]: sach } });
                tongSua += 1;
            }
        }
    }

    console.log(
        `\nTổng: ${tongBan} bản ghi có dấu hiệu.` +
            (suaThat
                ? ` Đã sửa ${tongSua}.`
                : ' Chưa sửa gì — thêm --sua nếu muốn ghi đè.')
    );

    await mongoose.connection.close();
};

chay().catch(async (loi) => {
    console.error('Quét thất bại:', loi.message);
    try {
        await mongoose.connection.close();
    } catch {
        // Dang thoat vi loi roi, dong khong duoc thi thoi.
    }
    process.exit(1);
});
