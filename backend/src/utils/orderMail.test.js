const test = require('node:test');
const assert = require('node:assert');

const { composeTransferReportMail, thoat } = require('./orderMail');

const MAU = {
    orderCode: 'DH2KKH',
    soTien: 799000,
    studentName: 'Nguyen Van A',
    studentEmail: 'a@example.com',
    tenKhoa: 'Lập trình Web với React & Node.js',
    reportedAt: new Date('2026-09-06T09:30:00Z'),
    daQuaHan: false,
    adminUrl: 'https://vi-du.com/admin/orders'
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
    const { htmlBody } = composeTransferReportMail({
        ...MAU,
        studentName: '<img src=x onerror=alert(1)>'
    });

    // Dieu can bao dam la KHONG con the that nao mo ra. Chuoi "onerror=" van
    // con trong mail, nhung la CHU trong mot doan van - trinh doc mail hien no
    // ra man hinh chu khong coi la thuoc tinh, vi cai < da thanh &lt;.
    assert.ok(!htmlBody.includes('<img'), 'the img phai bi thoat');
    assert.ok(htmlBody.includes('&lt;img'), 'phai con lai dang da thoat');
});

test('khong con the la nao ngoai cac the co dinh cua mau mail', () => {
    const { htmlBody } = composeTransferReportMail({
        ...MAU,
        studentName: '<script>x</script>',
        studentEmail: '"><b>hack</b>',
        tenKhoa: '<iframe src=//xau.com>'
    });

    for (const card of ['<script', '<iframe', '<b>']) {
        assert.ok(!htmlBody.includes(card), `khong duoc con ${card}`);
    }
});

test('ten khoa co ky tu & khong lam vo HTML', () => {
    const { htmlBody } = composeTransferReportMail(MAU);
    assert.ok(htmlBody.includes('React &amp; Node.js'));
    assert.ok(!/React & Node/.test(htmlBody));
});

// --------------------------------------------------------------------------
// Noi dung mail
// --------------------------------------------------------------------------

test('tieu de mang ma don, so tien va ten - de tim trong hop thu', () => {
    const { tieuDe: title } = composeTransferReportMail(MAU);
    assert.ok(title.includes('DH2KKH'));
    assert.ok(title.includes('799.000đ'));
    assert.ok(title.includes('Nguyen Van A'));
});

test('ban chu thuong co du thu de doi chieu sao ke', () => {
    const { plainText } = composeTransferReportMail(MAU);
    assert.ok(plainText.includes('DH2KKH'));
    assert.ok(plainText.includes('799.000đ'));
    assert.ok(plainText.includes('a@example.com'));
    assert.ok(plainText.includes('Lập trình Web'));
});

test('don CHUA qua han thi khong co canh bao het han', () => {
    const { plainText, htmlBody } = composeTransferReportMail({ ...MAU, daQuaHan: false });
    assert.ok(!plainText.includes('quá hạn'));
    assert.ok(!htmlBody.includes('quá hạn'));
});

test('don DA qua han thi noi ro van xac nhan duoc', () => {
    const { plainText } = composeTransferReportMail({ ...MAU, daQuaHan: true });
    assert.ok(plainText.includes('quá hạn'));
    // Phai noi ro la VAN xac nhan duoc, khong thi quan tri tuong phai tu choi
    // trong khi tien da ve tai khoan.
    assert.ok(plainText.includes('vẫn xác nhận được'));
});

test('thieu duong dan quan tri thi bo qua, khong ra the a rong', () => {
    const { htmlBody } = composeTransferReportMail({ ...MAU, adminUrl: undefined });
    assert.ok(!htmlBody.includes('<a href'));
});

test('moc thoi gian hong khong lam vo mail', () => {
    const { plainText } = composeTransferReportMail({ ...MAU, reportedAt: 'rac' });
    assert.ok(plainText.includes('không rõ'));
});

test('so tien 0 hoac thieu van ra chuoi hop le', () => {
    assert.ok(composeTransferReportMail({ ...MAU, soTien: undefined }).tieuDe.includes('0đ'));
});

// --------------------------------------------------------------------------
// Mail bao da xac nhan xong
// --------------------------------------------------------------------------

const { composeOrderConfirmedMail } = require('./orderMail');

const MAU_XN = {
    orderCode: 'DH2KKH',
    soTien: 799000,
    studentName: 'Nguyen Van A',
    studentEmail: 'a@example.com',
    tenKhoa: 'Lập trình Web với React & Node.js',
    confirmedAt: new Date('2026-09-06T10:00:00Z'),
    confirmedByName: 'sang',
    alreadyOwned: false
};

test('mail xac nhan ghi ro AI da bam - de truy khi hai quan tri cung xac nhan', () => {
    const { plainText } = composeOrderConfirmedMail(MAU_XN);
    assert.ok(plainText.includes('bởi sang'));
    assert.ok(plainText.includes('DH2KKH'));
    assert.ok(plainText.includes('799.000đ'));
});

test('khong co nguoi xac nhan thi khong ra chuoi "bởi" cut lung', () => {
    const { plainText } = composeOrderConfirmedMail({ ...MAU_XN, confirmedByName: '' });
    assert.ok(!plainText.includes('bởi'));
});

test('hoc vien VON DA co khoa thi phai canh bao thu trung tien', () => {
    const { plainText } = composeOrderConfirmedMail({ ...MAU_XN, alreadyOwned: true });
    assert.ok(plainText.includes('vốn đã có khoá học này'));
    assert.ok(plainText.includes('thu trùng tiền'));
});

test('binh thuong thi KHONG co canh bao thu trung', () => {
    const { plainText } = composeOrderConfirmedMail(MAU_XN);
    assert.ok(!plainText.includes('thu trùng tiền'));
});

test('mail xac nhan cung thoat HTML trong ten hoc vien', () => {
    const { htmlBody } = composeOrderConfirmedMail({
        ...MAU_XN,
        studentName: '<script>x</script>',
        confirmedByName: '<b>ai do</b>'
    });
    assert.ok(!htmlBody.includes('<script'));
    assert.ok(!htmlBody.includes('<b>ai do'));
});
