// Kiem tra dau vao cua cac duong dang nhap / dang ky / doi mat khau.
//
// Gom ve mot cho vi truoc day moi controller tu kiem lay, va cai gi tu kiem lay
// thi som muon cung lech nhau. Lech o tang xac thuc thi khong ai nhin thay cho
// toi luc bi loi dung. Vi du co that trong file nay truoc khi gom:
//
//   loginUser  ep `typeof password === 'string'` truoc khi lam gi.
//   registerUser thi khong: no lam thang `password.length < 8`. Voi than
//   request {"password":{"$ne":null}} thi `.length` la `undefined`, ma
//   `undefined < 8` la FALSE - qua duoc buoc kiem do dai, roi di thang toi
//   bcrypt.hash va lam may chu nem 500.
//
// Cac ham o day deu la ham thuan, khong cham CSDL, nen test duoc truc tiep.

const {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_PASSWORD_INPUT_LENGTH,
} = require('./password');

// RFC 5321 dat tran mot dia chi thu o 254 ky tu.
//
// Chan o day de mot than request mang chuoi 1MB khong bien thanh mot truy van
// CSDL, va de bo dem cua loginRateLimit khong bi bom phinh: khoa cua no la
// `ip|email`, nen "email" rac dai vo han la mot duong lam tran bo nho tien
// trinh ma khong can dang nhap lan nao.
const MAX_EMAIL_LENGTH = 254;

// Ten hien thi. Khop voi gioi han trong updateUserProfile - de lech thi dang ky
// duoc mot cai ten ma sau do khong bao gio sua lai duoc.
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;

// Email luon luu/tra cuu o dang chu thuong da trim -> tranh tao trung tai khoan
// va tranh truong hop go hoa mot chu la khong dang nhap duoc.
//
// CHI nhan chuoi. Truoc day dung String(v || '') - no bien {"$ne":null} thanh
// '[object Object]' nen khong loc duoc vao truy van Mongo, nhung no cung nuot
// im lang moi kieu du lieu sai roi de cho khac tu doan. Tu choi thang thi ro
// rang hon va khong con cho nao phai doan.
const normalizeEmail = (v) => (typeof v === 'string' ? v.trim().toLowerCase() : '');

// Kiem dinh dang co ban, khong dung regex phuc tap de tranh ReDoS.
const isValidEmail = (email) =>
  typeof email === 'string' &&
  email.length > 0 &&
  email.length <= MAX_EMAIL_LENGTH &&
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

// Mat khau NHAN VAO luc dang nhap.
//
// Khong ap tran 72 o day. bcrypt chi dung 72 byte dau, nen mot nguoi dung tu
// doi da dat mat khau 300 ky tu (ban cu khong chan) van dang nhap binh thuong -
// hash cua ho von tinh tu 72 byte dau do. Tu choi chuoi day du ho go ra la
// khoa chinh chu ra ngoai.
//
// Van phai co MOT cai tran, chi la de cao hon nhieu: khong co no thi mot than
// request 1MB deu dan tuc la bat may chu bam bcrypt tren 1MB moi lan.
const receivedPassword = (v) =>
  typeof v === 'string' && v.length > 0 && v.length <= MAX_PASSWORD_INPUT_LENGTH;

