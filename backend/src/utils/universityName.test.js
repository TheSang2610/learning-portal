const test = require('node:test');
const assert = require('node:assert');
const { tenChinhTruong, khoaTenChinh, logoHopLe } = require('./universityName');

test('tenChinhTruong bo tien to loai truong', () => {
    assert.strictEqual(tenChinhTruong('Trường Đại học Tôn Đức Thắng'), 'Tôn Đức Thắng');
    assert.strictEqual(tenChinhTruong('Đại học Kinh tế Quốc dân'), 'Kinh tế Quốc dân');
    assert.strictEqual(tenChinhTruong('Học viện Ngân hàng'), 'Ngân hàng');
    assert.strictEqual(tenChinhTruong('Trường Cao đẳng Thực hành FPT'), 'Thực hành FPT');
    assert.strictEqual(tenChinhTruong('Trường Đại Học Duy Tân'), 'Duy Tân');
});

test('tenChinhTruong giu nguyen ten khong co tien to', () => {
    assert.strictEqual(tenChinhTruong('International University - VNU-HCM'), 'International University - VNU-HCM');
});

test('khoaTenChinh: hai cach viet cua cung mot truong ra cung khoa', () => {
    assert.strictEqual(khoaTenChinh('Đại học Tôn Đức Thắng'), khoaTenChinh('Trường Đại học Tôn Đức Thắng'));
    assert.strictEqual(
        khoaTenChinh('Trường Đại học Bách khoa – Đại học Quốc gia Thành phố Hồ Chí Minh'),
        khoaTenChinh('Trường Đại học Bách khoa - Đại học Quốc gia Thành phố Hồ Chí Minh'),
    );
    assert.notStrictEqual(khoaTenChinh('Trường Đại học Luật Hà Nội'), khoaTenChinh('Trường Đại học Luật Thành phố Hồ Chí Minh'));
});

test('logoHopLe', () => {
    assert.ok(logoHopLe(''));
    assert.ok(logoHopLe('/images/institution/ptit.png'));
    assert.ok(logoHopLe('https://cdn.example.com/logo.svg'));
    assert.ok(!logoHopLe('javascript:alert(1)'));
    assert.ok(!logoHopLe('data:image/svg+xml,<svg onload=x>'));
    assert.ok(!logoHopLe('http://khong-https.com/a.png'));
    assert.ok(!logoHopLe('/images/institution/../../secret.png'));
    assert.ok(!logoHopLe('https://x.com/a.png" onerror="x'));
});
