const test = require('node:test');
const assert = require('node:assert');

// Dat bien moi truong TRUOC khi nap module: thanhToan.js doc process.env luc
// nap, khong doc lai o moi lan goi.
process.env.NGAN_HANG = 'MB';
process.env.SO_TAI_KHOAN = '0123456789';
process.env.TEN_TAI_KHOAN = 'NGUYEN VAN A';

const { daCauHinh, anhQR, thongTinChuyenKhoan } = require('./thanhToan');

test('daCauHinh: du ba bien thi coi la da cau hinh', () => {
    assert.strictEqual(daCauHinh(), true);
});

test('anhQR: dung ma ngan hang va so tai khoan trong duong dan', () => {
    const url = anhQR({ soTien: 499000, noiDung: 'DHAB12' });
    assert.ok(url.startsWith('https://img.vietqr.io/image/MB-0123456789-'), url);
});

test('anhQR: so tien va noi dung nam trong tham so', () => {
    const url = new URL(anhQR({ soTien: 499000, noiDung: 'DHAB12' }));
    assert.strictEqual(url.searchParams.get('amount'), '499000');
    assert.strictEqual(url.searchParams.get('addInfo'), 'DHAB12');
    assert.strictEqual(url.searchParams.get('accountName'), 'NGUYEN VAN A');
});

// Ten chu tai khoan co dau cach, ma don thi khong, nhung ca hai deu phai duoc
// ma hoa dung. Ghep chuoi bang tay thay vi URLSearchParams la cho de sinh loi
// nay nhat: mot dau cach chua ma hoa lam hong ca duong dan anh.
test('anhQR: ky tu dac biet duoc ma hoa dung', () => {
    const url = anhQR({ soTien: 1000, noiDung: 'DH A&B' });
    assert.ok(!url.includes('DH A&B'), 'noi dung tho khong duoc xuat hien nguyen ven');
    assert.strictEqual(new URL(url).searchParams.get('addInfo'), 'DH A&B');
});

test('anhQR: so tien duoc lam tron ve so nguyen', () => {
    const url = new URL(anhQR({ soTien: 499000.7, noiDung: 'DHAB12' }));
    assert.strictEqual(url.searchParams.get('amount'), '499001');
});

test('anhQR: so tien khong hop le thanh 0 chu khong phai NaN', () => {
    const url = new URL(anhQR({ soTien: undefined, noiDung: 'DHAB12' }));
    assert.strictEqual(url.searchParams.get('amount'), '0');
});

test('thongTinChuyenKhoan: tra du cac truong giao dien can', () => {
    const tt = thongTinChuyenKhoan({ soTien: 699000, noiDung: 'DHXY99' });
    assert.strictEqual(tt.nganHang, 'MB');
    assert.strictEqual(tt.soTaiKhoan, '0123456789');
    assert.strictEqual(tt.tenTaiKhoan, 'NGUYEN VAN A');
    assert.strictEqual(tt.soTien, 699000);
    assert.strictEqual(tt.noiDung, 'DHXY99');
    assert.strictEqual(tt.daCauHinh, true);
    assert.ok(tt.anhQR);
});
