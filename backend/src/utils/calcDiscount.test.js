// Chay:  npm test
//
// Day la ma DUNG TIEN THAT nen test ky hon cac file khac: mot loi lam tron o
// day khong phai loi giao dien, no la tien thu thieu hoac thu thua cua nguoi
// dung. Viec doc/ghi CSDL nam o maGiaGiaController va khong test o day - CI
// khong co MONGO_URI.

const test = require('node:test');
const assert = require('node:assert');

const { kiemMaGiamGia, tinhSoTienGiam, chuanMa, LY_DO } = require('./calcDiscount');

const NGAY = 24 * 60 * 60 * 1000;
const BAY_GIO = new Date('2026-06-15T00:00:00.000Z').getTime();

const maMau = (them = {}) => ({
    ma: 'TEST10',
    loai: 'phanTram',
    giaTri: 10,
    donToiThieu: 0,
    giamToiDa: null,
    batDau: new Date(BAY_GIO - 10 * NGAY),
    ketThuc: new Date(BAY_GIO + 10 * NGAY),
    soLuotToiDa: null,
    daDung: 0,
    moiNguoiMotLan: true,
    apDungKhoa: [],
    hoatDong: true,
    ...them,
});

/* ===== tinhSoTienGiam ===== */

test('phan tram tinh dung', () => {
    assert.strictEqual(tinhSoTienGiam(maMau({ giaTri: 10 }), 500000), 50000);
    assert.strictEqual(tinhSoTienGiam(maMau({ giaTri: 50 }), 200000), 100000);
});

test('so tien co dinh tinh dung', () => {
    const ma = maMau({ loai: 'soTien', giaTri: 100000 });
    assert.strictEqual(tinhSoTienGiam(ma, 500000), 100000);
});

test('khong bao gio giam nhieu hon gia goc', () => {
    // Giam nhieu hon gia la so phai tra thanh AM, va mot don am lam moi phep
    // tinh phia sau sai hoac nem.
    const ma = maMau({ loai: 'soTien', giaTri: 900000 });
    assert.strictEqual(tinhSoTienGiam(ma, 200000), 200000);

    const ma100 = maMau({ giaTri: 100 });
    assert.strictEqual(tinhSoTienGiam(ma100, 350000), 350000);
});

test('giamToiDa chan ma phan tram', () => {
    // 50% cua 5 trieu la 2,5 trieu - xa y dinh nguoi tao ma neu ho chi nghi toi
    // khoa 200k.
    const ma = maMau({ giaTri: 50, giamToiDa: 100000 });
    assert.strictEqual(tinhSoTienGiam(ma, 5000000), 100000);

    // Duoi tran thi khong bi chan.
    assert.strictEqual(tinhSoTienGiam(ma, 100000), 50000);
});

test('lam tron XUONG chu khong len', () => {
    // 15% cua 333333 = 49999.95. Lam tron len la thu cua khach them mot dong
    // ho khong dong y; lam tron xuong la he thong chiu phan le.
    const ma = maMau({ giaTri: 15 });
    assert.strictEqual(tinhSoTienGiam(ma, 333333), 49999);
});

test('phan tram ngoai khoang 0-100 bi keo ve trong khoang', () => {
    assert.strictEqual(tinhSoTienGiam(maMau({ giaTri: 150 }), 100000), 100000);
    assert.strictEqual(tinhSoTienGiam(maMau({ giaTri: -20 }), 100000), 0);
});

test('gia goc rac tra ve 0, khong nem', () => {
    const ma = maMau();
    assert.strictEqual(tinhSoTienGiam(ma, 0), 0);
    assert.strictEqual(tinhSoTienGiam(ma, -100), 0);
    assert.strictEqual(tinhSoTienGiam(ma, null), 0);
    assert.strictEqual(tinhSoTienGiam(ma, 'abc'), 0);
});

/* ===== kiemMaGiamGia ===== */

test('ma hop le thi tinh ra so phai tra', () => {
    const kq = kiemMaGiamGia({ ma: maMau({ giaTri: 20 }), giaGoc: 500000, bayGio: BAY_GIO });

    assert.strictEqual(kq.ok, true);
    assert.strictEqual(kq.soTienGiam, 100000);
    assert.strictEqual(kq.phaiTra, 400000);
});

test('ma khong ton tai bi tu choi', () => {
    const kq = kiemMaGiamGia({ ma: null, giaGoc: 100000, bayGio: BAY_GIO });
    assert.strictEqual(kq.ok, false);
    assert.strictEqual(kq.lyDo, LY_DO.KHONG_TON_TAI);

    // Phai tra van la gia goc - noi goi co the dung thang con so nay.
    assert.strictEqual(kq.phaiTra, 100000);
});

test('ma da tat bi tu choi', () => {
    const kq = kiemMaGiamGia({
        ma: maMau({ hoatDong: false }),
        giaGoc: 100000,
        bayGio: BAY_GIO,
    });
    assert.strictEqual(kq.lyDo, LY_DO.DA_TAT);
});

test('ma chua toi ngay bat dau bi tu choi', () => {
    const kq = kiemMaGiamGia({
        ma: maMau({ batDau: new Date(BAY_GIO + NGAY) }),
        giaGoc: 100000,
        bayGio: BAY_GIO,
    });
    assert.strictEqual(kq.lyDo, LY_DO.CHUA_BAT_DAU);
});

test('ma het han bi tu choi', () => {
    const kq = kiemMaGiamGia({
        ma: maMau({ ketThuc: new Date(BAY_GIO - NGAY) }),
        giaGoc: 100000,
        bayGio: BAY_GIO,
    });
    assert.strictEqual(kq.lyDo, LY_DO.DA_HET_HAN);
});

