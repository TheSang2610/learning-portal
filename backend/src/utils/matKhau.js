// Do kho cua bcrypt, dung chung cho moi cho bam mat khau.
//
// Do tren may nay: 10 vong mat 67ms, 12 vong mat 245ms. Cham hon gap 3.6 lan,
// va do la CO Y - nguoi dung that chi chiu them 0,2 giay mot lan dang nhap, con
// ke do mat khau ngoai tam thi chiu dung ty le do tren HANG TY lan thu.
//
// Con so nay nen tang dan theo thoi gian khi may moc nhanh len. Doi no KHONG
// lam hong mat khau cu: bcrypt nhet do kho vao chinh chuoi hash, nen mat khau
// bam bang 10 vong van doi chieu duoc binh thuong; chi mat khau dat MOI moi
// dung do kho moi.
const BCRYPT_ROUNDS = 12;

// Do dai mat khau toi thieu. Chi ap dung cho mat khau dat MOI - mat khau cu
// ngan hon van dang nhap duoc binh thuong, khong ai bi khoa ra ngoai.
const DAI_MAT_KHAU_TOI_THIEU = 8;

// Do dai TOI DA cua mat khau dat MOI, tinh bang byte.
//
// 72 khong phai con so tu chon: bcrypt chi bam 72 byte dau va bo lang phan con
// lai, KHONG bao loi. De nguoi dung dat mat khau 200 ky tu roi tin rang ca 200
// ky tu deu duoc tinh la de ho hieu nham ve chinh cai bao ve cua ho - hai mat
// khau chi khac nhau tu ky tu 73 tro di la mot mat khau duy nhat duoi mat
// may chu.
const DAI_MAT_KHAU_TOI_DA = 72;

// Tran cho mat khau NHAN VAO luc dang nhap - cao hon han tran o tren, va co
// ly do khac han.
//
// Khong ap 72 o duong dang nhap: ban cu khong chan do dai, nen co the co nguoi
// da dat mat khau 300 ky tu. Hash cua ho von tinh tu 72 byte dau, nen ho van
// dang nhap duoc binh thuong - tu choi chuoi day du ho go ra la khoa chinh chu
// ra ngoai.
//
// Van phai co MOT cai tran: khong co no thi mot than request 1MB deu dan tuc
// la bat may chu chay bcrypt tren 1MB, moi lan, mien phi.
const DAI_MAT_KHAU_NHAN_TOI_DA = 1024;

// Han song cua token dang nhap.
//
// JWT khong the thu hoi giua chung, nen con so nay chinh la "token bi trom thi
// ke trom dung duoc bao lau". Doi mat khau van cat duoc phien cu ngay lap tuc
// (xem passwordChangedAt trong models/User.js), nhung do la hanh dong co y cua
// nguoi dung - con day la gioi han tu dong.
const HAN_TOKEN = '1d';

module.exports = {
    BCRYPT_ROUNDS,
    DAI_MAT_KHAU_TOI_THIEU,
    DAI_MAT_KHAU_TOI_DA,
    DAI_MAT_KHAU_NHAN_TOI_DA,
    HAN_TOKEN,
};
