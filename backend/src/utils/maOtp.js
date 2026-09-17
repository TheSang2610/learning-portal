// Ma OTP 6 chu so cua luong quen mat khau, va cac nguong di kem.
//
// Gom ve mot cho de ba noi dung no - controller, mail, va test - khong lech
// nhau. Cung ly do voi utils/matKhau.js.
//
// ---------------------------------------------------------------------------
// VI SAO BAM BANG BCRYPT CHU KHONG PHAI SHA-256
// ---------------------------------------------------------------------------
//
// utils/tokenXacMinh.js noi ro la KHONG dung bcrypt cho token xac minh email,
// vi token do la 32 byte ngau nhien - khong ai do duoc, nen cai gia cham cua
// bcrypt la vo ich. Cho nay NGUOC LAI, va phai nguoc lai:
//
// Ma OTP chi co 6 chu so, tuc la DUNG mot trieu kha nang. Ai doc duoc CSDL -
// mot ban sao luu quen dat mat khau, mot lan lo chuoi ket noi - la do het ca
// mot trieu kha nang do offline. Voi SHA-256, mot may tinh xach tay lam viec
// do trong CHUA MOT GIAY: bam ban bam thanh ra khong bao ve duoc gi ca. Voi
// bcrypt 12 vong (~245ms mot lan), do het mot trieu kha nang mat gan 70 gio -
// trong khi ma chi song 10 phut.
//
// Noi cach khac: SHA-256 dung cho bi mat KHONG DOAN DUOC, bcrypt dung cho bi
// mat DOAN DUOC. OTP thuoc loai thu hai.
//
// Ban than viec do truc tuyen thi da bi chan boi SO_LAN_SAI_TOI_DA roi - ba
// lan tren mot trieu kha nang. Phan bcrypt o day la de phong truong hop CSDL
// lot ra ngoai, khong phai de chan nguoi go tay.
//
// ---------------------------------------------------------------------------
// VE VE SINH: PHIEU DAT LAI
// ---------------------------------------------------------------------------
//
// Nhap dung ma KHONG doi mat khau ngay. May chu doi ma lay mot "phieu" ngau
// nhien 32 byte, roi buoc dat mat khau moi phai xuat trinh phieu do.
//
// Vi sao khong gop mot buoc cho gon: giao dien phai hien man hinh "dat mat
// khau moi" NGAY khi nguoi dung go dung ma, tuc la phai hoi may chu mot lan
// truoc khi biet ma co dung khong. Neu gop, lan hoi do hoac la khong tieu ma
// (nen ma dung duoc nhieu lan - phat lai duoc), hoac la tieu ma (nen buoc dat
// mat khau sau do khong con gi de chung minh). Tach ra thi ma bi tieu DUNG
// MOT LAN, va phieu moi la thu mang quyen dat mat khau.
//
// Phieu la 32 byte ngau nhien nen no quay ve dung truong hop cua
// tokenXacMinh.js - bam SHA-256, khong bcrypt.

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS } = require('./matKhau');
const { bamToken } = require('./tokenXacMinh');

const SO_CHU_SO = 6;

// Han cua ma, tinh tu luc gui thu.
//
// 10 phut: du de mo hom thu tren dien thoai, ngan de mot cai ma bo quen trong
// hom thu khong con song. Cang ngan thi cua so do truc tuyen cang hep.
const HAN_MA_MS = 10 * 60 * 1000;

// Han cua phieu dat lai, tinh tu luc nhap dung ma.
//
// Ngan hon han cua ma: toi buoc nay nguoi dung dang ngoi truoc man hinh go
// mat khau moi, khong con phai di mo hom thu nua.
const HAN_PHIEU_MS = 5 * 60 * 1000;

// So lan nhap SAI ma toi da truoc khi khoa.
const SO_LAN_SAI_TOI_DA = 3;

// So lan GUI thu toi da trong mot cua so - tuc la mot lan dau + mot lan gui
// lai. Gui thu la viec ton kem va gay phien cho chu hom thu (hom thu Gmail
// cua du an cung chi gui duoc khoang 500 thu mot ngay), nen no phai co tran
// rieng, khong an theo tran so lan nhap sai.
const SO_LAN_GUI_TOI_DA = 2;

// Khoa bao lau khi cham mot trong hai nguong tren.
//
// CHU Y - con so nay CO Y khong bao gio duoc noi cho nguoi dung biet. Xem ghi
// chu "khong noi con bao lau" trong controllers/quenMatKhauController.js.
const KHOA_MS = 60 * 60 * 1000;

/**
 * Sinh mot ma moi.
 *
 * crypto.randomInt chu KHONG phai Math.random: Math.random khong phai nguon
 * ngau nhien an toan - biet vai gia tri truoc do la doan duoc gia tri sau, ma
 * o day "gia tri sau" chinh la ma dat lai mat khau cua nguoi ke tiep.
 *
 * Dai bang DU 000000..999999, khong phai 100000..999999. Cat khoang dau di
 * cho "dep" la vut bo 10% khong gian ma va noi thang cho ke do biet chu so
 * dau khong bao gio la 0.
 */
