// Dat danh sach TRUONG lam don vi dao tao, theo dung danh sach chu du an gui.
//
// CHAY THU (khong ghi gi, chi in ra se lam gi):
//
//   npm run seed:schools
//
// GHI THAT:
//
//   APPLIES_TO=1 npm run seed:schools
//
// GO NHUNG TRUONG DO SCRIPT NAY THEM VAO:
//
//   XOA=1 APPLIES_TO=1 npm run seed:schools
//
// ---------------------------------------------------------------------------
// DAY LA TEN THAT - DOC KY TRUOC KHI CHAY
// ---------------------------------------------------------------------------
// Dai ten o trang chu hien khong co mot dong chu nao noi no la gi. Nguoi xem
// mac dinh hieu day la danh sach DOI TAC. Ghi ten mot truong that vao day
// trong khi chua he hop tac la mao danh ho, va trang nay nam trong ho so xin
// viec cua chu du an.
//
// Ban truoc cua file nay (donViMau.js) chi ghi ten chung chung kem chu "(mau)"
// dung vi ly do do. Chu du an da doc canh bao va van chon dung ten that - day
// la quyet dinh cua chu du an, khong phai sot.
//
// Neu sau nay doi y: XOA=1 o tren go het 19 truong script them vao, va doi
// rieng HUST tro lai ten cu bang trang quan tri.
// ---------------------------------------------------------------------------
//
// AN TOAN: MONGO_URI tro toi cum Atlas THAT dang chay. Script nay chi THEM,
// doi ten DUNG MOT ban ghi (xem RENAMES ben duoi), va xoa dung nhung slug nam
// trong danh sach cua chinh no. Khong co lenh xoa/cap nhat hang loat nao.

require('dotenv').config();
const mongoose = require('mongoose');
const Provider = require('../models/providerModel');

// TEN HIEN THI LA VIET TAT, khong phai ten day du.
//
// Ly do la be rong dai chay ngang: 20 ten day du kieu "Truong Dai hoc Cong
// nghe Thong tin, DHQG-HCM" cho ra mot vong lap dai gap ba, tuc la nguoi xem
// phai doi vai phut moi thay het danh sach - khong ai doi. Viet tat lai dung
// la thu sinh vien nhan ra ngay, va do dai deu nhau nen dai chay muot.
//
// Ten day du ghi o cot ben canh de khong mat thong tin. Muon hien ten day du
// thi doi truong `ten` o duoi, nhung phai do lai toc do dai chay
// (GIAY_MOI_MUC trong PartnerMarquee.tsx tinh theo SO MUC, gia dinh cac ten dai xap
// xi nhau).
const ENTRIES = [
    { ten: 'PTIT', day: 'Hoc vien Cong nghe Buu chinh Vien thong' },
    { ten: 'UIT', day: 'Truong Dai hoc Cong nghe Thong tin, DHQG-HCM' },
    { ten: 'HUTECH', day: 'Truong Dai hoc Cong nghe TP.HCM' },
    { ten: 'RMIT', day: 'Dai hoc RMIT Viet Nam' },
    { ten: 'FPT', day: 'Truong Dai hoc FPT' },
    { ten: 'HUST', day: 'Dai hoc Bach khoa Ha Noi' },
    { ten: 'UET', day: 'Truong Dai hoc Cong nghe, DHQG Ha Noi' },
    { ten: 'HCMUS', day: 'Truong Dai hoc Khoa hoc Tu nhien, DHQG-HCM' },
    { ten: 'HCMUT', day: 'Truong Dai hoc Bach khoa, DHQG-HCM' },
    { ten: 'HCMUTE', day: 'Truong Dai hoc Su pham Ky thuat TP.HCM' },
    { ten: 'HUS', day: 'Truong Dai hoc Khoa hoc Tu nhien, DHQG Ha Noi' },
    { ten: 'DUT', day: 'Truong Dai hoc Bach khoa, Dai hoc Da Nang' },
    { ten: 'VKU', day: 'Truong Dai hoc CNTT va Truyen thong Viet - Han, Dai hoc Da Nang' },
    { ten: 'TDTU', day: 'Truong Dai hoc Ton Duc Thang' },
    { ten: 'HAUI', day: 'Truong Dai hoc Cong nghiep Ha Noi' },
    { ten: 'CTU', day: 'Truong Dai hoc Can Tho' },
    { ten: 'ICTU', day: 'Truong Dai hoc CNTT va Truyen thong, Dai hoc Thai Nguyen' },
    { ten: 'SGU', day: 'Truong Dai hoc Sai Gon' },
    // TLU con duoc mot truong khac dung (Dai hoc Thang Long). O day hieu la
    // Thuy loi - doi lai trong trang quan tri neu chu du an muon truong kia.
    { ten: 'TLU', day: 'Truong Dai hoc Thuy loi' },
    { ten: 'IU', day: 'Truong Dai hoc Quoc te, DHQG-HCM' }
];

