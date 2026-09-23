// Nhan BA cach nhap o o dang nhap, theo dung thu tu nay:
//
//   1. So dien thoai   '0901234567', '+84901234567', '090 123 4567'
//   2. Dia chi email    'thesang@gmail.com'
//   3. Ten tai khoan    'thesang' - phan truoc dau @ cua dia chi da dang ky
//
// So dien thoai la thu bat buoc khi dang ky, nen voi nguoi dung moi no la
// cach dang nhap chinh. Ten tai khoan khong co truong rieng trong CSDL (no
// chi la phan dau cua email) nen khong phai chuyen doi du lieu cu.
//
// ===========================================================================
// BA DIEU PHAI NAM TRUOC KHI SUA FILE NAY
// ===========================================================================
//
// 1. PHAN TRUOC DAU @ KHONG DUY NHAT.
//
//    `sang@gmail.com` va `sang@yahoo.com` la hai tai khoan khac nhau, nhung
//    ca hai deu tra loi cai ten "sang". Chon dai mot cai la mot ngay nao do
//    co nguoi dang ky trung phan dau va chu tai khoan cu bong dung dang nhap
//    vao... mot tai khoan khac, hoac khong vao duoc nua, ma khong ai hieu vi
//    sao.
//
//    Vi vay: trung tu HAI tai khoan tro len thi TU CHOI, coi nhu khong tim
//    thay. Nguoi do van dang nhap duoc bang dia chi day du. Danh doi nay la
//    co y - mot cau "sai mat khau" con hon mot lan vao nham tai khoan.
//
// 2. TAI KHOAN GOOGLE KHONG DUNG DUOC TEN NGAN.
//
//    Yeu cau cua chu du an: ai dang ky bang Google thi hoac bam thang nut
//    Google, hoac go DU dia chi kem @gmail.com. Loc ho ra khoi tra cuu theo
//    ten ngan cung lam giam kha nang trung o diem 1.
//
//    Dau hieu "tai khoan Google thuan": `password` la chuoi rong. Do la dau
//    hieu ma loginUser van dang doc (`!user.password`), khong phai cai moi.
//
// 3. PHAI THOAT KY TU DAC BIET TRUOC KHI DUNG LAM REGEX.
//
//    Tra cuu theo ten ngan la mot phep so khop dau chuoi: /^thesang@/. Neu
//    nhet thang chuoi nguoi dung go vao do thi:
//
//      - go `.*`  -> /^.*@/  khop MOI tai khoan trong he thong. Ket hop voi
//                    diem 1 (tu choi khi trung nhieu) thi khong vao duoc tai
//                    khoan nao, nhung do van la mot truy van quet ca bang.
//      - go `(a+)+` -> mot mau regex co the treo tien trinh (ReDoS): ai cung
//                    goi duoc duong dang nhap, khong can tai khoan.
//
//    Chan hai tang: kiem HINH DANG truoc (chi nhan chu, so, . _ - +), roi
//    VAN thoat ky tu dac biet truoc khi ghep vao regex. Mot tang la du de
//    chan, nhung tang kiem hinh dang la thu de bi noi long sau nay ("cho
//    phep them dau + di"), con tang thoat thi khong.

// Khong tao vong phu thuoc: phoneNumber.js khong require gi ca.
const { chuanHoaSoDienThoai } = require('./phoneNumber');

// Do dai toi da cua phan truoc dau @, theo RFC 5321.
const DAI_TEN_TOI_DA = 64;

// Cac ky tu duoc nhan trong ten ngan.
//
// Hep hon phan truoc dau @ ma RFC cho phep (RFC con nhan ca dau nhay va khoang
// trang trong chuoi co ngoac). Hep la dung: ai co dia chi ky quac van dang
// nhap duoc bang dia chi day du, con noi rong bang ky tu la mo them be mat
// cho diem 3 o tren.
const MAU_TEN = /^[a-z0-9._%+-]+$/;

/**
 * Chuan hoa thu nguoi dung go o o "Email hoac ten tai khoan".
 *
 * CHI nhan chuoi. Tra ve '' cho moi thu khac - khong dung String(v) hay
 * `v || ''`: chung bien {"$ne":null} thanh '[object Object]' va nuot im lang
 * moi kieu du lieu sai. Cung ly do voi chuanHoaEmail trong validateInput.js.
 */
