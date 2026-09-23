/**
 * Kiem ma giam gia va tinh so tien duoc giam.
 *
 * Tach rieng khoi controller vi ba le:
 *
 *   1. Day la cho DUY NHAT quyet dinh mot ma co dung duoc khong va giam bao
 *      nhieu. Ma giam gia se duoc ap o IT NHAT hai duong (dat don chuyen khoan
 *      va mua bang coin). Moi duong tu tinh lay la som muon hai duong lech
 *      nhau, va khi lech thi mot ben tinh it hon - tuc la mat tien.
 *   2. Toan bo file nay la ham THUAN - khong CSDL, khong mang, khong Date.now()
 *      an (thoi diem truyen tu ngoai vao). Nho vay moi test duoc.
 *   3. Day la ma ĐỤNG TIỀN THẬT. Mot loi lam tron o day khong phai loi giao
 *      dien, no la tien thu thieu hoac thu thua cua nguoi dung.
 */

// Ly do tu choi. Dung ma chu khong dung cau chu o day de noi goi tu quyet dinh
// hien gi - va de test kiem duoc dung nhanh nao chay, khong phai so chuoi.
const LY_DO = {
    KHONG_TON_TAI: 'khong_ton_tai',
    DA_TAT: 'da_tat',
    CHUA_BAT_DAU: 'chua_bat_dau',
    DA_HET_HAN: 'da_het_han',
    HET_LUOT: 'het_luot',
    DA_DUNG_ROI: 'da_dung_roi',
    KHONG_DU_TOI_THIEU: 'khong_du_toi_thieu',
    KHONG_AP_DUNG_KHOA: 'khong_ap_dung_khoa',
};

const CAU_TU_CHOI = {
    [LY_DO.KHONG_TON_TAI]: 'Mã giảm giá không tồn tại.',
    [LY_DO.DA_TAT]: 'Mã giảm giá đã ngừng áp dụng.',
    [LY_DO.CHUA_BAT_DAU]: 'Mã giảm giá chưa đến ngày áp dụng.',
    [LY_DO.DA_HET_HAN]: 'Mã giảm giá đã hết hạn.',
    [LY_DO.HET_LUOT]: 'Mã giảm giá đã hết lượt sử dụng.',
    [LY_DO.DA_DUNG_ROI]: 'Bạn đã dùng mã này rồi.',
    [LY_DO.KHONG_DU_TOI_THIEU]: 'Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này.',
    [LY_DO.KHONG_AP_DUNG_KHOA]: 'Mã giảm giá không áp dụng cho khóa học này.',
};

/**
 * So tien duoc giam, DA lam tron va DA chan tran.
 *
 * Khong bao gio tra ve so lon hon `giaGoc`: giam nhieu hon gia la so tien phai
 * tra thanh AM, va mot don am se lam moi phep tinh phia sau sai hoac nem.
 */
const tinhSoTienGiam = (ma, giaGoc) => {
    const gia = Number(giaGoc);
    if (!Number.isFinite(gia) || gia <= 0) return 0;

    let giam;

    if (ma.loai === 'phanTram') {
        const phanTram = Math.min(Math.max(Number(ma.giaTri) || 0, 0), 100);
        giam = (gia * phanTram) / 100;

        // Tran cho ma phan tram. 50% cua khoa 5 trieu la 2,5 trieu - nhieu hon
        // y dinh cua nguoi tao ma rat xa neu ho chi nghi toi khoa 200k.
        if (ma.giamToiDa !== null && ma.giamToiDa !== undefined) {
            giam = Math.min(giam, Number(ma.giamToiDa) || 0);
        }
    } else {
        giam = Number(ma.giaTri) || 0;
    }

    // Lam tron XUONG, ve dong.
    //
    // Lam tron len la thu cua khach them vai dong ma ho khong he dong y; lam
    // tron xuong la he thong chiu phan le. Phan le do toi da la 1 dong.
    giam = Math.floor(giam);

    return Math.max(0, Math.min(giam, gia));
};

/**
 * Kiem mot ma co dung duoc khong.
 *
 * Tra ve { ok, lyDo, cau, soTienGiam, phaiTra } - khong nem ngoai le, de noi
 * goi tu quyet dinh ma HTTP.
 *
 * `bayGio` truyen tu ngoai vao chu khong goi Date.now() ben trong: co the vay
 * moi viet duoc test cho "chua bat dau" va "da het han" ma khong phai doi that.
 */
const kiemMaGiamGia = ({
    ma,
    giaGoc,
    courseId,
    daDungMa = false,
    bayGio = Date.now(),
} = {}) => {
    const tuChoi = (lyDo) => ({
        ok: false,
        lyDo,
        cau: CAU_TU_CHOI[lyDo] || 'Mã giảm giá không dùng được.',
        soTienGiam: 0,
        phaiTra: Number(giaGoc) || 0,
    });

    if (!ma) return tuChoi(LY_DO.KHONG_TON_TAI);
    if (!ma.hoatDong) return tuChoi(LY_DO.DA_TAT);

    const moc = bayGio instanceof Date ? bayGio.getTime() : Number(bayGio);

    if (ma.batDau && new Date(ma.batDau).getTime() > moc) {
        return tuChoi(LY_DO.CHUA_BAT_DAU);
    }
    if (ma.ketThuc && new Date(ma.ketThuc).getTime() < moc) {
        return tuChoi(LY_DO.DA_HET_HAN);
    }

    // `>=` chu khong `>`: daDung dem so luot DA dung roi, nen bang tran nghia la
    // het. Dung `>` la cho dung du mot luot.
    if (
        ma.soLuotToiDa !== null &&
        ma.soLuotToiDa !== undefined &&
        Number(ma.daDung || 0) >= Number(ma.soLuotToiDa)
    ) {
        return tuChoi(LY_DO.HET_LUOT);
    }

    if (ma.moiNguoiMotLan && daDungMa) {
        return tuChoi(LY_DO.DA_DUNG_ROI);
    }

    const gia = Number(giaGoc) || 0;
    if (Number(ma.donToiThieu || 0) > gia) {
        return tuChoi(LY_DO.KHONG_DU_TOI_THIEU);
    }

    // Danh sach rong = ap dung moi khoa. Co phan tu thi khoa phai nam trong do.
    const dsKhoa = Array.isArray(ma.apDungKhoa) ? ma.apDungKhoa : [];
    if (dsKhoa.length > 0) {
        const hop = dsKhoa.some((k) => String(k._id || k) === String(courseId));
        if (!hop) return tuChoi(LY_DO.KHONG_AP_DUNG_KHOA);
    }

    const soTienGiam = tinhSoTienGiam(ma, gia);

    return {
        ok: true,
        lyDo: null,
        cau: '',
        soTienGiam,
        phaiTra: gia - soTienGiam,
    };
};

/** Chuan hoa ma nguoi dung go: bo khoang trang, dua ve chu hoa. */
const chuanMa = (tho) =>
    typeof tho === 'string' ? tho.trim().toUpperCase().slice(0, 32) : '';

module.exports = {
    kiemMaGiamGia,
    tinhSoTienGiam,
    chuanMa,
    LY_DO,
    CAU_TU_CHOI,
};
