// Kiem chung NHANH CSDL cua kho dem gioi han tan suat.
//
//   npm run check:gioihan
//
// VI SAO LA SCRIPT CHU KHONG PHAI TEST:
//
// `npm test` phai chay duoc tren CI, noi khong co MONGO_URI va khong co mang -
// nen moi test trong du an deu la ham thuan. Kho dem lai co HAI nhanh: bo nho
// tien trinh (da co test day du o khoGioiHan.test.js) va CSDL. Nhanh CSDL chi
// chay duoc khi co ket noi that, dung nhu checkDb / checkMail / checkCloudinary
// - nen no o day, chay tay, khong nam trong npm test.
//
// Script nay AN TOAN voi du lieu that:
//   - chi cham vao dung mot collection rieng cua no (bo_dem_gioi_han), la noi
//     khong co gi ngoai bo dem song 15 phut;
//   - moi khoa deu mang tien to 'kiemthu:<ma ngau nhien>:' nen khong the trung
//     voi bo dem that cua nguoi dung dang online;
//   - don sach dung nhung khoa minh tao ra truoc khi thoat.
// Khong co lenh xoa hang loat nao.

require('dotenv').config();

const crypto = require('crypto');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const BoDemGioiHan = require('../models/BoDemGioiHan');
const { tang, docNhieu, ghiNhanSai, conBiKhoa, xoaKhoa } = require('./khoGioiHan');

// Tien to rieng cho lan chay nay.
const PHIEN = crypto.randomBytes(4).toString('hex');
const K = (ten) => `kiemthu:${PHIEN}:${ten}`;

const daTao = new Set();
const khoa = (ten) => {
    const k = K(ten);
    daTao.add(k);
    return k;
};

let soLoi = 0;

const check = (dat, moTa, thucTe) => {
    if (dat) {
        console.log(`  OK   ${moTa}`);
    } else {
        soLoi += 1;
        console.error(`  SAI  ${moTa}${thucTe === undefined ? '' : ` (nhan duoc: ${JSON.stringify(thucTe)})`}`);
    }
};

const nghi = (ms) => new Promise((r) => setTimeout(r, ms));

