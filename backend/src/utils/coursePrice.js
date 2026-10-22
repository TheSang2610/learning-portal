// Gia khoa hoc: 0 = mien phi, con lai phai tu MIN_PAID_PRICE tro len.
//
// Vi sao co san: chuyen khoan qua QR duoi 2.000d thi nhieu app ngan hang tu
// choi, va doi chieu tu dong (utils/matchBankTransfer.js) co dung sai toi thieu
// 2.000d - khoa re hon muc do thi "chuyen thieu" va "chuyen du" khong con phan
// biet duoc. Chu du an chot san 2.000d ngay 22/10/2026.
const MIN_PAID_PRICE = 2000;

/** Tra ve cau bao loi neu gia khong hop le, chuoi rong neu hop le. */
const priceError = (value) => {
    if (value === undefined || value === null || value === '') return '';
    const price = Number(value);
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(price)) {
        return 'Giá khóa học phải là số nguyên không âm';
    }
    if (price > 0 && price < MIN_PAID_PRICE) {
        return `Khóa có phí phải từ ${MIN_PAID_PRICE.toLocaleString('vi-VN')}đ trở lên (để 0 nếu miễn phí)`;
    }
    return '';
};

module.exports = { MIN_PAID_PRICE, priceError };
