const test = require('node:test');
const assert = require('node:assert');
const { mainSchoolName, mainNameKey, logoHopLe: isValidLogo } = require('./universityName');

test('tenChinhTruong bo tien to loai truong', () => {
    assert.strictEqual(mainSchoolName('Trường Đại học Tôn Đức Thắng'), 'Tôn Đức Thắng');
    assert.strictEqual(mainSchoolName('Đại học Kinh tế Quốc dân'), 'Kinh tế Quốc dân');
    assert.strictEqual(mainSchoolName('Học viện Ngân hàng'), 'Ngân hàng');
    assert.strictEqual(mainSchoolName('Trường Cao đẳng Thực hành FPT'), 'Thực hành FPT');
    assert.strictEqual(mainSchoolName('Trường Đại Học Duy Tân'), 'Duy Tân');
});

test('tenChinhTruong giu nguyen ten khong co tien to', () => {
    assert.strictEqual(mainSchoolName('International University - VNU-HCM'), 'International University - VNU-HCM');
});

test('khoaTenChinh: hai cach viet cua cung mot truong ra cung khoa', () => {
    assert.strictEqual(mainNameKey('Đại học Tôn Đức Thắng'), mainNameKey('Trường Đại học Tôn Đức Thắng'));
    assert.strictEqual(
        mainNameKey('Trường Đại học Bách khoa – Đại học Quốc gia Thành phố Hồ Chí Minh'),
        mainNameKey('Trường Đại học Bách khoa - Đại học Quốc gia Thành phố Hồ Chí Minh'),
    );
    assert.notStrictEqual(mainNameKey('Trường Đại học Luật Hà Nội'), mainNameKey('Trường Đại học Luật Thành phố Hồ Chí Minh'));
});

test('logoHopLe', () => {
    assert.ok(isValidLogo(''));
    assert.ok(isValidLogo('/images/institution/ptit.png'));
    assert.ok(isValidLogo('https://cdn.example.com/logo.svg'));
    assert.ok(!isValidLogo('javascript:alert(1)'));
    assert.ok(!isValidLogo('data:image/svg+xml,<svg onload=x>'));
    assert.ok(!isValidLogo('http://khong-https.com/a.png'));
    assert.ok(!isValidLogo('/images/institution/../../secret.png'));
    assert.ok(!isValidLogo('https://x.com/a.png" onerror="x'));
});
