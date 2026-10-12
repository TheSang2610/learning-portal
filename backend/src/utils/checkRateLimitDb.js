// Kiem chung NHANH CSDL cua kho dem gioi han tan suat.
//
//   npm run check:ratelimit
//
// VI SAO LA SCRIPT CHU KHONG PHAI TEST:
//
// `npm test` phai chay duoc tren CI, noi khong co MONGO_URI va khong co mang -
// nen moi test trong du an deu la ham thuan. Kho dem lai co HAI nhanh: bo nho
// tien trinh (da co test day du o rateLimitStore.test.js) va CSDL. Nhanh CSDL chi
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
const RateLimitCounter = require('../models/RateLimitCounter');
const { tang: increment, readMany, recordFailure, stillLocked, unlock } = require('./rateLimitStore');

// Tien to rieng cho lan chay nay.
const SESSION = crypto.randomBytes(4).toString('hex');
const K = (name) => `kiemthu:${SESSION}:${name}`;

const created = new Set();
const course = (name) => {
    const k = K(name);
    created.add(k);
    return k;
};

let errorCount = 0;

const check = (place, description, actual) => {
    if (place) {
        console.log(`  OK   ${description}`);
    } else {
        errorCount += 1;
        console.error(`  SAI  ${description}${actual === undefined ? '' : ` (nhan duoc: ${JSON.stringify(actual)})`}`);
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
    console.log(`Da ket noi. Ma phien kiem thu: ${SESSION}\n`);

    const WINDOW = 2000; // 2 giay, de kiem duoc cho het cua so ma khong phai cho lau

    // -----------------------------------------------------------------
    console.log('1. Dem tang dan trong mot cua so');
    const k1 = course('dem');
    const a = await increment(k1, WINDOW, Date.now());
    const b = await increment(k1, WINDOW, Date.now());
    const c = await increment(k1, WINDOW, Date.now());
    check(a.count === 1 && b.count === 2 && c.count === 3, 'dem 1 -> 2 -> 3', [a.count, b.count, c.count]);
    check(a.firstAt === c.firstAt, 'moc mo cua so khong doi giua chung');

    // -----------------------------------------------------------------
    console.log('2. Het cua so thi dem lai tu dau');
    await nghi(WINDOW + 300);
    const d = await increment(k1, WINDOW, Date.now());
    check(d.count === 1, 'qua cua so -> dem ve 1', d.count);

    // -----------------------------------------------------------------
    console.log('3. Cham nguong thi khoa, het khoa thi tu mo');
    const k2 = course('nguong');
    for (let i = 0; i < 5; i += 1) await recordFailure(k2, 5, WINDOW);
    const seconds = await stillLocked([k2]);
    check(seconds > 0, 'sai du 5 lan -> bi khoa', seconds);

    await nghi(WINDOW + 300);
    check(await stillLocked([k2]) === 0, 'qua cua so -> tu mo khoa');

    // -----------------------------------------------------------------
    console.log('4. Chua cham nguong thi khong khoa');
    const k3 = course('duoinguong');
    for (let i = 0; i < 4; i += 1) await recordFailure(k3, 5, 60000);
    check(await stillLocked([k3]) === 0, 'sai 4/5 lan -> chua khoa');

    // -----------------------------------------------------------------
    console.log('5. conBiKhoa lay khoa nang nhat trong danh sach');
    const shortKey = course('ngan');
    const longKey = course('dai');
    for (let i = 0; i < 3; i += 1) await recordFailure(shortKey, 3, 3000);
    for (let i = 0; i < 3; i += 1) await recordFailure(longKey, 3, 60000);
    const merge = await stillLocked([shortKey, longKey]);
    check(merge > 30, 'tra ve khoa dai nhat chu khong phai cai gap dau tien', merge);

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
    const k4 = course('songsong-nguoi');
    await Promise.all(Array.from({ length: 20 }, () => increment(k4, 60000, Date.now())));
    const after = (await readMany([k4], Date.now())).get(k4);
    check(after?.count === 20, 'khong mat luot nao khi cung mo mot cua so', after?.count);

    console.log('6b. 20 luot SONG SONG tren khoa dang co cua so');
    const k5 = course('songsong-am');
    await increment(k5, 60000, Date.now()); // mo cua so truoc
    await Promise.all(Array.from({ length: 20 }, () => increment(k5, 60000, Date.now())));
    const sau2 = (await readMany([k5], Date.now())).get(k5);
    check(sau2?.count === 21, 'khong mat luot nao khi cung tang mot cua so', sau2?.count);

    // -----------------------------------------------------------------
    console.log('7. xoaKhoa xoa sach bo dem');
    await unlock(k4);
    const remaining = await readMany([k4], Date.now());
    check(remaining.size === 0, 'ban ghi da bi xoa han');

    // -----------------------------------------------------------------
    console.log('8. Chi muc TTL da duoc tao');
    const indexes = await RateLimitCounter.collection.indexes();
    const ttl = indexes.find((i) => i.expireAfterSeconds !== undefined);
    check(Boolean(ttl), 'co chi muc TTL de Mongo tu don ban ghi het han', indexes.map((i) => i.name));
    if (ttl) check(ttl.key?.expiresAt === 1, 'TTL dat tren truong expiresAt', ttl.key);
};

const order = async () => {
    if (created.size === 0) return;
    // Xoa DUNG nhung khoa script nay tao ra, liet ke tung cai mot.
    const outcome = await RateLimitCounter.deleteMany({ _id: { $in: [...created] } });
    // So xoa duoc thuong nho hon so tao ra: buoc 7 da tu xoa mot khoa, va cac
    // khoa het han co the da bi TTL cua Mongo don truoc.
    console.log(`\nDa don ${outcome.deletedCount} khoa kiem thu con lai (tao ra ${created.size}).`);
};

chay()
    .catch((e) => {
        errorCount += 1;
        console.error('\nNEM LOI:', e.message);
    })
    .then(order)
    .catch((e) => console.error('Don dep that bai:', e.message))
    .finally(async () => {
        await mongoose.connection.close();
        if (errorCount === 0) {
            console.log('\nTAT CA DEU DUNG. Nhanh CSDL cua kho dem chay dung tren cum that.');
            process.exit(0);
        }
        console.error(`\nCO ${errorCount} MUC SAI. Xem lai utils/rateLimitStore.js.`);
        process.exit(1);
    });
