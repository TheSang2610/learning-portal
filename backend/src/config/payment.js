// Thong tin nhan tien va cach dung ma QR.
//
// Bien moi truong VAN duoc uu tien: doi tai khoan nhan tien thi chi can dat lai
// bien tren Vercel, khong phai sua code roi deploy lai.
//
// Ben duoi la tai khoan MAC DINH, dung khi khong dat bien nao. Truoc day de
// rong nen may chu chua dat bien se khong sinh duoc QR, va nguoi mua phai tu go
// tay so tai khoan - do la cho hay sai nhat trong ca luong thanh toan.
//
// Ghi cung o day chap nhan duoc vi repo backend la repo RIENG TU, va vi so tai
// khoan nhan tien von la thu phai dua ra cho nguoi ta moi nhan duoc tien - no
// nam san tren anh QR ai quet cung thay. Day KHONG phai bi mat kieu JWT_SECRET
// hay MONGO_URI; nhung thu do van chi nam trong .env.

// Ma ngan hang theo danh sach cua VietQR (MB, VCB, TCB, ACB, BIDV, VPB...).
// Xem day du o https://api.vietqr.io/v2/banks. BIDV con co ma BIN la 970418,
// dung ma nao cung duoc.
const BANK = process.env.NGAN_HANG || 'BIDV';
const ACCOUNT_NUMBER = process.env.SO_TAI_KHOAN || '1810408755';

// VietQR in ten chu tai khoan len anh, va ngan hang doi chieu KHONG DAU chu in
// hoa - go co dau vao thi anh hien sai chinh ta so voi ten that tren tai khoan.
const ACCOUNT_NAME = process.env.TEN_TAI_KHOAN || 'NGUYEN THE SANG';

/** Da khai bao du de sinh QR chua? Thieu mot cai la khong sinh duoc. */
const isConfigured = () => Boolean(BANK && ACCOUNT_NUMBER && ACCOUNT_NAME);

/**
 * Dia chi anh QR do VietQR sinh ra.
 *
 * QR duoc sinh TU thong tin tai khoan chu khong phai anh tinh tai len, nen
 * moi don co so tien va noi dung rieng nam san trong ma - nguoi dung quet xong
 * la moi o da dien, khong phai go tay. Go tay la cho hay sai nhat.
 *
 * Tra ve null khi chua cau hinh, de tang tren con biet ma bao cho nguoi dung
 * thay vi hien mot anh vo.
 */
const qrImage = ({ soTien: amount, noiDung: content }) => {
    if (!isConfigured()) return null;

    const tham = new URLSearchParams({
        accountName: ACCOUNT_NAME,
        amount: String(Math.round(Number(amount) || 0)),
        addInfo: String(content || '')
    });

    // "compact2" in ten chu tai khoan, so tai khoan va SO TIEN ngay tren anh,
    // nen nguoi dung doi chieu duoc bang mat truoc khi bam chuyen.
    //
    // Luu y: noi dung chuyen khoan (ma don) thi KHONG duoc in ra anh - no chi
    // nam trong du lieu ma QR de app ngan hang tu dien vao. Nen trang thanh
    // toan van phai hien ma don bang chu kem nut sao chep, cho nguoi khong
    // quet duoc QR: thieu ma do thi tien ve toi noi ma khong khop don nao.
    return `https://img.vietqr.io/image/${BANK}-${ACCOUNT_NUMBER}-compact2.jpg?${tham}`;
};

/** Phan thong tin chuyen khoan gui cho giao dien. Khong co gi bi mat o day. */
const transferInfo = ({ soTien: amount, noiDung: content }) => ({
    nganHang: BANK,
    soTaiKhoan: ACCOUNT_NUMBER,
    tenTaiKhoan: ACCOUNT_NAME,
    soTien: amount,
    noiDung: content,
    anhQR: qrImage({ soTien: amount, noiDung: content }),
    daCauHinh: isConfigured()
});

module.exports = { daCauHinh: isConfigured, anhQR: qrImage, transferInfo };