// Mat khau dat MOI (dang ky, doi mat khau). Tra ve cau bao loi, hoac null neu dat.
//
// Tran 72 o day la that: bcrypt bo lang moi byte tu 73 tro di, KHONG bao loi.
// Nghia la "matkhau...<72 byte>...A" va "matkhau...<72 byte>...B" la mot mat
// khau duy nhat duoi mat may chu. De nguoi dung dat mat khau dai roi tin rang
// phan duoi cung duoc tinh la de ho hieu nham ve chinh cai bao ve cua ho.
const newPasswordError = (v) => {
  if (typeof v !== 'string') return 'Mật khẩu không hợp lệ';
  if (v.length < MIN_PASSWORD_LENGTH) {
    return `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;
  }
  // Do bang BYTE chu khong phai ky tu: bcrypt dem byte, ma tieng Viet co dau
  // moi chu ton 2-3 byte. Dem theo ky tu thi mot mat khau 60 chu tieng Viet
  // (~150 byte) van lot qua roi bi cat am tham.
  if (Buffer.byteLength(v, 'utf8') > MAX_PASSWORD_LENGTH) {
    return `Mật khẩu tối đa ${MAX_PASSWORD_LENGTH} ký tự`;
  }
  return null;
};

// Ten hien thi. Tra ve { ten } hoac { loi }.
const validateName = (v) => {
  const name = typeof v === 'string' ? v.trim() : '';
  if (name.length < MIN_NAME_LENGTH) {
    return { loi: `Tên hiển thị phải có ít nhất ${MIN_NAME_LENGTH} ký tự` };
  }
  if (name.length > MAX_NAME_LENGTH) {
    return { loi: `Tên hiển thị tối đa ${MAX_NAME_LENGTH} ký tự` };
  }
  return { ten: name };
};

// ---------------------------------------------------------------------------
// Payload cua Google id_token
// ---------------------------------------------------------------------------

// Tra ve { email, sub, ten, anh } hoac { loi }.
//
// LO HONG DA VA - THIEU email_verified:
//
// Ban cu chi kiem `payload.email` co ton tai khong, roi lay email do di tim
// tai khoan va cap token. Google KHONG bao dam moi id_token deu mang email da
// xac minh: tai khoan Workspace do quan tri vien tu quan ly, va vai luong tao
// tai khoan, tra ve email_verified = false. Ai dung duoc mot mien Google
// Workspace la tao duoc mot tai khoan mang dia chi cua nguoi khac, dang nhap
// bang Google, va roi thang vao tai khoan cua nan nhan trong he thong nay -
// khong can biet mat khau, khong cham vao bat ky lop bao ve nao khac.
//
// `sub` cung bat buoc: do la ma dinh danh DUY NHAT va khong doi cua tai khoan
// Google (email thi doi duoc). Ban cu ghi `googleId: sub || ''`. Chuoi rong
// KHONG duoc index sparse bo qua, nen tai khoan thu hai roi vao nhanh do se
// dung khoa trung - va te hon, `User.findOne({ googleId: '' })` sau do se khop
// nham dung nhung tai khoan do voi nhau.
const verifyGooglePayload = (payload) => {
  const COMMON_ERRORS = { loi: 'Google credential không hợp lệ' };

  if (!payload || typeof payload !== 'object') return COMMON_ERRORS;

  const email = normalizeEmail(payload.email);
  if (!isValidEmail(email)) return COMMON_ERRORS;

  // google-auth-library tra ve boolean, nhung vai phien ban / vai nha cung cap
  // proxy tra chuoi 'true'. Nhan ca hai, va CHI hai gia tri do.
  const verified = payload.email_verified === true || payload.email_verified === 'true';
  if (!verified) {
    return { loi: 'Email Google này chưa được xác minh nên không dùng để đăng nhập được' };
  }

  const sub = typeof payload.sub === 'string' ? payload.sub.trim() : '';
  if (!sub) return COMMON_ERRORS;

  // Ten do Google cung cap se duoc GHI VAO CSDL. Cat theo dung gioi han cua
  // truong name thay vi tu choi: khong dang nhap duoc chi vi ten dai la vo ly.
  const rawName = typeof payload.name === 'string' ? payload.name.trim() : '';
  const name = (rawName || email.split('@')[0]).slice(0, MAX_NAME_LENGTH);

  // Anh KHONG duoc luu, chi chuyen thang ve trinh duyet - noi no se thanh
  // thuoc tinh src cua mot the img. Vi vay phai chac chan no la http(s):
  // mot gia tri kieu 'javascript:...' o dung cho do la mot lo XSS.
  const image = laHttpUrl(payload.picture) ? payload.picture : '';

  return { email, sub, ten: name, anh: image };
};

const laHttpUrl = (v) => {
  if (typeof v !== 'string' || !v) return false;
  try {
    const g = new URL(v).protocol;
    return g === 'http:' || g === 'https:';
  } catch {
    return false;
  }
};

module.exports = {
  normalizeEmail,
  isValidEmail,
  receivedPassword,
  newPasswordError,
  validateName,
  verifyGooglePayload,
  laHttpUrl,
  MAX_EMAIL_LENGTH,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
};
