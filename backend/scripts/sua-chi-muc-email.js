/**
 * Doi chi muc email_1 tu { unique } sang { unique, sparse }.
 *
 * VI SAO CAN: tu khi dang ky chuyen sang dung so dien thoai, email la truong
 * tuy chon nen tai khoan moi KHONG co truong email. MongoDB coi ban ghi thieu
 * truong la null, va chi muc unique thong thuong se cho rang hai ban ghi cung
 * thieu email la trung nhau - tuc la nguoi dang ky thu HAI bang so dien thoai
 * se dinh loi E11000. `sparse` bao chi muc bo qua han cac ban ghi khong co
 * truong nay.
 *
 * Mongoose KHONG tu sua duoc: autoIndex chi tao chi muc con thieu, khong doi
 * duoc tuy chon cua chi muc da ton tai - no nem IndexOptionsConflict.
 *
 * Chay mot lan:  cd backend && node scripts/sua-chi-muc-email.js
 *
 * Script co the chay lai nhieu lan khong sao: neu chi muc da dung no bao roi
 * thoat, khong dong vao gi.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const TEN = 'email_1';

(async () => {
    let ma = 0;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const col = mongoose.connection.db.collection('users');

        const truoc = (await col.indexes()).find((i) => i.name === TEN);
        console.log('Chi muc hien tai:', truoc ? JSON.stringify({ key: truoc.key, unique: !!truoc.unique, sparse: !!truoc.sparse }) : 'khong co');

        if (truoc && truoc.unique && truoc.sparse) {
            console.log('Da dung roi, khong can lam gi.');
            return;
        }

        // Chan truoc khi dong vao chi muc: `sparse` chi bo qua ban ghi THIEU HAN
        // truong email. Ban ghi ghi ro `email: null` van bi danh chi muc, nen
        // hai ban ghi nhu vay se lam createIndex that bai giua chung - luc do
        // chi muc cu da bi drop mat roi, tuc la bo hoan toan rang buoc unique.
        const nulls = await col.countDocuments({ email: null });
        const thieu = await col.countDocuments({ email: { $exists: false } });
        console.log('email null:', nulls, '| khong co truong email:', thieu);

        if (nulls > 1 || thieu > 1 || nulls + thieu > 1) {
            console.log('');
            console.log('DUNG LAI. Co nhieu hon mot tai khoan khong co email that su.');
            console.log('Go truong email null di truoc roi chay lai script nay:');
            console.log('  db.users.updateMany({ email: null }, { $unset: { email: "" } })');
            ma = 1;
            return;
        }

        await col.dropIndex(TEN);
        console.log('Da drop', TEN);

        await col.createIndex({ email: 1 }, { unique: true, sparse: true, name: TEN });
        console.log('Da tao lai', TEN);

        const sau = (await col.indexes()).find((i) => i.name === TEN);
        console.log('Chi muc sau khi doi:', JSON.stringify({ key: sau.key, unique: !!sau.unique, sparse: !!sau.sparse }));
    } catch (e) {
        // Khong bao gio in chuoi ket noi ra man hinh.
        console.log('LOI:', e.name, '-', String(e.message).replace(/mongodb\+srv:\/\/\S*/gi, '[an]'));
        ma = 1;
    } finally {
        await mongoose.disconnect().catch(() => {});
        process.exit(ma);
    }
})();