const taoMa = () => String(crypto.randomInt(0, 10 ** SO_CHU_SO)).padStart(SO_CHU_SO, '0');

const MAU_MA = new RegExp(`^\\d{${SO_CHU_SO}}$`);

/** Ma nguoi dung go vao co dung hinh dang khong. Kiem truoc khi cham CSDL. */
const maHopLe = (v) => typeof v === 'string' && MAU_MA.test(v);

/**
 * San bang thoi gian phan hoi cua mot duong.
 *
 * ---------------------------------------------------------------------------
 * LO HONG NAY KHONG NHIN THAY TRONG CAU CHU, CHI DO BANG DONG HO
 * ---------------------------------------------------------------------------
 *
 * Duong "quen mat khau" tra ve DUNG MOT CAU cho moi truong hop, co y de khong
 * lo dia chi nao co tai khoan. Nhung viec no LAM thi khac han nhau:
 *
 *   dia chi co that   -> bam bcrypt (~245ms) + ghi CSDL + GUI MOT LA THU qua
 *                        SMTP (~0,5-1,5 giay)
 *   dia chi bia ra    -> tra loi ngay (~10ms)
 *
 * Chenh nhau gan MOT TRAM LAN. Ke tan cong khong can doc cau tra loi: chi cam
 * dong ho bam gio la quet duoc ca danh sach email, biet chinh xac ai la nguoi
 * dung cua he thong. Ca cong sue viet cho hai cau tra loi giong het nhau tro
 * thanh vo nghia.
 *
 * Dat mot san thoi gian thi ca hai nhanh deu mat it nhat bang nhau.
 *
 * GIOI HAN CUA CACH NAY, ghi ra de khong ai tuong da kin hoan toan: khi SMTP
 * cham hon ca cai san (Gmail thinh thoang mat vai giay), nhanh "co that" van
 * dai hon. Khong bit duoc triet de tru khi tach viec gui thu ra khoi luot
 * phan hoi, ma tren nen serverless thi container co the bi dong bang ngay sau
 * khi phan hoi duoc gui di - tuc la la thu se khong bao gio bay. Bu lai bang
 * tran theo IP o tang route (20 luot mot gio): quet hang nghin dia chi tu mot
 * may la khong kha thi.
 */
const SAN_THOI_GIAN_MS = 1500;

const sanThoiGian = async (batDau, toiThieuMs = SAN_THOI_GIAN_MS) => {
    const conLai = toiThieuMs - (Date.now() - batDau);
    if (conLai > 0) await new Promise((xong) => setTimeout(xong, conLai));
};

const bamMa = (ma) => bcrypt.hash(String(ma), BCRYPT_ROUNDS);

/**
 * Doi chieu ma. Luon tra ve boolean, khong bao gio nem.
 *
 * `bam` rong (chua tung yeu cau ma, hoac ma da bi tieu) van phai chay qua mot
 * lan bcrypt.compare voi ban bam gia - neu tra ve ngay thi thoi gian phan hoi
 * to cao dia chi nao dang co ma cho. Cung bai hoc voi HASH_GIA o loginUser.
 */
// Ban bam THAT cua mot chuoi 32 byte ngau nhien khong ai giu lai. Phai la mot
// ban bam hop le, khong duoc bia: bcrypt.compare voi chuoi rac tra ve false
// NGAY LAP TUC, tuc la no khong ton thoi gian - dung cai ma bien nay sinh ra
// de xoa di.
const HASH_GIA = '$2b$12$2b1pTma3u0ZwmTNwZCJ4ROMiMaLzpRGAkbnu.yo5Rlay8StSGMc6.';

const khopMa = async (ma, bam) => {
    try {
        return await bcrypt.compare(String(ma), bam || HASH_GIA);
    } catch {
        return false;
    }
};

/**
 * Sinh mot phieu dat lai.
 * @returns {{ phieu: string, bam: string, hetHan: Date }}
 *   `phieu` di ve trinh duyet, `bam` di vao CSDL. Khong bao gio nguoc lai.
 */
const taoPhieu = (now = Date.now()) => {
    const phieu = crypto.randomBytes(32).toString('hex');
    return { phieu, bam: bamToken(phieu), hetHan: new Date(now + HAN_PHIEU_MS) };
};

module.exports = {
    taoMa,
    maHopLe,
    bamMa,
    khopMa,
    taoPhieu,
    sanThoiGian,
    SAN_THOI_GIAN_MS,
    SO_CHU_SO,
    HAN_MA_MS,
    HAN_PHIEU_MS,
    SO_LAN_SAI_TOI_DA,
    SO_LAN_GUI_TOI_DA,
    KHOA_MS,
};
