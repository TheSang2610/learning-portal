const test = require('node:test');
const assert = require('node:assert');

const {
    composeResetCodeMail,
    composeTooManyFailsMail,
    composePasswordChangedMail,
} = require('./passwordResetMail');

test('ma nam trong ca hai ban chu', () => {
    const { htmlBody, plainText } = composeResetCodeMail({
        ten: 'Nguyễn Thế Sang',
        ma: '482913',
    });
    assert.match(htmlBody, /482913/);
    assert.match(plainText, /482913/);
});

test('ma KHONG duoc nam tren tieu de', () => {
    // Tieu de hien ra o man hinh khoa dien thoai va o danh sach hom thu: de ma
    // o do la ai cam may len cung doc duoc ma khong can mo khoa may.
    const { tieuDe: title } = composeResetCodeMail({ ten: 'Sang', ma: '482913' });
    assert.ok(!title.includes('482913'), 'ma bi lo tren tieu de');
});

test('ten hoc vien duoc thoat truoc khi nhet vao HTML', () => {
    // Ten la chuoi NGUOI DUNG TU DAT. Khong thoat thi the img nay chay ngay
    // trong hop thu cua chinh nan nhan.
    const { htmlBody } = composeResetCodeMail({
        ten: '<img src=x onerror=alert(1)>',
        ma: '482913',
    });
    assert.ok(!htmlBody.includes('<img src=x'), 'the img tho lot vao HTML');
    assert.match(htmlBody, /&lt;img src=x/);
});

test('ma cung duoc thoat', () => {
    // Ma do may chu sinh ra nen luon la 6 chu so, nhung ham soan khong duoc
    // phep dua vao dieu do: no la ham dung chung, nguoi goi sau nay co the
    // truyen thu khac vao.
    const { htmlBody } = composeResetCodeMail({ ten: 'Sang', ma: '<b>x</b>' });
    assert.ok(!htmlBody.includes('<b>x</b>'));
});

test('so phut hien dung con so truyen vao', () => {
    const a = composeResetCodeMail({ ten: 'Sang', ma: '482913', minutes: 10 });
    assert.match(a.plainText, /10 phút/);
    assert.match(a.htmlBody, /10 phút/);

    const b = composeResetCodeMail({ ten: 'Sang', ma: '482913', minutes: 30 });
    assert.match(b.plainText, /30 phút/);
});

test('thu mang ma co nhac dung gui ma cho nguoi khac', () => {
    // Lua qua dien thoai ("nhan vien ho tro" goi dien xin ma) la cach chiem
    // tai khoan pho bien nhat o luong nay. Cau nhac phai co trong CA HAI ban:
    // nhieu nguoi doc mail o che do chi hien chu thuong.
    const { htmlBody, plainText } = composeResetCodeMail({ ten: 'Sang', ma: '482913' });
    for (const record of [htmlBody, plainText]) {
        assert.match(record, /Đừng gửi mã này cho bất kỳ ai/);
    }
});

test('thu bao sai qua nhieu KHONG noi con bao lau nua thi mo lai', () => {
    // Day la yeu cau cua chu du an va la ca ly do luong nay im lang ve thoi
    // gian khoa. Lo mot con so o day la pha dung cai dinh giu kin. Xem hai
    // nguyen tac o dau controllers/passwordResetController.js.
    const { htmlBody, plainText, tieuDe: title } = composeTooManyFailsMail({ ten: 'Sang' });

    for (const record of [title, htmlBody, plainText]) {
        assert.ok(!/\d+\s*(phút|giờ|tiếng|ngày)/.test(record), `lo thoi gian khoa: ${record}`);
        assert.ok(!record.includes('60'), 'lo con so 60');
    }
});

test('thu bao sai qua nhieu cung khong noi da sai may lan', () => {
    // So lan sai toi da la mot con so cua he thong. Noi ra la chi cho ke do
    // biet chinh xac con bao nhieu lan thu nua thi bi chan.
    const { htmlBody, plainText } = composeTooManyFailsMail({ ten: 'Sang' });
    for (const record of [htmlBody, plainText]) {
        assert.ok(!record.includes('3 lần'), 'lo so lan sai toi da');
    }
});

test('thu bao sai qua nhieu van tran an la mat khau khong doi', () => {
    // Nguoi nhan thu nay thuong la nguoi KHONG lam gi ca - ho can biet ngay
    // la tai khoan cua ho van an toan, khong phai doc het thu moi yen tam.
    const { htmlBody, plainText } = composeTooManyFailsMail({ ten: 'Sang' });
    for (const record of [htmlBody, plainText]) {
        assert.match(record, /không hề thay đổi/);
    }
});

test('ten trong thu bao sai qua nhieu cung duoc thoat', () => {
    const { htmlBody } = composeTooManyFailsMail({ ten: '<script>x</script>' });
    assert.ok(!htmlBody.includes('<script>'));
});

test('ca hai la thu deu co tieu de khong rong', () => {
    assert.ok(composeResetCodeMail({ ten: 'Sang', ma: '482913' }).tieuDe.length > 0);
    assert.ok(composeTooManyFailsMail({ ten: 'Sang' }).tieuDe.length > 0);
});

/* ------------------ thu bao mat khau vua bi doi ------------------------- */

test('thu bao doi mat khau noi ro thoi diem', () => {
    const { htmlBody, plainText } = composePasswordChangedMail({
        ten: 'Sang',
        at: new Date('2026-09-17T03:00:00Z'),
    });
    // Nguoi doc phai doi chieu duoc voi "luc do minh dang lam gi".
    for (const record of [htmlBody, plainText]) {
        assert.match(record, /2026/);
    }
});

test('thu bao doi mat khau chi duong phai lam gi khi KHONG phai minh doi', () => {
    // Bao suong "mat khau da doi" thi nan nhan doc xong khong biet lam gi.
    // Phai noi ro: doi mat khau HOM THU truoc, roi moi gianh lai tai khoan -
    // vi ke kia dang giu quyen vao chinh hom thu do.
    const { htmlBody, plainText } = composePasswordChangedMail({ ten: 'Sang', at: new Date() });
    for (const record of [htmlBody, plainText]) {
        assert.match(record, /KHÔNG phải bạn/);
        assert.match(record, /hộp thư/);
    }
});

test('thu bao doi mat khau: moc thoi gian hong thi ghi "khong ro"', () => {
    const { plainText } = composePasswordChangedMail({ ten: 'Sang', at: new Date('hong') });
    assert.match(plainText, /không rõ/);
    assert.ok(!plainText.includes('Invalid Date'));
});

test('ten trong thu bao doi mat khau duoc thoat', () => {
    const { htmlBody } = composePasswordChangedMail({
        ten: '<img src=x onerror=alert(1)>',
        at: new Date(),
    });
    assert.ok(!htmlBody.includes('<img src=x'));
});
