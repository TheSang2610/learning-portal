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

// Han song cua token dang nhap.
//
// JWT khong the thu hoi giua chung, nen con so nay chinh la "token bi trom thi
// ke trom dung duoc bao lau". Doi mat khau van cat duoc phien cu ngay lap tuc
// (xem passwordChangedAt trong models/User.js), nhung do la hanh dong co y cua
// nguoi dung - con day la gioi han tu dong.
const HAN_TOKEN = '1d';

module.exports = { BCRYPT_ROUNDS, DAI_MAT_KHAU_TOI_THIEU, HAN_TOKEN };
