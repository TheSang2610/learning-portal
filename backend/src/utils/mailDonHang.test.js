const test = require('node:test');
const assert = require('node:assert');

const { soanMailBaoChuyenKhoan, thoat } = require('./mailDonHang');

const MAU = {
    maDon: 'DH2KKH',
    soTien: 799000,
    tenHocVien: 'Nguyen Van A',
    emailHocVien: 'a@example.com',
    tenKhoa: 'Lập trình Web với React & Node.js',
    baoLuc: new Date('2026-09-06T09:30:00Z'),
    daQuaHan: false,
    duongDanQuanTri: 'https://vi-du.com/admin/orders'
};

// --------------------------------------------------------------------------
// Thoat HTML - day la cho chan ma doc
// --------------------------------------------------------------------------

test('thoat doi cac ky tu mo the HTML', () => {
    assert.strictEqual(thoat('<b>'), '&lt;b&gt;');
    assert.strictEqual(thoat('a & b'), 'a &amp; b');
    assert.strictEqual(thoat(`"nhay" 'don'`), '&quot;nhay&quot; &#39;don&#39;');
});

test('thoat chiu duoc null va undefined', () => {
    assert.strictEqual(thoat(null), '');
    assert.strictEqual(thoat(undefined), '');
});

test('ten hoc vien co the HTML KHONG lot vao mail', () => {
    // Ten la chuoi nguoi dung tu dat. De nguyen thi the img nay chay ngay
    // trong hop thu cua quan tri.
    const { chuHtml } = soanMailBaoChuyenKhoan({
        ...MAU,
        tenHocVien: '<img src=x onerror=alert(1)>'
    });

    // Dieu can bao dam la KHONG con the that nao mo ra. Chuoi "onerror=" van
    // con trong mail, nhung la CHU trong mot doan van - trinh doc mail hien no
    // ra man hinh chu khong coi la thuoc tinh, vi cai < da thanh &lt;.
    assert.ok(!chuHtml.includes('<img'), 'the img phai bi thoat');
    assert.ok(chuHtml.includes('&lt;img'), 'phai con lai dang da thoat');
});

test('khong con the la nao ngoai cac the co dinh cua mau mail', () => {
    const { chuHtml } = soanMailBaoChuyenKhoan({
        ...MAU,
        tenHocVien: '<script>x</script>',
        emailHocVien: '"><b>hack</b>',
        tenKhoa: '<iframe src=//xau.com>'
    });

    for (const the of ['<script', '<iframe', '<b>']) {
        assert.ok(!chuHtml.includes(the), `khong duoc con ${the}`);
    }
});

test('ten khoa co ky tu & khong lam vo HTML', () => {
    const { chuHtml } = soanMailBaoChuyenKhoan(MAU);
    assert.ok(chuHtml.includes('React &amp; Node.js'));
    assert.ok(!/React & Node/.test(chuHtml));
});

// --------------------------------------------------------------------------
// Noi dung mail
// --------------------------------------------------------------------------

test('tieu de mang ma don, so tien va ten - de tim trong hop thu', () => {
    const { tieuDe } = soanMailBaoChuyenKhoan(MAU);
    assert.ok(tieuDe.includes('DH2KKH'));
    assert.ok(tieuDe.includes('799.000đ'));
    assert.ok(tieuDe.includes('Nguyen Van A'));
});

test('ban chu thuong co du thu de doi chieu sao ke', () => {
    const { chuThuong } = soanMailBaoChuyenKhoan(MAU);
    assert.ok(chuThuong.includes('DH2KKH'));
    assert.ok(chuThuong.includes('799.000đ'));
    assert.ok(chuThuong.includes('a@example.com'));
    assert.ok(chuThuong.includes('Lập trình Web'));
});

test('don CHUA qua han thi khong co canh bao het han', () => {
    const { chuThuong, chuHtml } = soanMailBaoChuyenKhoan({ ...MAU, daQuaHan: false });
    assert.ok(!chuThuong.includes('quá hạn'));
    assert.ok(!chuHtml.includes('quá hạn'));
});

test('don DA qua han thi noi ro van xac nhan duoc', () => {
    const { chuThuong } = soanMailBaoChuyenKhoan({ ...MAU, daQuaHan: true });
    assert.ok(chuThuong.includes('quá hạn'));
    // Phai noi ro la VAN xac nhan duoc, khong thi quan tri tuong phai tu choi
    // trong khi tien da ve tai khoan.
    assert.ok(chuThuong.includes('vẫn xác nhận được'));
});

test('thieu duong dan quan tri thi bo qua, khong ra the a rong', () => {
    const { chuHtml } = soanMailBaoChuyenKhoan({ ...MAU, duongDanQuanTri: undefined });
    assert.ok(!chuHtml.includes('<a href'));
});

test('moc thoi gian hong khong lam vo mail', () => {
    const { chuThuong } = soanMailBaoChuyenKhoan({ ...MAU, baoLuc: 'rac' });
    assert.ok(chuThuong.includes('không rõ'));
});

test('so tien 0 hoac thieu van ra chuoi hop le', () => {
    assert.ok(soanMailBaoChuyenKhoan({ ...MAU, soTien: undefined }).tieuDe.includes('0đ'));
});

// --------------------------------------------------------------------------
// Mail bao da xac nhan xong
// --------------------------------------------------------------------------

const { soanMailDonDaXacNhan } = require('./mailDonHang');

const MAU_XN = {
    maDon: 'DH2KKH',
    soTien: 799000,
    tenHocVien: 'Nguyen Van A',
    emailHocVien: 'a@example.com',
    tenKhoa: 'Lập trình Web với React & Node.js',
    xacNhanLuc: new Date('2026-09-06T10:00:00Z'),
    nguoiXacNhan: 'sang',
    daCoKhoaTuTruoc: false
};

test('mail xac nhan ghi ro AI da bam - de truy khi hai quan tri cung xac nhan', () => {
    const { chuThuong } = soanMailDonDaXacNhan(MAU_XN);
    assert.ok(chuThuong.includes('bởi sang'));
    assert.ok(chuThuong.includes('DH2KKH'));
    assert.ok(chuThuong.includes('799.000đ'));
});

test('khong co nguoi xac nhan thi khong ra chuoi "bởi" cut lung', () => {
    const { chuThuong } = soanMailDonDaXacNhan({ ...MAU_XN, nguoiXacNhan: '' });
    assert.ok(!chuThuong.includes('bởi'));
});

test('hoc vien VON DA co khoa thi phai canh bao thu trung tien', () => {
    const { chuThuong } = soanMailDonDaXacNhan({ ...MAU_XN, daCoKhoaTuTruoc: true });
    assert.ok(chuThuong.includes('vốn đã có khoá học này'));
    assert.ok(chuThuong.includes('thu trùng tiền'));
});

test('binh thuong thi KHONG co canh bao thu trung', () => {
    const { chuThuong } = soanMailDonDaXacNhan(MAU_XN);
    assert.ok(!chuThuong.includes('thu trùng tiền'));
});

test('mail xac nhan cung thoat HTML trong ten hoc vien', () => {
    const { chuHtml } = soanMailDonDaXacNhan({
        ...MAU_XN,
        tenHocVien: '<script>x</script>',
        nguoiXacNhan: '<b>ai do</b>'
    });
    assert.ok(!chuHtml.includes('<script'));
    assert.ok(!chuHtml.includes('<b>ai do'));
});
