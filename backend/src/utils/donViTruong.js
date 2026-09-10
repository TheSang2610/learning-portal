// Dat danh sach TRUONG lam don vi dao tao, theo dung danh sach chu du an gui.
//
// CHAY THU (khong ghi gi, chi in ra se lam gi):
//
//   npm run seed:truong
//
// GHI THAT:
//
//   AP_DUNG=1 npm run seed:truong
//
// GO NHUNG TRUONG DO SCRIPT NAY THEM VAO:
//
//   XOA=1 AP_DUNG=1 npm run seed:truong
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
// doi ten DUNG MOT ban ghi (xem DOI_TEN ben duoi), va xoa dung nhung slug nam
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
// (GIAY_MOI_MUC trong DaiDonVi.tsx tinh theo SO MUC, gia dinh cac ten dai xap
// xi nhau).
const DANH_SACH = [
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
const DOI_TEN = { slugCu: 'dai-hoc-bach-khoa-ha-noi', slugMoi: 'hust' };

// Slug lay thang tu viet tat, chu thuong. KHONG dung ham slugify cua
// providerController o day duoc: no khong doi gi voi chuoi chi co chu cai
// khong dau, nen ket qua giong het ma lai them mot ban sao can giu dong bo.
const slugCua = (ten) => ten.toLowerCase();

const chay = async () => {
    const apDung = process.env.AP_DUNG === '1';
    const xoa = process.env.XOA === '1';

    if (!process.env.MONGO_URI) {
        console.error('Thieu MONGO_URI trong .env');
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);

    const dsSlug = DANH_SACH.map((m) => slugCua(m.ten));
    const dangCo = await Provider.countDocuments({});
    console.log(`Trong CSDL dang co ${dangCo} don vi.`);
    console.log(apDung ? '=> CHE DO GHI THAT' : '=> chay thu, khong ghi gi (them AP_DUNG=1 de ghi that)');
    console.log('');

    if (xoa) {
        // KHONG go ban ghi HUST bang lenh nay.
        //
        // No la ban ghi cu da doi ten, dang duoc hai khoa hoc tro toi. Go no
        // di la hai khoa do mat don vi dao tao - mot thu script nay khong tao
        // ra thi cung khong duoc pha.
        const canGo = dsSlug.filter((s) => s !== DOI_TEN.slugMoi);
        const dsXoa = await Provider.find({ slug: { $in: canGo } }).lean();

        if (!dsXoa.length) {
            console.log('Khong co truong nao de go.');
        } else {
            dsXoa.forEach((d) => console.log('  go:', d.name));
            console.log(`\n  giu lai: ${DOI_TEN.slugMoi} (dang co khoa hoc tro toi)`);
            if (apDung) {
                const kq = await Provider.deleteMany({ slug: { $in: canGo } });
                console.log(`\nDa go ${kq.deletedCount} truong.`);
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
        if (apDung) await Provider.deleteMany({ slug: /^don-vi-mau-/ });
    }

    // Buoc 1: doi ten ban ghi Bach khoa Ha Noi cu thanh HUST.
    // daDoiTen phai theo doi rieng: o che do chay thu khong co gi duoc ghi,
    // nen vong lap ben duoi se khong tim thay slug "hust" va bao "them HUST"
    // - sai, vi luc ghi that buoc doi ten da sinh ra no roi. Bao cao chay thu
    // ma khong khop voi viec se lam that thi chay thu con y nghia gi.
    let daDoiTen = false;
    const banCu = await Provider.findOne({ slug: DOI_TEN.slugCu });
    if (banCu) {
        daDoiTen = true;
        console.log(`  doi ten: "${banCu.name}" -> "HUST" (giu nguyen _id, cac khoa hoc khong bi anh huong)`);
        if (apDung) {
            banCu.name = 'HUST';
            banCu.slug = DOI_TEN.slugMoi;
            banCu.type = 'university';
            await banCu.save();
        }
    }

    // Buoc 2: them nhung truong con thieu.
    let them = 0;
    let boQua = 0;

    for (const muc of DANH_SACH) {
        const slug = slugCua(muc.ten);

        // Sau buoc 1 thi HUST da ton tai, vong lap nay se tu bo qua no.
        const daCo =
            (daDoiTen && slug === DOI_TEN.slugMoi) || (await Provider.findOne({ slug }).lean());
        if (daCo) {
            boQua += 1;
            console.log('  bo qua (da co):', muc.ten);
            continue;
        }

        them += 1;
        console.log('  them:', muc.ten, `- ${muc.day}`);

        if (apDung) {
            // logo de trong: dai ten chi hien CHU. Dat mot duong dan anh doan
            // mo vao day chi lam ban ghi mang thong tin sai ma khong ai thay.
            await Provider.create({ name: muc.ten, slug, logo: '', type: 'university' });
        }
    }

    console.log('');
    console.log(`Tong ket: them ${them}, bo qua ${boQua}.`);
    if (!apDung) {
        console.log('Chua ghi gi ca. Chay lai voi AP_DUNG=1 de ghi that.');
    }

    await mongoose.disconnect();
};

chay().catch(async (loi) => {
    console.error('Loi:', loi.message);
    try {
        await mongoose.disconnect();
    } catch {
        /* dong ket noi that bai thi cung khong con gi de lam */
    }
    process.exit(1);
});
