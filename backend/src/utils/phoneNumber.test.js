const test = require('node:test');
const assert = require('node:assert');

const {
    normalizePhone,
    isValidPhone,
    maskPhone,
} = require('./phoneNumber');

test('bon cach go cung mot so deu ve mot dang', () => {
    // Day la LY DO file nay ton tai. Khong gom ve mot dang thi day la bon ban
    // ghi khac nhau trong CSDL, va nguoi dang ky bang cach nay se khong dang
    // nhap duoc bang cach kia.
    const format = [
        '0901234567',
        '+84901234567',
        '84901234567',
        '090.123.4567',
        '090 123 4567',
        '090-123-4567',
        '(090) 123 4567',
        '  0901234567  ',
    ];

    for (const d of format) {
        assert.strictEqual(normalizePhone(d), '0901234567', `hong o: ${d}`);
    }
});

test('go thieu so 0 o dau van doc duoc', () => {
    // Hay gap khi chep tu bang tinh: cot so bi hieu la so hoc, so 0 dau bay mat.
    assert.strictEqual(normalizePhone('901234567'), '0901234567');
});

test('so bat dau 084 khong bi nham la ma vung 84', () => {
    // '0845123456' bo so 0 thi con '845123456' - cung bat dau bang '84'.
    // Phan biet duoc la nho DO DAI, khong phai nho tien to.
    assert.strictEqual(normalizePhone('0845123456'), '0845123456');
    assert.strictEqual(normalizePhone('84845123456'), '0845123456');
});

test('nhan du nam dau so di dong', () => {
    for (const head of ['3', '5', '7', '8', '9']) {
        const count = `0${head}01234567`.slice(0, 10);
        assert.ok(isValidPhone(count), `dau so ${head} phai duoc nhan`);
    }
});

test('so may ban bi tu choi', () => {
    // Truong nay de nhan OTP; tong dai co dinh khong nhan duoc tin nhan.
    assert.strictEqual(normalizePhone('02438251234'), '');
    assert.strictEqual(normalizePhone('0241234567'), '');
    assert.strictEqual(normalizePhone('0281234567'), '');
});

test('sai do dai bi tu choi', () => {
    assert.strictEqual(normalizePhone('090123456'), '', 'thieu mot chu so');
    assert.strictEqual(normalizePhone('09012345678'), '', 'thua mot chu so');
    assert.strictEqual(normalizePhone('0'), '');
    assert.strictEqual(normalizePhone(''), '');
});

test('chuoi khong phai so bi tu choi, khong nem', () => {
    assert.strictEqual(normalizePhone('khong phai so'), '');
    assert.strictEqual(normalizePhone('....'), '');
    assert.strictEqual(normalizePhone('+++'), '');
});

test('kieu du lieu sai tra ve rong chu khong bien thanh chuoi', () => {
    // Quan trong: than request {"phone":{"$ne":null}} khong duoc bien thanh
    // '[object Object]' roi di tiep. Cung ly do voi normalizeEmail.
    for (const v of [null, undefined, 0, 901234567, {}, [], { $ne: null }, true]) {
        assert.strictEqual(normalizePhone(v), '', `hong o kieu: ${typeof v}`);
        assert.strictEqual(isValidPhone(v), false);
    }
});

test('mang chua so hop le van bi tu choi', () => {
    // ['0901234567'] co String() ra dung chuoi hop le - day la cai bay.
    assert.strictEqual(normalizePhone(['0901234567']), '');
});

test('che so giu dau va duoi de nguoi dung nhan ra so cua minh', () => {
    assert.strictEqual(maskPhone('0901234567'), '090****567');
    assert.strictEqual(maskPhone('+84901234567'), '090****567');
});

test('che so khong hop le tra ve rong', () => {
    assert.strictEqual(maskPhone('abc'), '');
    assert.strictEqual(maskPhone(null), '');
});

test('chuan hoa hai lan cho ket qua nhu mot lan', () => {
    // Ham phai on dinh: dang chuan dua vao lai phai ra chinh no. Khong the
    // thi moi lan luu lai ban ghi cu la mot lan gia tri bi bien doi.
    const one = normalizePhone('+84 901 234 567');
    assert.strictEqual(normalizePhone(one), one);
});
