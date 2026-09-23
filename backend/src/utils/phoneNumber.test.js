const test = require('node:test');
const assert = require('node:assert');

const {
    chuanHoaSoDienThoai,
    soDienThoaiHopLe,
    cheSoDienThoai,
} = require('./phoneNumber');

test('bon cach go cung mot so deu ve mot dang', () => {
    // Day la LY DO file nay ton tai. Khong gom ve mot dang thi day la bon ban
    // ghi khac nhau trong CSDL, va nguoi dang ky bang cach nay se khong dang
    // nhap duoc bang cach kia.
    const dang = [
        '0901234567',
        '+84901234567',
        '84901234567',
        '090.123.4567',
        '090 123 4567',
        '090-123-4567',
        '(090) 123 4567',
        '  0901234567  ',
    ];

    for (const d of dang) {
        assert.strictEqual(chuanHoaSoDienThoai(d), '0901234567', `hong o: ${d}`);
    }
});

test('go thieu so 0 o dau van doc duoc', () => {
    // Hay gap khi chep tu bang tinh: cot so bi hieu la so hoc, so 0 dau bay mat.
    assert.strictEqual(chuanHoaSoDienThoai('901234567'), '0901234567');
});

test('so bat dau 084 khong bi nham la ma vung 84', () => {
    // '0845123456' bo so 0 thi con '845123456' - cung bat dau bang '84'.
    // Phan biet duoc la nho DO DAI, khong phai nho tien to.
    assert.strictEqual(chuanHoaSoDienThoai('0845123456'), '0845123456');
    assert.strictEqual(chuanHoaSoDienThoai('84845123456'), '0845123456');
});

test('nhan du nam dau so di dong', () => {
    for (const dau of ['3', '5', '7', '8', '9']) {
        const so = `0${dau}01234567`.slice(0, 10);
        assert.ok(soDienThoaiHopLe(so), `dau so ${dau} phai duoc nhan`);
    }
});

test('so may ban bi tu choi', () => {
    // Truong nay de nhan OTP; tong dai co dinh khong nhan duoc tin nhan.
    assert.strictEqual(chuanHoaSoDienThoai('02438251234'), '');
    assert.strictEqual(chuanHoaSoDienThoai('0241234567'), '');
    assert.strictEqual(chuanHoaSoDienThoai('0281234567'), '');
});

test('sai do dai bi tu choi', () => {
    assert.strictEqual(chuanHoaSoDienThoai('090123456'), '', 'thieu mot chu so');
    assert.strictEqual(chuanHoaSoDienThoai('09012345678'), '', 'thua mot chu so');
    assert.strictEqual(chuanHoaSoDienThoai('0'), '');
    assert.strictEqual(chuanHoaSoDienThoai(''), '');
});

test('chuoi khong phai so bi tu choi, khong nem', () => {
    assert.strictEqual(chuanHoaSoDienThoai('khong phai so'), '');
    assert.strictEqual(chuanHoaSoDienThoai('....'), '');
    assert.strictEqual(chuanHoaSoDienThoai('+++'), '');
});

test('kieu du lieu sai tra ve rong chu khong bien thanh chuoi', () => {
    // Quan trong: than request {"phone":{"$ne":null}} khong duoc bien thanh
    // '[object Object]' roi di tiep. Cung ly do voi chuanHoaEmail.
    for (const v of [null, undefined, 0, 901234567, {}, [], { $ne: null }, true]) {
        assert.strictEqual(chuanHoaSoDienThoai(v), '', `hong o kieu: ${typeof v}`);
        assert.strictEqual(soDienThoaiHopLe(v), false);
    }
});

test('mang chua so hop le van bi tu choi', () => {
    // ['0901234567'] co String() ra dung chuoi hop le - day la cai bay.
    assert.strictEqual(chuanHoaSoDienThoai(['0901234567']), '');
});

test('che so giu dau va duoi de nguoi dung nhan ra so cua minh', () => {
    assert.strictEqual(cheSoDienThoai('0901234567'), '090****567');
    assert.strictEqual(cheSoDienThoai('+84901234567'), '090****567');
});

test('che so khong hop le tra ve rong', () => {
    assert.strictEqual(cheSoDienThoai('abc'), '');
    assert.strictEqual(cheSoDienThoai(null), '');
});

test('chuan hoa hai lan cho ket qua nhu mot lan', () => {
    // Ham phai on dinh: dang chuan dua vao lai phai ra chinh no. Khong the
    // thi moi lan luu lai ban ghi cu la mot lan gia tri bi bien doi.
    const mot = chuanHoaSoDienThoai('+84 901 234 567');
    assert.strictEqual(chuanHoaSoDienThoai(mot), mot);
});
