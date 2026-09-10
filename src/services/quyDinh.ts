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
