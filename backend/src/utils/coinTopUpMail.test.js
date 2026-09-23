const test = require('node:test');
const assert = require('node:assert');

const { soanMailBaoNapCoin } = require('./coinTopUpMail');

const tinMau = (them = {}) => ({
    maNap: 'NAP7K3M',
    soTien: 500000,
    soCoin: 500,
    tenHocVien: 'Nguyễn Thế Sang',
    emailHocVien: 'sang@example.com',
    baoLuc: new Date('2026-09-16T03:00:00Z'),
    daQuaHan: false,
    duongDanQuanTri: 'https://learning-portal-s.vercel.app/admin/coin-topups',
    ...them
});

test('tieu de mang ma nap, so tien va ten hoc vien', () => {
    // Quan tri tim trong hop thu bang chinh ma nap, nen no phai o tieu de.
    const { tieuDe } = soanMailBaoNapCoin(tinMau());
    assert.match(tieuDe, /NAP7K3M/);
    assert.match(tieuDe, /500\.000đ/);
    assert.match(tieuDe, /Nguyễn Thế Sang/);
});

test('ca hai ban chu deu co ma nap, so tien va so coin', () => {
    const { chuHtml, chuThuong } = soanMailBaoNapCoin(tinMau());
    for (const ban of [chuHtml, chuThuong]) {
        assert.match(ban, /NAP7K3M/);
        assert.match(ban, /500\.000đ/);
        assert.match(ban, /500 coin/);
    }
});

test('ten hoc vien duoc thoat truoc khi nhet vao HTML', () => {
    // Ten la chuoi NGUOI DUNG TU DAT. Khong thoat thi the img nay chay ngay
    // trong hop thu cua quan tri.
    const { chuHtml } = soanMailBaoNapCoin(
        tinMau({ tenHocVien: '<img src=x onerror=alert(1)>' })
    );
    assert.ok(!chuHtml.includes('<img src=x'), 'the img tho khong duoc lot vao HTML');
    assert.match(chuHtml, /&lt;img src=x/);
});

test('email hoc vien cung duoc thoat', () => {
    const { chuHtml } = soanMailBaoNapCoin(
        tinMau({ emailHocVien: '"><script>x</script>' })
    );
    assert.ok(!chuHtml.includes('<script>'), 'the script khong duoc lot vao HTML');
});

test('qua han thi co canh bao, chua qua han thi khong', () => {
    const qua = soanMailBaoNapCoin(tinMau({ daQuaHan: true }));
    assert.match(qua.chuThuong, /quá hạn/);
    assert.match(qua.chuHtml, /quá hạn/);

    const chua = soanMailBaoNapCoin(tinMau({ daQuaHan: false }));
    assert.ok(!chua.chuThuong.includes('quá hạn'));
    assert.ok(!chua.chuHtml.includes('quá hạn'));
});

test('co duong dan thi hien nut, khong co thi khong hien nut rong', () => {
    const co = soanMailBaoNapCoin(tinMau());
    assert.match(co.chuHtml, /<a href="https:\/\/learning-portal-s/);

    const khong = soanMailBaoNapCoin(tinMau({ duongDanQuanTri: '' }));
    assert.ok(!khong.chuHtml.includes('<a href'), 'khong duoc de lai the a rong');
});

test('moc thoi gian hong thi ghi "khong ro" chu khong lam hong mail', () => {
    // Mail bao chuyen khoan la thu quan trong; mot moc thoi gian hong khong
    // duoc phep lam ca cai mail khong gui duoc.
    const { chuThuong } = soanMailBaoNapCoin(tinMau({ baoLuc: new Date('khong phai ngay') }));
    assert.match(chuThuong, /không rõ/);
});

test('so tien va so coin thieu thi ve 0 chu khong ra NaN', () => {
    const { chuThuong } = soanMailBaoNapCoin(tinMau({ soTien: undefined, soCoin: null }));
    assert.ok(!chuThuong.includes('NaN'));
    assert.match(chuThuong, /0đ/);
    assert.match(chuThuong, /0 coin/);
});
