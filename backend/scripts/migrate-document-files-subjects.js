/**
 * Chuyen tai lieu chia se sang dang "nhieu file + nhieu mon".
 *
 *   node scripts/migrate-document-files-subjects.js          # xem truoc, KHONG ghi
 *   node scripts/migrate-document-files-subjects.js --ghi    # ghi that
 *
 * Lam gi:
 *   1. documents: cac truong le fileUrl/filePublicId/fileName/fileExt/fileSize
 *      -> files: [ { ... } ]. CO Y GIU LAI cac truong le: ban backend cu (neu
 *      con chay chung CSDL, vd. ban da deploy) van doc duoc file dau.
 *   2. documents: monHoc / monHocKey dang chuoi -> mang ('' -> []).
 *   3. documentactivities: monHocKey dang chuoi -> mang.
 *   4. Sua ten file tieng Viet bi hong ma hoa (xem suaTenFile).
 *
 * Chay lai bao nhieu lan cung duoc: chi dong vao ban ghi CHUA chuyen.
 */
require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const { suaTenFile } = require('../src/utils/documentInput');

const GHI = process.argv.includes('--ghi');

const chuoiThanhMang = (truong) => ({
    $cond: [
        { $eq: [{ $type: `$${truong}` }, 'string'] },
        { $cond: [{ $eq: [`$${truong}`, ''] }, [], [`$${truong}`]] },
        { $ifNull: [`$${truong}`, []] },
    ],
});

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const docs = db.collection('documents');
    const hoatDong = db.collection('documentactivities');

    const canFile = { files: { $exists: false }, fileUrl: { $exists: true } };
    // $expr + $type cua CHINH truong: { monHoc: { $type: 'string' } } con khop
    // ca MANG co phan tu la chuoi, tuc la khop luon tai lieu da chuyen.
    const laChuoi = (t) => ({ $eq: [{ $type: `$${t}` }, 'string'] });
    const canMon = { $expr: { $or: [laChuoi('monHoc'), laChuoi('monHocKey'), { $eq: [{ $type: '$monHoc' }, 'missing'] }] } };
    const canHd = { $expr: laChuoi('monHocKey') };

    console.log(GHI ? '== GHI THAT ==' : '== XEM TRUOC (them --ghi de ghi) ==');
    console.log('tai lieu can chuyen file :', await docs.countDocuments(canFile));
    console.log('tai lieu can chuyen mon  :', await docs.countDocuments(canMon));
    console.log('lich su can chuyen mon   :', await hoatDong.countDocuments(canHd));

    // Ten file can sua: lam trong JS vi suaTenFile khong viet duoc bang pipeline.
    const canSuaTen = [];
    for (const d of await docs.find({ 'files.0': { $exists: true } }).project({ files: 1 }).toArray()) {
        const moi = d.files.map((f) => ({ ...f, fileName: suaTenFile(f.fileName) }));
        if (moi.some((f, i) => f.fileName !== d.files[i].fileName)) canSuaTen.push({ _id: d._id, files: moi });
    }
    console.log('tai lieu can sua ten file:', canSuaTen.length);

    if (GHI) {
        const a = await docs.updateMany(canFile, [
            {
                $set: {
                    files: [
                        {
                            fileUrl: '$fileUrl',
                            filePublicId: { $ifNull: ['$filePublicId', ''] },
                            fileName: { $ifNull: ['$fileName', ''] },
                            fileExt: { $ifNull: ['$fileExt', 'pdf'] },
                            fileSize: { $ifNull: ['$fileSize', 0] },
                        },
                    ],
                },
            },
        ]);
        const b = await docs.updateMany(canMon, [
            { $set: { monHoc: chuoiThanhMang('monHoc'), monHocKey: chuoiThanhMang('monHocKey') } },
        ]);
        const c = await hoatDong.updateMany(canHd, [{ $set: { monHocKey: chuoiThanhMang('monHocKey') } }]);
        let tenFile = 0;
        for (const d of canSuaTen) {
            tenFile += (await docs.updateOne({ _id: d._id }, { $set: { files: d.files } })).modifiedCount;
        }
        console.log('da chuyen:', { file: a.modifiedCount, mon: b.modifiedCount, lichSu: c.modifiedCount, tenFile });
    }

    await mongoose.disconnect();
})().catch((e) => {
    console.error(e);
    process.exit(1);
});
