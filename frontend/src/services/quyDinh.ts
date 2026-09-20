/**
 * Các quy định dùng chung giữa giao diện và máy chủ.
 *
 * Giữ ở một nơi vì backend cũng có bản của riêng nó
 * (`backend/src/utils/matKhau.js` và `backend/src/utils/xacThucDauVao.js`). Để
 * hai bên tự khai số riêng thì sớm muộn cũng lệch, và khi lệch thì giao diện
 * báo "hợp lệ" xong máy chủ trả 400 — người dùng không hiểu vì sao.
 *
 * Sửa ở đây thì phải sửa cả bên kia.
 */

/** Độ dài mật khẩu tối thiểu. Chỉ áp dụng cho mật khẩu đặt MỚI. */
export const DAI_MAT_KHAU_TOI_THIEU = 8;

/**
 * Độ dài mật khẩu tối đa, tính bằng BYTE. Chỉ áp dụng cho mật khẩu đặt MỚI.
 *
 * 72 không phải con số tự chọn: bcrypt chỉ băm 72 byte đầu và bỏ lặng phần còn
 * lại, không báo lỗi. Chặn ở đây để người dùng không đặt một mật khẩu dài rồi
 * tin rằng cả chuỗi đều được tính.
 */
export const DAI_MAT_KHAU_TOI_DA = 72;

/** RFC 5321: một địa chỉ thư dài nhất 254 ký tự. */
export const DAI_EMAIL_TOI_DA = 254;

/** Tên hiển thị. Khớp với giới hạn của trang hồ sơ và của backend. */
export const DAI_TEN_TOI_THIEU = 2;
export const DAI_TEN_TOI_DA = 50;

/**
 * Đếm độ dài mật khẩu theo BYTE, không phải theo ký tự.
 *
 * bcrypt đếm byte, mà chữ tiếng Việt có dấu tốn 2–3 byte mỗi chữ. Đếm theo ký
 * tự thì một mật khẩu 30 chữ tiếng Việt (~90 byte) vẫn lọt qua giao diện rồi bị
 * máy chủ trả 400 — hoặc tệ hơn, ở bản cũ là bị bcrypt cắt âm thầm.
 */
export const soByte = (s: string) => new TextEncoder().encode(s).length;

/** Kiểm định dạng email cơ bản. Khớp đúng biểu thức mà backend dùng. */
export const emailHopLe = (v: string) =>
  v.length > 0 && v.length <= DAI_EMAIL_TOI_DA && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

/** Phần trước dấu @ của một địa chỉ thư dài nhất 64 ký tự (RFC 5321). */
export const DAI_TEN_TAI_KHOAN_TOI_DA = 64;

/**
 * Đưa mọi cách gõ số điện thoại về dạng chuẩn `0XXXXXXXXX`, hoặc `""` nếu đọc
 * không ra.
 *
 * Bản sao của `chuanHoaSoDienThoai` trong `backend/src/utils/soDienThoai.js` —
 * sửa ở đây thì phải sửa cả bên kia. Lý do đầy đủ vì sao phải chuẩn hóa chứ
 * không chỉ kiểm hình dạng nằm ở đầu file đó.
 *
 * Tóm tắt: `0901234567`, `+84901234567` và `090.123.4567` là cùng một số. Lưu
 * nguyên như người dùng gõ thì chúng thành ba bản ghi khác nhau, và ai đăng ký
 * bằng cách này sẽ không đăng nhập được bằng cách kia.
 */
export const chuanHoaSoDienThoai = (v: string): string => {
  if (typeof v !== "string") return "";

  const so = v.replace(/\D/g, "");
  if (!so) return "";

  let phan: string;

  if (so.startsWith("84") && so.length === 11) {
    // Dạng quốc tế: 84 + 9 chữ số. Độ dài là thứ phân biệt duy nhất —
    // `0845123456` bỏ số 0 cũng bắt đầu bằng `84` nhưng chỉ có 10 chữ số.
    phan = so.slice(2);
  } else if (so.startsWith("0") && so.length === 10) {
    phan = so.slice(1);
  } else if (so.length === 9) {
    // Gõ thiếu số 0 ở đầu — hay gặp khi chép từ bảng tính.
    phan = so;
  } else {
    return "";
  }

  // Chỉ nhận đầu số di động. Số máy bàn (024, 028…) không nhận được tin nhắn.
  if (!["3", "5", "7", "8", "9"].includes(phan[0])) return "";

  return `0${phan}`;
};

/** Đọc được thành một số di động Việt Nam hợp lệ không. */
export const soDienThoaiHopLe = (v: string) => chuanHoaSoDienThoai(v) !== "";

/**
 * Kiểm thứ người dùng gõ ở ô đăng nhập.
 *
 * Đăng nhập nhận ba cách gõ: số điện thoại, địa chỉ đầy đủ, và tên tài khoản
 * ngắn ("thesang" thay cho "thesang@gmail.com"). Khớp với `boLocTaiKhoan`
 * trong `backend/src/utils/dinhDanhDangNhap.js`; sửa ở đây thì phải sửa cả
 * bên kia.
 *
 * Chỉ kiểm HÌNH DẠNG để người dùng biết ngay, không đoán hộ họ tài khoản nào:
 * việc tra cứu là của máy chủ, và máy chủ kiểm lại toàn bộ.
 */
export const dinhDanhDangNhapHopLe = (v: string) => {
  if (v.includes("@")) return emailHopLe(v);
  if (soDienThoaiHopLe(v)) return true;
  return (
    v.length > 0 &&
    v.length <= DAI_TEN_TAI_KHOAN_TOI_DA &&
    /^[a-z0-9._%+-]+$/.test(v.toLowerCase())
  );
};

/** Trả về câu báo lỗi cho mật khẩu đặt MỚI, hoặc null nếu đạt. */
export const loiMatKhauMoi = (v: string) => {
  if (v.length < DAI_MAT_KHAU_TOI_THIEU) {
    return `Mật khẩu phải có ít nhất ${DAI_MAT_KHAU_TOI_THIEU} ký tự`;
  }
  if (soByte(v) > DAI_MAT_KHAU_TOI_DA) {
    return `Mật khẩu tối đa ${DAI_MAT_KHAU_TOI_DA} ký tự`;
  }
  return null;
};

/** Kiểm tên hiển thị. Trả về câu báo lỗi, hoặc null nếu đạt. */
export const kiemTen = (v: string) => {
  if (v.length < DAI_TEN_TOI_THIEU) {
    return `Tên hiển thị phải có ít nhất ${DAI_TEN_TOI_THIEU} ký tự`;
  }
  if (v.length > DAI_TEN_TOI_DA) {
    return `Tên hiển thị tối đa ${DAI_TEN_TOI_DA} ký tự`;
  }
  return null;
};
