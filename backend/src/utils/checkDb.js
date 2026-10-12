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

function split(uri) {
    const m = String(uri || '').match(
        /^(mongodb\+srv:\/\/|mongodb:\/\/)([^:]+):([^@]+)@([^/?]+)\/?([^?]*)/,
    );
    if (!m) return null;
    return { account: m[2], passwordLength: m[3].length, cum: m[4], csdl: m[5] || '(mac dinh)' };
}

async function main() {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.log('THIEU MONGO_URI trong backend/.env');
        process.exit(1);
    }

    const p = split(uri);
    if (p) {
        console.log(`  tai khoan : ${p.account}`);
        console.log(`  cum       : ${p.cum}`);
        console.log(`  CSDL      : ${p.csdl}`);
        console.log(`  mat khau  : ${p.passwordLength} ky tu`);

        // Mat khau ngan thi ai do do tay cung ra, ma day la cum du lieu that.
        if (p.passwordLength < 12) {
            console.log('  ^ QUA NGAN. Nen dat toi thieu 16 ky tu ngau nhien.');
        }
    }

    console.log('\nDang thu ket noi...');

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
        const name = await mongoose.connection.db.listCollections().toArray();
        console.log(`\nKET NOI DUOC - thay ${name.length} bang.`);
        await mongoose.disconnect();
        console.log('\nKhoi dong lai may chu (Ctrl+C roi npm run dev) neu no dang chay,');
        console.log('vi .env chi duoc doc mot lan luc khoi dong.');
        process.exit(0);
    } catch (e) {
        const err = String(e.message || e);
        console.log('\nKHONG KET NOI DUOC.\n');

        if (/authentication failed|bad auth/i.test(err)) {
            console.log('  Sai tai khoan hoac mat khau.');
            console.log('  Luu y: mat khau co ky tu dac biet (@ : / ? # & %) thi PHAI ma hoa');
            console.log('  trong chuoi ket noi, vi du "@" viet thanh "%40".');
            console.log('  De nhat la dat mat khau chi gom chu va so.');
        } else if (/ENOTFOUND|querySrv|getaddrinfo/i.test(err)) {
            console.log('  Khong phan giai duoc dia chi cum - sai ten cum hoac mat mang.');
        } else if (/timed out|ETIMEDOUT|ServerSelection/i.test(err)) {
            console.log('  Het gio cho. Thuong la dia chi IP hien tai chua duoc phep:');
            console.log('  Atlas > Network Access > Add IP Address.');
        } else {
            console.log(`  ${err}`);
        }

        process.exit(1);
    }
}

main();
