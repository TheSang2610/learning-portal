/**
 * Kiem ma giam gia va tinh so tien duoc giam.
 *
 * Tach rieng khoi controller vi ba le:
 *
 *   1. Day la cho DUY NHAT quyet dinh mot ma co dung duoc khong va giam bao
 *      nhieu. Ma giam gia duoc ap o nhieu duong (don mua le, don ca gio hang,
 *      o nhap ma de xem truoc). Moi duong tu tinh lay la som muon lech nhau,
 *      va khi lech thi mot ben tinh it hon - tuc la mat tien.
 *   2. Toan bo file nay la ham THUAN - khong CSDL, khong mang, khong Date.now()
 *      an (thoi diem truyen tu ngoai vao). Nho vay moi test duoc.
 *   3. Day la ma ĐỤNG TIỀN THẬT. Mot loi lam tron o day khong phai loi giao
 *      dien, no la tien thu thieu hoac thu thua cua nguoi dung.
 */

// Ly do tu choi. Dung ma chu khong dung cau chu o day de noi goi tu quyet dinh
// hien gi - va de test kiem duoc dung nhanh nao chay, khong phai so chuoi.
const REASONS = {
    NOT_FOUND: 'khong_ton_tai',
    DISABLED: 'da_tat',
    NOT_STARTED: 'chua_bat_dau',
    EXPIRED: 'da_het_han',
    EXHAUSTED: 'het_luot',
    ALREADY_USED: 'da_dung_roi',
    BELOW_MINIMUM: 'khong_du_toi_thieu',
    NOT_FOR_COURSE: 'khong_ap_dung_khoa',
};

const REJECT_MESSAGES = {
    [REASONS.NOT_FOUND]: 'Mã giảm giá không tồn tại.',
    [REASONS.DISABLED]: 'Mã giảm giá đã ngừng áp dụng.',
    [REASONS.NOT_STARTED]: 'Mã giảm giá chưa đến ngày áp dụng.',
    [REASONS.EXPIRED]: 'Mã giảm giá đã hết hạn.',
    [REASONS.EXHAUSTED]: 'Mã giảm giá đã hết lượt sử dụng.',
    [REASONS.ALREADY_USED]: 'Bạn đã dùng mã này rồi.',
    [REASONS.BELOW_MINIMUM]: 'Đơn hàng chưa đạt giá trị tối thiểu để dùng mã này.',
    [REASONS.NOT_FOR_COURSE]: 'Mã giảm giá không áp dụng cho khóa học này.',
};

/**
 * So tien duoc giam, DA lam tron va DA chan tran.
 *
 * Khong bao gio tra ve so lon hon `giaGoc`: giam nhieu hon gia la so tien phai
 * tra thanh AM, va mot don am se lam moi phep tinh phia sau sai hoac nem.
 */
const computeDiscount = (code, originalPrice) => {
    const price = Number(originalPrice);
    if (!Number.isFinite(price) || price <= 0) return 0;

    let discount;

    if (code.loai === 'phanTram') {
        const percent = Math.min(Math.max(Number(code.giaTri) || 0, 0), 100);
        discount = (price * percent) / 100;

        // Tran cho ma phan tram. 50% cua khoa 5 trieu la 2,5 trieu - nhieu hon
        // y dinh cua nguoi tao ma rat xa neu ho chi nghi toi khoa 200k.
        if (code.giamToiDa !== null && code.giamToiDa !== undefined) {
            discount = Math.min(discount, Number(code.giamToiDa) || 0);
        }
    } else {
        discount = Number(code.giaTri) || 0;
    }

    // Lam tron XUONG, ve dong.
    //
    // Lam tron len la thu cua khach them vai dong ma ho khong he dong y; lam
    // tron xuong la he thong chiu phan le. Phan le do toi da la 1 dong.
    discount = Math.floor(discount);

    return Math.max(0, Math.min(discount, price));
};

/**
 * Kiem mot ma co dung duoc khong.
 *
 * Tra ve { ok, lyDo, cau, soTienGiam, phaiTra } - khong nem ngoai le, de noi
 * goi tu quyet dinh ma HTTP.
 *
 * `now` truyen tu ngoai vao chu khong goi Date.now() ben trong: co the vay
 * moi viet duoc test cho "chua bat dau" va "da het han" ma khong phai doi that.
 */
const checkVoucher = ({
    ma: code,
    giaGoc: originalPrice,
    courseId,
    usedVoucher = false,
    now = Date.now(),
} = {}) => {
    const reject = (reason) => ({
        ok: false,
        lyDo: reason,
        cau: REJECT_MESSAGES[reason] || 'Mã giảm giá không dùng được.',
        soTienGiam: 0,
        phaiTra: Number(originalPrice) || 0,
    });

    if (!code) return reject(REASONS.NOT_FOUND);
    if (!code.hoatDong) return reject(REASONS.DISABLED);

    const moc = now instanceof Date ? now.getTime() : Number(now);

    if (code.batDau && new Date(code.batDau).getTime() > moc) {
        return reject(REASONS.NOT_STARTED);
    }
    if (code.ketThuc && new Date(code.ketThuc).getTime() < moc) {
        return reject(REASONS.EXPIRED);
    }

    // `>=` chu khong `>`: daDung dem so luot DA dung roi, nen bang tran nghia la
    // het. Dung `>` la cho dung du mot luot.
    if (
        code.soLuotToiDa !== null &&
        code.soLuotToiDa !== undefined &&
        Number(code.daDung || 0) >= Number(code.soLuotToiDa)
    ) {
        return reject(REASONS.EXHAUSTED);
    }

    if (code.moiNguoiMotLan && usedVoucher) {
        return reject(REASONS.ALREADY_USED);
    }

    const price = Number(originalPrice) || 0;
    if (Number(code.donToiThieu || 0) > price) {
        return reject(REASONS.BELOW_MINIMUM);
    }

    // Danh sach rong = ap dung moi khoa. Co phan tu thi khoa phai nam trong do.
    const courseList = Array.isArray(code.apDungKhoa) ? code.apDungKhoa : [];
    if (courseList.length > 0) {
        const box = courseList.some((k) => String(k._id || k) === String(courseId));
        if (!box) return reject(REASONS.NOT_FOR_COURSE);
    }

    const discountAmount = computeDiscount(code, price);

    return {
        ok: true,
        lyDo: null,
        cau: '',
        soTienGiam: discountAmount,
        phaiTra: price - discountAmount,
    };
};

/** Chuan hoa ma nguoi dung go: bo khoang trang, dua ve chu hoa. */
const normalizeCode = (tho) =>
    typeof tho === 'string' ? tho.trim().toUpperCase().slice(0, 32) : '';

module.exports = {
    checkVoucher,
    computeDiscount,
    normalizeCode,
    REASONS,
    REJECT_MESSAGES,
};
