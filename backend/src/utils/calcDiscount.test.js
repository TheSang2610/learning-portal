// Chay:  npm test
//
// Day la ma DUNG TIEN THAT nen test ky hon cac file khac: mot loi lam tron o
// day khong phai loi giao dien, no la tien thu thieu hoac thu thua cua nguoi
// dung. Viec doc/ghi CSDL nam o maGiaGiaController va khong test o day - CI
// khong co MONGO_URI.

const test = require('node:test');
const assert = require('node:assert');

const { checkVoucher, computeDiscount, normalizeCode, REASONS } = require('./calcDiscount');

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-06-15T00:00:00.000Z').getTime();

const sampleVoucher = (them = {}) => ({
    ma: 'TEST10',
    loai: 'phanTram',
    giaTri: 10,
    donToiThieu: 0,
    giamToiDa: null,
    batDau: new Date(NOW - 10 * DAY),
    ketThuc: new Date(NOW + 10 * DAY),
    soLuotToiDa: null,
    daDung: 0,
    moiNguoiMotLan: true,
    apDungKhoa: [],
    hoatDong: true,
    ...them,
});

/* ===== computeDiscount ===== */

test('phan tram tinh dung', () => {
    assert.strictEqual(computeDiscount(sampleVoucher({ giaTri: 10 }), 500000), 50000);
    assert.strictEqual(computeDiscount(sampleVoucher({ giaTri: 50 }), 200000), 100000);
});

test('so tien co dinh tinh dung', () => {
    const code = sampleVoucher({ loai: 'soTien', giaTri: 100000 });
    assert.strictEqual(computeDiscount(code, 500000), 100000);
});

test('khong bao gio giam nhieu hon gia goc', () => {
    // Giam nhieu hon gia la so phai tra thanh AM, va mot don am lam moi phep
    // tinh phia sau sai hoac nem.
    const code = sampleVoucher({ loai: 'soTien', giaTri: 900000 });
    assert.strictEqual(computeDiscount(code, 200000), 200000);

    const ma100 = sampleVoucher({ giaTri: 100 });
    assert.strictEqual(computeDiscount(ma100, 350000), 350000);
});

test('giamToiDa chan ma phan tram', () => {
    // 50% cua 5 trieu la 2,5 trieu - xa y dinh nguoi tao ma neu ho chi nghi toi
    // khoa 200k.
    const code = sampleVoucher({ giaTri: 50, giamToiDa: 100000 });
    assert.strictEqual(computeDiscount(code, 5000000), 100000);

    // Duoi tran thi khong bi chan.
    assert.strictEqual(computeDiscount(code, 100000), 50000);
});

test('lam tron XUONG chu khong len', () => {
    // 15% cua 333333 = 49999.95. Lam tron len la thu cua khach them mot dong
    // ho khong dong y; lam tron xuong la he thong chiu phan le.
    const code = sampleVoucher({ giaTri: 15 });
    assert.strictEqual(computeDiscount(code, 333333), 49999);
});

test('phan tram ngoai khoang 0-100 bi keo ve trong khoang', () => {
    assert.strictEqual(computeDiscount(sampleVoucher({ giaTri: 150 }), 100000), 100000);
    assert.strictEqual(computeDiscount(sampleVoucher({ giaTri: -20 }), 100000), 0);
});

test('gia goc rac tra ve 0, khong nem', () => {
    const code = sampleVoucher();
    assert.strictEqual(computeDiscount(code, 0), 0);
    assert.strictEqual(computeDiscount(code, -100), 0);
    assert.strictEqual(computeDiscount(code, null), 0);
    assert.strictEqual(computeDiscount(code, 'abc'), 0);
});

/* ===== checkVoucher ===== */

test('ma hop le thi tinh ra so phai tra', () => {
    const outcome = checkVoucher({ ma: sampleVoucher({ giaTri: 20 }), giaGoc: 500000, now: NOW });

    assert.strictEqual(outcome.ok, true);
    assert.strictEqual(outcome.soTienGiam, 100000);
    assert.strictEqual(outcome.phaiTra, 400000);
});

test('ma khong ton tai bi tu choi', () => {
    const outcome = checkVoucher({ ma: null, giaGoc: 100000, now: NOW });
    assert.strictEqual(outcome.ok, false);
    assert.strictEqual(outcome.lyDo, REASONS.NOT_FOUND);

    // Phai tra van la gia goc - noi goi co the dung thang con so nay.
    assert.strictEqual(outcome.phaiTra, 100000);
});

test('ma da tat bi tu choi', () => {
    const outcome = checkVoucher({
        ma: sampleVoucher({ hoatDong: false }),
        giaGoc: 100000,
        now: NOW,
    });
    assert.strictEqual(outcome.lyDo, REASONS.DISABLED);
});

test('ma chua toi ngay bat dau bi tu choi', () => {
    const outcome = checkVoucher({
        ma: sampleVoucher({ batDau: new Date(NOW + DAY) }),
        giaGoc: 100000,
        now: NOW,
    });
    assert.strictEqual(outcome.lyDo, REASONS.NOT_STARTED);
});

test('ma het han bi tu choi', () => {
    const outcome = checkVoucher({
        ma: sampleVoucher({ ketThuc: new Date(NOW - DAY) }),
        giaGoc: 100000,
        now: NOW,
    });
    assert.strictEqual(outcome.lyDo, REASONS.EXPIRED);
});