const chay = async () => {
    console.log('Dang ket noi CSDL...');
    await connectDB();

    // readyState 1 = da ket noi. Neu khong phai thi khoGioiHan se lui ve bo nho
    // va ca script nay tro thanh vo nghia - phai dung lai chu khong bao "OK".
    if (mongoose.connection.readyState !== 1) {
        console.error('KHONG ket noi duoc CSDL. Dung lai - chay tiep chi kiem nham nhanh bo nho.');
        process.exit(1);
    }
    console.log(`Da ket noi. Ma phien kiem thu: ${PHIEN}\n`);

    const CUA_SO = 2000; // 2 giay, de kiem duoc cho het cua so ma khong phai cho lau

    // -----------------------------------------------------------------
    console.log('1. Dem tang dan trong mot cua so');
    const k1 = khoa('dem');
    const a = await tang(k1, CUA_SO, Date.now());
    const b = await tang(k1, CUA_SO, Date.now());
    const c = await tang(k1, CUA_SO, Date.now());
    check(a.count === 1 && b.count === 2 && c.count === 3, 'dem 1 -> 2 -> 3', [a.count, b.count, c.count]);
    check(a.firstAt === c.firstAt, 'moc mo cua so khong doi giua chung');

    // -----------------------------------------------------------------
    console.log('2. Het cua so thi dem lai tu dau');
    await nghi(CUA_SO + 300);
    const d = await tang(k1, CUA_SO, Date.now());
    check(d.count === 1, 'qua cua so -> dem ve 1', d.count);

    // -----------------------------------------------------------------
    console.log('3. Cham nguong thi khoa, het khoa thi tu mo');
    const k2 = khoa('nguong');
    for (let i = 0; i < 5; i += 1) await ghiNhanSai(k2, 5, CUA_SO);
    const giay = await conBiKhoa([k2]);
    check(giay > 0, 'sai du 5 lan -> bi khoa', giay);

    await nghi(CUA_SO + 300);
    check(await conBiKhoa([k2]) === 0, 'qua cua so -> tu mo khoa');

    // -----------------------------------------------------------------
    console.log('4. Chua cham nguong thi khong khoa');
    const k3 = khoa('duoinguong');
    for (let i = 0; i < 4; i += 1) await ghiNhanSai(k3, 5, 60000);
    check(await conBiKhoa([k3]) === 0, 'sai 4/5 lan -> chua khoa');

    // -----------------------------------------------------------------
    console.log('5. conBiKhoa lay khoa nang nhat trong danh sach');
    const kNgan = khoa('ngan');
    const kDai = khoa('dai');
    for (let i = 0; i < 3; i += 1) await ghiNhanSai(kNgan, 3, 3000);
    for (let i = 0; i < 3; i += 1) await ghiNhanSai(kDai, 3, 60000);
    const gop = await conBiKhoa([kNgan, kDai]);
    check(gop > 30, 'tra ve khoa dai nhat chu khong phai cai gap dau tien', gop);

    // -----------------------------------------------------------------
    // Day la diem quan trong nhat cua ca script.
    //
    // Ly do doi tu Map sang CSDL la de nhieu lambda instance dung chung mot bo
    // dem. Nhung neu phep tang khong nguyen tu thi hai request song song se
    // cung doc ra 4 roi cung ghi 5, va ke tan cong chi viec ban song song de
    // vuot nguong. `$inc` cua Mongo la nguyen tu - buoc nay chung minh dieu do
    // chay that chu khong phai chi dung tren giay.
    //
    // Kiem HAI canh khac nhau, vi chung di qua hai nhanh ma nguon khac nhau:
    //   6a khoa CON NGUYEN  -> ca 20 luot cung phai MO cua so (nhanh upsert)
    //   6b khoa DANG SONG   -> ca 20 luot cung phai TANG   (nhanh $inc)
    // Loi that su tim duoc o lan chay dau nam o 6a, khong phai 6b.
    console.log('6a. 20 luot SONG SONG tren khoa con nguyen');
    const k4 = khoa('songsong-nguoi');
    await Promise.all(Array.from({ length: 20 }, () => tang(k4, 60000, Date.now())));
    const sau = (await docNhieu([k4], Date.now())).get(k4);
    check(sau?.count === 20, 'khong mat luot nao khi cung mo mot cua so', sau?.count);

    console.log('6b. 20 luot SONG SONG tren khoa dang co cua so');
    const k5 = khoa('songsong-am');
    await tang(k5, 60000, Date.now()); // mo cua so truoc
    await Promise.all(Array.from({ length: 20 }, () => tang(k5, 60000, Date.now())));
    const sau2 = (await docNhieu([k5], Date.now())).get(k5);
    check(sau2?.count === 21, 'khong mat luot nao khi cung tang mot cua so', sau2?.count);

    // -----------------------------------------------------------------
    console.log('7. xoaKhoa xoa sach bo dem');
    await xoaKhoa(k4);
    const conLai = await docNhieu([k4], Date.now());
    check(conLai.size === 0, 'ban ghi da bi xoa han');

    // -----------------------------------------------------------------
    console.log('8. Chi muc TTL da duoc tao');
    const chiMuc = await BoDemGioiHan.collection.indexes();
    const ttl = chiMuc.find((i) => i.expireAfterSeconds !== undefined);
    check(Boolean(ttl), 'co chi muc TTL de Mongo tu don ban ghi het han', chiMuc.map((i) => i.name));
    if (ttl) check(ttl.key?.expiresAt === 1, 'TTL dat tren truong expiresAt', ttl.key);
};

const don = async () => {
    if (daTao.size === 0) return;
    // Xoa DUNG nhung khoa script nay tao ra, liet ke tung cai mot.
    const kq = await BoDemGioiHan.deleteMany({ _id: { $in: [...daTao] } });
    // So xoa duoc thuong nho hon so tao ra: buoc 7 da tu xoa mot khoa, va cac
    // khoa het han co the da bi TTL cua Mongo don truoc.
    console.log(`\nDa don ${kq.deletedCount} khoa kiem thu con lai (tao ra ${daTao.size}).`);
};

chay()
    .catch((e) => {
        soLoi += 1;
        console.error('\nNEM LOI:', e.message);
    })
    .then(don)
    .catch((e) => console.error('Don dep that bai:', e.message))
    .finally(async () => {
        await mongoose.connection.close();
        if (soLoi === 0) {
            console.log('\nTAT CA DEU DUNG. Nhanh CSDL cua kho dem chay dung tren cum that.');
            process.exit(0);
        }
        console.error(`\nCO ${soLoi} MUC SAI. Xem lai utils/khoGioiHan.js.`);
        process.exit(1);
    });