// Ban ghi "Đại học Bách Khoa Hà Nội" da co san trong CSDL va DANG la don vi
// cua hai khoa hoc that. No chinh la HUST.
//
// Nen o day DOI TEN chu khong tao them: tao them thi dai chay se hien ca
// "Đại học Bách Khoa Hà Nội" lan "HUST" - mot truong dung hai lan. Con xoa
// ban cu roi tao moi thi hai khoa hoc kia mat don vi dao tao, vi khoa tro toi
// provider bang _id.
const RENAMES = { slugCu: 'dai-hoc-bach-khoa-ha-noi', newSlug: 'hust' };

// Slug lay thang tu viet tat, chu thuong. KHONG dung ham slugify cua
// providerController o day duoc: no khong doi gi voi chuoi chi co chu cai
// khong dau, nen ket qua giong het ma lai them mot ban sao can giu dong bo.
const slugOf = (name) => name.toLowerCase();

const chay = async () => {
    const applyTo = process.env.AP_DUNG === '1';
    const remove = process.env.XOA === '1';

    if (!process.env.MONGO_URI) {
        console.error('Thieu MONGO_URI trong .env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const dsSlug = ENTRIES.map((m) => slugOf(m.ten));
    const current = await Provider.countDocuments({});
    console.log(`Trong CSDL dang co ${current} don vi.`);
    console.log(applyTo ? '=> CHE DO GHI THAT' : '=> chay thu, khong ghi gi (them AP_DUNG=1 de ghi that)');
    console.log('');

    if (remove) {
        // KHONG go ban ghi HUST bang lenh nay.
        //
        // No la ban ghi cu da doi ten, dang duoc hai khoa hoc tro toi. Go no
        // di la hai khoa do mat don vi dao tao - mot thu script nay khong tao
        // ra thi cung khong duoc pha.
        const toRemove = dsSlug.filter((s) => s !== RENAMES.newSlug);
        const deleteList = await Provider.find({ slug: { $in: toRemove } }).lean();

        if (!deleteList.length) {
            console.log('Khong co truong nao de go.');
        } else {
            deleteList.forEach((d) => console.log('  go:', d.name));
            console.log(`\n  giu lai: ${RENAMES.newSlug} (dang co khoa hoc tro toi)`);
            if (applyTo) {
                const outcome = await Provider.deleteMany({ slug: { $in: toRemove } });
                console.log(`\nDa go ${outcome.deletedCount} truong.`);
            }
        }
        await mongoose.disconnect();
        return;
    }

    // Buoc 0: don not 10 ban ghi mau cua ban truoc (donViMau.js).
    //
    // Chung deu mang chu "(mau)" o ten va tien to "don-vi-mau-" o slug, khong
    // khoa hoc nao tro toi ca. Nay da co ten truong that thi chung chi lam
    // dai chay dai them ma khong noi gi.
    const dsMau = await Provider.find({ slug: /^don-vi-mau-/ }).lean();
    if (dsMau.length) {
        console.log(`  go ${dsMau.length} ban mau cu (don-vi-mau-*)`);
        if (applyTo) await Provider.deleteMany({ slug: /^don-vi-mau-/ });
    }

    // Buoc 1: doi ten ban ghi Bach khoa Ha Noi cu thanh HUST.
    // renamed phai theo doi rieng: o che do chay thu khong co gi duoc ghi,
    // nen vong lap ben duoi se khong tim thay slug "hust" va bao "them HUST"
    // - sai, vi luc ghi that buoc doi ten da sinh ra no roi. Bao cao chay thu
    // ma khong khop voi viec se lam that thi chay thu con y nghia gi.
    let renamed = false;
    const oldEntry = await Provider.findOne({ slug: RENAMES.slugCu });
    if (oldEntry) {
        renamed = true;
        console.log(`  doi ten: "${oldEntry.name}" -> "HUST" (giu nguyen _id, cac khoa hoc khong bi anh huong)`);
        if (applyTo) {
            oldEntry.name = 'HUST';
            oldEntry.slug = RENAMES.newSlug;
            oldEntry.type = 'university';
            await oldEntry.save();
        }
    }

    // Buoc 2: them nhung truong con thieu.
    let them = 0;
    let skip = 0;

    for (const item of ENTRIES) {
        const slug = slugOf(item.ten);

        // Sau buoc 1 thi HUST da ton tai, vong lap nay se tu bo qua no.
        const existing =
            (renamed && slug === RENAMES.newSlug) || (await Provider.findOne({ slug }).lean());
        if (existing) {
            skip += 1;
            console.log('  bo qua (da co):', item.ten);
            continue;
        }

        them += 1;
        console.log('  them:', item.ten, `- ${item.day}`);

        if (applyTo) {
            // logo de trong: dai ten chi hien CHU. Dat mot duong dan anh doan
            // mo vao day chi lam ban ghi mang thong tin sai ma khong ai thay.
            await Provider.create({ name: item.ten, slug, logo: '', type: 'university' });
        }
    }

    console.log('');
    console.log(`Tong ket: them ${them}, bo qua ${skip}.`);
    if (!applyTo) {
        console.log('Chua ghi gi ca. Chay lai voi AP_DUNG=1 de ghi that.');
    }

    await mongoose.disconnect();
};

chay().catch(async (err) => {
    console.error('Loi:', err.message);
    try {
        await mongoose.disconnect();
    } catch {
        /* dong ket noi that bai thi cung khong con gi de lam */
    }
    process.exit(1);
});