test('het luot dung khi daDung BANG soLuotToiDa', () => {
    // Day la cho de sai nhat: dung '>' thay vi '>=' la cho dung du mot luot.
    const vuaHet = kiemMaGiamGia({
        ma: maMau({ soLuotToiDa: 100, daDung: 100 }),
        giaGoc: 100000,
        bayGio: BAY_GIO,
    });
    assert.strictEqual(vuaHet.lyDo, LY_DO.HET_LUOT);

    const conMot = kiemMaGiamGia({
        ma: maMau({ soLuotToiDa: 100, daDung: 99 }),
        giaGoc: 100000,
        bayGio: BAY_GIO,
    });
    assert.strictEqual(conMot.ok, true);
});

test('soLuotToiDa null nghia la khong gioi han', () => {
    const kq = kiemMaGiamGia({
        ma: maMau({ soLuotToiDa: null, daDung: 999999 }),
        giaGoc: 100000,
        bayGio: BAY_GIO,
    });
    assert.strictEqual(kq.ok, true);
});

test('moi nguoi mot lan chan nguoi da dung', () => {
    const ma = maMau({ moiNguoiMotLan: true });

    const daDung = kiemMaGiamGia({ ma, giaGoc: 100000, daDungMa: true, bayGio: BAY_GIO });
    assert.strictEqual(daDung.lyDo, LY_DO.DA_DUNG_ROI);

    const chuaDung = kiemMaGiamGia({ ma, giaGoc: 100000, daDungMa: false, bayGio: BAY_GIO });
    assert.strictEqual(chuaDung.ok, true);
});

test('tat moiNguoiMotLan thi dung lai duoc', () => {
    const kq = kiemMaGiamGia({
        ma: maMau({ moiNguoiMotLan: false }),
        giaGoc: 100000,
        daDungMa: true,
        bayGio: BAY_GIO,
    });
    assert.strictEqual(kq.ok, true);
});

test('don duoi muc toi thieu bi tu choi', () => {
    const ma = maMau({ donToiThieu: 500000 });

    const thieu = kiemMaGiamGia({ ma, giaGoc: 499999, bayGio: BAY_GIO });
    assert.strictEqual(thieu.lyDo, LY_DO.KHONG_DU_TOI_THIEU);

    // Bang dung muc toi thieu thi PHAI qua.
    const vuaDu = kiemMaGiamGia({ ma, giaGoc: 500000, bayGio: BAY_GIO });
    assert.strictEqual(vuaDu.ok, true);
});

test('apDungKhoa rong nghia la moi khoa', () => {
    const kq = kiemMaGiamGia({
        ma: maMau({ apDungKhoa: [] }),
        giaGoc: 100000,
        courseId: 'khoa_bat_ky',
        bayGio: BAY_GIO,
    });
    assert.strictEqual(kq.ok, true);
});

test('apDungKhoa co danh sach thi chi khoa trong do dung duoc', () => {
    const ma = maMau({ apDungKhoa: ['khoa_a', 'khoa_b'] });

    assert.strictEqual(
        kiemMaGiamGia({ ma, giaGoc: 100000, courseId: 'khoa_a', bayGio: BAY_GIO }).ok,
        true,
    );
    assert.strictEqual(
        kiemMaGiamGia({ ma, giaGoc: 100000, courseId: 'khoa_c', bayGio: BAY_GIO }).lyDo,
        LY_DO.KHONG_AP_DUNG_KHOA,
    );
});

test('apDungKhoa dang da populate van so sanh dung', () => {
    // Controller co the truyen ban tho (ObjectId) hoac ban da populate.
    const ma = maMau({ apDungKhoa: [{ _id: 'khoa_a', title: 'Khoa A' }] });

    assert.strictEqual(
        kiemMaGiamGia({ ma, giaGoc: 100000, courseId: 'khoa_a', bayGio: BAY_GIO }).ok,
        true,
    );
});

test('moi nhanh tu choi deu co cau tieng Viet doc duoc', () => {
    // Giao dien hien thang `cau` nay. Thieu mot cau la nguoi dung thay chuoi
    // rong hoac "undefined" o cho bao loi.
    const cacMa = [
        maMau({ hoatDong: false }),
        maMau({ ketThuc: new Date(BAY_GIO - NGAY) }),
        maMau({ soLuotToiDa: 1, daDung: 1 }),
        maMau({ donToiThieu: 999999999 }),
    ];

    for (const m of cacMa) {
        const kq = kiemMaGiamGia({ ma: m, giaGoc: 100000, bayGio: BAY_GIO });
        assert.strictEqual(kq.ok, false);
        assert.ok(kq.cau.length > 0, `lyDo ${kq.lyDo} phai co cau giai thich`);
    }
});

test('bayGio nhan ca Date lan so mili giay', () => {
    const ma = maMau();
    assert.strictEqual(kiemMaGiamGia({ ma, giaGoc: 1000, bayGio: BAY_GIO }).ok, true);
    assert.strictEqual(
        kiemMaGiamGia({ ma, giaGoc: 1000, bayGio: new Date(BAY_GIO) }).ok,
        true,
    );
});

/* ===== chuanMa ===== */

test('chuanMa dua ve chu hoa va bo khoang trang', () => {
    assert.strictEqual(chuanMa('  giam10  '), 'GIAM10');
    assert.strictEqual(chuanMa('Giam10'), 'GIAM10');
});

test('chuanMa chan do dai va gia tri khong phai chuoi', () => {
    assert.strictEqual(chuanMa('A'.repeat(100)).length, 32);
    assert.strictEqual(chuanMa(null), '');
    assert.strictEqual(chuanMa(123), '');
});
