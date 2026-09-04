// Thong tin nhan tien va cach dung ma QR.
//
// Khong ghi cung so tai khoan vao ma nguon: repo frontend la cong khai, va
// doi tai khoan nhan tien khong nen phai sua code roi deploy lai.

// Ma ngan hang theo danh sach cua VietQR (MB, VCB, TCB, ACB, BIDV, VPB...).
// Xem day du o https://api.vietqr.io/v2/banks
const NGAN_HANG = process.env.NGAN_HANG || '';
const SO_TAI_KHOAN = process.env.SO_TAI_KHOAN || '';
const TEN_TAI_KHOAN = process.env.TEN_TAI_KHOAN || '';

/** Da khai bao du de sinh QR chua? Thieu mot cai la khong sinh duoc. */
const daCauHinh = () => Boolean(NGAN_HANG && SO_TAI_KHOAN && TEN_TAI_KHOAN);

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
const anhQR = ({ soTien, noiDung }) => {
    if (!daCauHinh()) return null;

    const tham = new URLSearchParams({
        accountName: TEN_TAI_KHOAN,
        amount: String(Math.round(Number(soTien) || 0)),
        addInfo: String(noiDung || '')
    });

    // "compact2" hien san so tien va noi dung ngay tren anh, nen nguoi dung
    // doi chieu duoc bang mat truoc khi bam chuyen.
    return `https://img.vietqr.io/image/${NGAN_HANG}-${SO_TAI_KHOAN}-compact2.jpg?${tham}`;
};

/** Phan thong tin chuyen khoan gui cho giao dien. Khong co gi bi mat o day. */
const thongTinChuyenKhoan = ({ soTien, noiDung }) => ({
    nganHang: NGAN_HANG,
    soTaiKhoan: SO_TAI_KHOAN,
    tenTaiKhoan: TEN_TAI_KHOAN,
    soTien,
    noiDung,
    anhQR: anhQR({ soTien, noiDung }),
    daCauHinh: daCauHinh()
});

module.exports = { daCauHinh, anhQR, thongTinChuyenKhoan };