const chuanHoaDinhDanh = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

/** Co phai nguoi dung dang go ca dia chi email khong. */
const laEmail = (v) => typeof v === 'string' && v.includes('@');

/** Ten ngan co dung hinh dang khong. Kiem TRUOC khi ghep vao regex. */
const tenHopLe = (v) =>
    typeof v === 'string'
    && v.length > 0
    && v.length <= DAI_TEN_TOI_DA
    && MAU_TEN.test(v);

// Thoat moi ky tu co nghia dac biet trong regex.
const thoatRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Mau tim dia chi bat dau bang `ten@`.
 *
 * KHONG dat co 'i'. Email trong CSDL da luu o dang chu thuong va dinh danh
 * cung da duoc ha ve chu thuong o tren, nen khong can. Va quan trong hon: mau
 * neo dau chuoi khong co co 'i' thi Mongo dung duoc CHI MUC cua truong email
 * (quet mot doan tien to); them 'i' vao la mat chi muc, moi luot dang nhap
 * thanh mot lan quet ca bang.
 */
const mauTheoTen = (ten) => new RegExp(`^${thoatRegex(ten)}@`);

/**
 * Bo loc Mongo de tim tai khoan tu thu nguoi dung go vao.
 *
 * Tra ve null khi dau vao khong dung hinh dang - noi goi coi nhu khong tim
 * thay, KHONG duoc bo qua buoc doi chieu mat khau gia (xem HASH_GIA trong
 * userController.js), neu khong thi thoi gian phan hoi lai to cao dia chi nao
 * co that.
 *
 * @param {string} dinhDanh da qua chuanHoaDinhDanh
 * @param {(e: string) => boolean} emailHopLe truyen tu validateInput.js de
 *        khong tao vong phu thuoc giua hai file tien ich
 */
const boLocTaiKhoan = (dinhDanh, emailHopLe) => {
    if (laEmail(dinhDanh)) {
        return emailHopLe(dinhDanh) ? { email: dinhDanh } : null;
    }

    // Tra cuu theo SO DIEN THOAI.
    //
    // Phai dat TRUOC nhanh ten ngan, vi MAU_TEN nhan ca chu so: '0901234567'
    // lot qua tenHopLe() va se thanh regex /^0901234567@/ - tra cuu mot dia
    // chi email khong ai co, roi bao sai mat khau.
    const so = chuanHoaSoDienThoai(dinhDanh);

    // Doc duoc thanh so di dong thi CHI tra cuu theo so, khong hoi them
    // nhanh ten ngan nua.
    //
    // CAI BAY o day: mot chuoi toan chu so cung la ten ngan hop le (MAU_TEN
    // nhan ca chu so), nen '0901234567' vua co the la so dien thoai, vua co
    // the la phan dau cua dia chi '0901234567@gmail.com' ma ai do da dang ky
    // tu truoc.
    //
    // DA THU hoi ca hai bang $or va bo di, vi no de ra mot kieu khoa cheo:
    // neu nguoi A co so 0901234567 va nguoi B co email 0901234567@gmail.com
    // thi truy van khop HAI ban ghi, va luat o diem 1 dau file se tu choi -
    // ca hai cung khong dang nhap duoc, ma khong ai hieu vi sao.
    //
    // Uu tien so dien thoai la danh doi co y: dang nhap bang so la thu moi
    // nguoi dung dung hang ngay, con ten ngan toan chu so la truong hop hiem.
    // Ai roi vao truong hop do van dang nhap duoc bang DIA CHI DAY DU - dung
    // duong lui ma diem 1 da dat san.
    if (so) return { phone: so };

    if (!tenHopLe(dinhDanh)) return null;

    // `password: { $ne: '' }` loai tai khoan Google thuan - xem diem 2 o dau
    // file. Khong dung `$exists` vi truong nay co `default: ''`, tuc la moi
    // ban ghi deu co no.
    return { email: mauTheoTen(dinhDanh), password: { $ne: '' } };
};

module.exports = {
    chuanHoaDinhDanh,
    laEmail,
    tenHopLe,
    mauTheoTen,
    boLocTaiKhoan,
    DAI_TEN_TOI_DA,
};
