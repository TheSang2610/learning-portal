/**
 * Vi coin cua hoc vien.
 *
 * Coin la don vi noi bo dung de mua khoa hoc, chay SONG SONG voi chuyen khoan
 * VietQR chu khong thay the: ai co coin thi mua bang coin, ai khong thi van dat
 * don va chuyen khoan nhu cu.
 *
 * File nay chi chua phan TINH TOAN THUAN - doi gia ra coin, kiem tra so hop le.
 * Phan cham vao co so du lieu nam o coinController. Tach ra vi CI khong co
 * MONGO_URI, nen chi phan thuan moi kiem thu duoc.
 */

/**
 * Mot coin bang bao nhieu dong.
 *
 * Chon 1.000d de con so ngan, de doc va de go: khoa 799.000d thanh 799 coin
 * thay vi 799.000 coin. Doi ty gia thi sua DUY NHAT o day.
 */
const DONG_MOI_COIN = 1000;

/** Tran tren cho mot lan quan tri nap tay. Xem ghi chu o kiemSoCoinNap. */
const NAP_TOI_DA = 1000000;

/**
 * Gia tien (dong) -> so coin phai tra.
 *
 * LAM TRON LEN, khong lam tron thuong. Khoa 99.500d ra 100 coin chu khong phai
 * 99,5 coin: so du phai luon la so nguyen, va neu lam tron xuong thi hoc vien
 * tra 99 coin (= 99.000d) cho mot khoa 99.500d - he thong tu ban re di 500d moi
 * luot, khong ai phat hien ra vi tung lan qua nho.
 */
const giaRaCoin = (gia) => {
    const so = Number(gia);
    if (!Number.isFinite(so) || so <= 0) return 0;
    return Math.ceil(so / DONG_MOI_COIN);
};

/** So coin -> so dong tuong duong, chi de hien thi cho de hinh dung. */
const coinRaDong = (soCoin) => {
    const so = Number(soCoin);
    if (!Number.isFinite(so)) return 0;
    return Math.round(so) * DONG_MOI_COIN;
};

/**
 * Kiem tra so coin quan tri nhap vao o o "nap/thu hoi".
 *
 * Tra ve { hopLe, so, loi }.
 *
 * Vi sao chan chat den vay: day la duong DUY NHAT sinh ra coin tu hu khong.
 * Mot cu go nham dau phay hay mot chuoi "1e9" lot qua la mot tai khoan bong
 * nhien mua duoc ca trang. Nen:
 *
 *   - chi nhan so NGUYEN, khong nhan 12.5 (nua coin la vo nghia)
 *   - chan Infinity va NaN: Number("1e999") ra Infinity, sau do moi phep cong
 *     deu ra Infinity va so du hong vinh vien, khong sua lai duoc bang tay
 *   - chan 0: khong tao giao dich rong, chi lam ban so nhat ky
 *   - co tran NAP_TOI_DA cho mot lan: nap nhieu hon thi go nhieu lan, cham hon
 *     mot chut nhung mot cu truot tay khong the thanh so thien van
 */
const kiemSoCoinNap = (thoSo) => {
    if (typeof thoSo === 'string' && thoSo.trim() === '') {
        return { hopLe: false, so: 0, loi: 'Chưa nhập số coin' };
    }

    const so = Number(thoSo);

    if (!Number.isFinite(so)) {
        return { hopLe: false, so: 0, loi: 'Số coin không hợp lệ' };
    }
    if (!Number.isInteger(so)) {
        return { hopLe: false, so: 0, loi: 'Số coin phải là số nguyên' };
    }
    if (so === 0) {
        return { hopLe: false, so: 0, loi: 'Số coin phải khác 0' };
    }
    if (Math.abs(so) > NAP_TOI_DA) {
        return {
            hopLe: false,
            so: 0,
            loi: `Mỗi lần chỉ nạp/thu hồi tối đa ${NAP_TOI_DA.toLocaleString('vi-VN')} coin`
        };
    }

    return { hopLe: true, so, loi: '' };
};

/**
 * Du coin de mua khong.
 *
 * Tach ra thanh ham rieng de cho nao can bao gia truoc (giao dien) va cho thuc
 * su tru tien (may chu) dung CHUNG mot phep so sanh. Neu moi noi tu viet mot
 * kieu, se co luc giao dien bao "du" con may chu bao "thieu".
 */
const duCoin = (soDu, gia) => giaRaCoin(gia) <= Number(soDu || 0);

module.exports = {
    DONG_MOI_COIN,
    NAP_TOI_DA,
    giaRaCoin,
    coinRaDong,
    kiemSoCoinNap,
    duCoin
};