test('het luot dung khi daDung BANG soLuotToiDa', () => {
    // Day la cho de sai nhat: dung '>' thay vi '>=' la cho dung du mot luot.
    const justExhausted = checkVoucher({
        ma: sampleVoucher({ soLuotToiDa: 100, daDung: 100 }),
        giaGoc: 100000,
        now: NOW,
    });
    assert.strictEqual(justExhausted.lyDo, REASONS.EXHAUSTED);

    const oneLeft = checkVoucher({
        ma: sampleVoucher({ soLuotToiDa: 100, daDung: 99 }),
        giaGoc: 100000,
        now: NOW,
    });
    assert.strictEqual(oneLeft.ok, true);
});

test('soLuotToiDa null nghia la khong gioi han', () => {
    const outcome = checkVoucher({
        ma: sampleVoucher({ soLuotToiDa: null, daDung: 999999 }),
        giaGoc: 100000,
        now: NOW,
    });
    assert.strictEqual(outcome.ok, true);
});

test('moi nguoi mot lan chan nguoi da dung', () => {
    const code = sampleVoucher({ moiNguoiMotLan: true });

    const used = checkVoucher({ ma: code, giaGoc: 100000, usedVoucher: true, now: NOW });
    assert.strictEqual(used.lyDo, REASONS.ALREADY_USED);

    const unused = checkVoucher({ ma: code, giaGoc: 100000, usedVoucher: false, now: NOW });
    assert.strictEqual(unused.ok, true);
});

test('tat moiNguoiMotLan thi dung lai duoc', () => {
    const outcome = checkVoucher({
        ma: sampleVoucher({ moiNguoiMotLan: false }),
        giaGoc: 100000,
        usedVoucher: true,
        now: NOW,
    });
    assert.strictEqual(outcome.ok, true);
});

test('don duoi muc toi thieu bi tu choi', () => {
    const code = sampleVoucher({ donToiThieu: 500000 });

    const missing = checkVoucher({ ma: code, giaGoc: 499999, now: NOW });
    assert.strictEqual(missing.lyDo, REASONS.BELOW_MINIMUM);

    // Bang dung muc toi thieu thi PHAI qua.
    const justEnough = checkVoucher({ ma: code, giaGoc: 500000, now: NOW });
    assert.strictEqual(justEnough.ok, true);
});

test('apDungKhoa rong nghia la moi khoa', () => {
    const outcome = checkVoucher({
        ma: sampleVoucher({ apDungKhoa: [] }),
        giaGoc: 100000,
        courseId: 'khoa_bat_ky',
        now: NOW,
    });
    assert.strictEqual(outcome.ok, true);
});

test('apDungKhoa co danh sach thi chi khoa trong do dung duoc', () => {
    const code = sampleVoucher({ apDungKhoa: ['khoa_a', 'khoa_b'] });

    assert.strictEqual(
        checkVoucher({ ma: code, giaGoc: 100000, courseId: 'khoa_a', now: NOW }).ok,
        true,
    );
    assert.strictEqual(
        checkVoucher({ ma: code, giaGoc: 100000, courseId: 'khoa_c', now: NOW }).lyDo,
        REASONS.NOT_FOR_COURSE,
    );
});

test('apDungKhoa dang da populate van so sanh dung', () => {
    // Controller co the truyen ban tho (ObjectId) hoac ban da populate.
    const code = sampleVoucher({ apDungKhoa: [{ _id: 'khoa_a', title: 'Khoa A' }] });

    assert.strictEqual(
        checkVoucher({ ma: code, giaGoc: 100000, courseId: 'khoa_a', now: NOW }).ok,
        true,
    );
});

test('moi nhanh tu choi deu co cau tieng Viet doc duoc', () => {
    // Giao dien hien thang `cau` nay. Thieu mot cau la nguoi dung thay chuoi
    // rong hoac "undefined" o cho bao loi.
    const codes = [
        sampleVoucher({ hoatDong: false }),
        sampleVoucher({ ketThuc: new Date(NOW - DAY) }),
        sampleVoucher({ soLuotToiDa: 1, daDung: 1 }),
        sampleVoucher({ donToiThieu: 999999999 }),
    ];

    for (const m of codes) {
        const outcome = checkVoucher({ ma: m, giaGoc: 100000, now: NOW });
        assert.strictEqual(outcome.ok, false);
        assert.ok(outcome.cau.length > 0, `lyDo ${outcome.lyDo} phai co cau giai thich`);
    }
});

test('bayGio nhan ca Date lan so mili giay', () => {
    const code = sampleVoucher();
    assert.strictEqual(checkVoucher({ ma: code, giaGoc: 1000, now: NOW }).ok, true);
    assert.strictEqual(
        checkVoucher({ ma: code, giaGoc: 1000, now: new Date(NOW) }).ok,
        true,
    );
});

/* ===== normalizeCode ===== */

test('chuanMa dua ve chu hoa va bo khoang trang', () => {
    assert.strictEqual(normalizeCode('  giam10  '), 'GIAM10');
    assert.strictEqual(normalizeCode('Giam10'), 'GIAM10');
});

test('chuanMa chan do dai va gia tri khong phai chuoi', () => {
    assert.strictEqual(normalizeCode('A'.repeat(100)).length, 32);
    assert.strictEqual(normalizeCode(null), '');
    assert.strictEqual(normalizeCode(123), '');
});
