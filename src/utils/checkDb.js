// Kiem tra MONGO_URI trong .env co ket noi duoc khong.
//
// Chay: npm run check:db
//
// Co cai nay de sau khi doi mat khau tren Atlas thi biet ngay chuoi ket noi
// da dung chua, thay vi khoi dong may chu roi doc log doan.
//
// KHONG BAO GIO in mat khau ra man hinh.

require('dotenv').config();

const mongoose = require('mongoose');

function tach(uri) {
    const m = String(uri || '').match(
        /^(mongodb\+srv:\/\/|mongodb:\/\/)([^:]+):([^@]+)@([^/?]+)\/?([^?]*)/,
    );
    if (!m) return null;
    return { taiKhoan: m[2], doDaiMatKhau: m[3].length, cum: m[4], csdl: m[5] || '(mac dinh)' };
}

async function main() {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.log('THIEU MONGO_URI trong backend/.env');
        process.exit(1);
    }

    const p = tach(uri);
    if (p) {
        console.log(`  tai khoan : ${p.taiKhoan}`);
        console.log(`  cum       : ${p.cum}`);
        console.log(`  CSDL      : ${p.csdl}`);
        console.log(`  mat khau  : ${p.doDaiMatKhau} ky tu`);

        // Mat khau ngan thi ai do do tay cung ra, ma day la cum du lieu that.
        if (p.doDaiMatKhau < 12) {
            console.log('  ^ QUA NGAN. Nen dat toi thieu 16 ky tu ngau nhien.');
        }
    }

    console.log('\nDang thu ket noi...');

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
        const ten = await mongoose.connection.db.listCollections().toArray();
        console.log(`\nKET NOI DUOC - thay ${ten.length} bang.`);
        await mongoose.disconnect();
        console.log('\nKhoi dong lai may chu (Ctrl+C roi npm run dev) neu no dang chay,');
        console.log('vi .env chi duoc doc mot lan luc khoi dong.');
        process.exit(0);
    } catch (e) {
        const loi = String(e.message || e);
        console.log('\nKHONG KET NOI DUOC.\n');

        if (/authentication failed|bad auth/i.test(loi)) {
            console.log('  Sai tai khoan hoac mat khau.');
            console.log('  Luu y: mat khau co ky tu dac biet (@ : / ? # & %) thi PHAI ma hoa');
            console.log('  trong chuoi ket noi, vi du "@" viet thanh "%40".');
            console.log('  De nhat la dat mat khau chi gom chu va so.');
        } else if (/ENOTFOUND|querySrv|getaddrinfo/i.test(loi)) {
            console.log('  Khong phan giai duoc dia chi cum - sai ten cum hoac mat mang.');
        } else if (/timed out|ETIMEDOUT|ServerSelection/i.test(loi)) {
            console.log('  Het gio cho. Thuong la dia chi IP hien tai chua duoc phep:');
            console.log('  Atlas > Network Access > Add IP Address.');
        } else {
            console.log(`  ${loi}`);
        }

        process.exit(1);
    }
}

main();
