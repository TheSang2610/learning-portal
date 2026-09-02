/**
 * Các quy định dùng chung giữa giao diện và máy chủ.
 *
 * Giữ ở một nơi vì backend cũng có bản của riêng nó
 * (`backend/src/utils/matKhau.js`). Để hai bên tự khai số riêng thì sớm muộn
 * cũng lệch, và khi lệch thì giao diện báo "hợp lệ" xong máy chủ trả 400 —
 * người dùng không hiểu vì sao.
 *
 * Sửa ở đây thì phải sửa cả bên kia.
 */

/** Độ dài mật khẩu tối thiểu. Chỉ áp dụng cho mật khẩu đặt MỚI. */
export const DAI_MAT_KHAU_TOI_THIEU = 8;
