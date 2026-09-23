const test = require('node:test');
const assert = require('node:assert');

const {
    soanMailMaDatLai,
    soanMailSaiQuaNhieu,
    soanMailDaDoiMatKhau,
} = require('./passwordResetMail');

test('ma nam trong ca hai ban chu', () => {
    const { chuHtml, chuThuong } = soanMailMaDatLai({
        ten: 'Nguyễn Thế Sang',
        ma: '482913',
    });
    assert.match(chuHtml, /482913/);
    assert.match(chuThuong, /482913/);
});

test('ma KHONG duoc nam tren tieu de', () => {
    // Tieu de hien ra o man hinh khoa dien thoai va o danh sach hom thu: de ma
    // o do la ai cam may len cung doc duoc ma khong can mo khoa may.
    const { tieuDe } = soanMailMaDatLai({ ten: 'Sang', ma: '482913' });
    assert.ok(!tieuDe.includes('482913'), 'ma bi lo tren tieu de');
});

test('ten hoc vien duoc thoat truoc khi nhet vao HTML', () => {
    // Ten la chuoi NGUOI DUNG TU DAT. Khong thoat thi the img nay chay ngay
    // trong hop thu cua chinh nan nhan.
    const { chuHtml } = soanMailMaDatLai({
        ten: '<img src=x onerror=alert(1)>',
        ma: '482913',
    });
    assert.ok(!chuHtml.includes('<img src=x'), 'the img tho lot vao HTML');
    assert.match(chuHtml, /&lt;img src=x/);
});

test('ma cung duoc thoat', () => {
    // Ma do may chu sinh ra nen luon la 6 chu so, nhung ham soan khong duoc
    // phep dua vao dieu do: no la ham dung chung, nguoi goi sau nay co the
    // truyen thu khac vao.
    const { chuHtml } = soanMailMaDatLai({ ten: 'Sang', ma: '<b>x</b>' });
    assert.ok(!chuHtml.includes('<b>x</b>'));
});

test('so phut hien dung con so truyen vao', () => {
    const a = soanMailMaDatLai({ ten: 'Sang', ma: '482913', soPhut: 10 });
    assert.match(a.chuThuong, /10 phút/);
    assert.match(a.chuHtml, /10 phút/);

    const b = soanMailMaDatLai({ ten: 'Sang', ma: '482913', soPhut: 30 });
    assert.match(b.chuThuong, /30 phút/);
});

test('thu mang ma co nhac dung gui ma cho nguoi khac', () => {
    // Lua qua dien thoai ("nhan vien ho tro" goi dien xin ma) la cach chiem
    // tai khoan pho bien nhat o luong nay. Cau nhac phai co trong CA HAI ban:
    // nhieu nguoi doc mail o che do chi hien chu thuong.
    const { chuHtml, chuThuong } = soanMailMaDatLai({ ten: 'Sang', ma: '482913' });
    for (const ban of [chuHtml, chuThuong]) {
        assert.match(ban, /Đừng gửi mã này cho bất kỳ ai/);
    }
});

test('thu bao sai qua nhieu KHONG noi con bao lau nua thi mo lai', () => {
    // Day la yeu cau cua chu du an va la ca ly do luong nay im lang ve thoi
    // gian khoa. Lo mot con so o day la pha dung cai dinh giu kin. Xem hai
    // nguyen tac o dau controllers/passwordResetController.js.
    const { chuHtml, chuThuong, tieuDe } = soanMailSaiQuaNhieu({ ten: 'Sang' });

    for (const ban of [tieuDe, chuHtml, chuThuong]) {
        assert.ok(!/\d+\s*(phút|giờ|tiếng|ngày)/.test(ban), `lo thoi gian khoa: ${ban}`);
        assert.ok(!ban.includes('60'), 'lo con so 60');
    }
});

test('thu bao sai qua nhieu cung khong noi da sai may lan', () => {
    // So lan sai toi da la mot con so cua he thong. Noi ra la chi cho ke do
    // biet chinh xac con bao nhieu lan thu nua thi bi chan.
    const { chuHtml, chuThuong } = soanMailSaiQuaNhieu({ ten: 'Sang' });
    for (const ban of [chuHtml, chuThuong]) {
        assert.ok(!ban.includes('3 lần'), 'lo so lan sai toi da');
    }
});

test('thu bao sai qua nhieu van tran an la mat khau khong doi', () => {
    // Nguoi nhan thu nay thuong la nguoi KHONG lam gi ca - ho can biet ngay
    // la tai khoan cua ho van an toan, khong phai doc het thu moi yen tam.
    const { chuHtml, chuThuong } = soanMailSaiQuaNhieu({ ten: 'Sang' });
    for (const ban of [chuHtml, chuThuong]) {
        assert.match(ban, /không hề thay đổi/);
    }
});

test('ten trong thu bao sai qua nhieu cung duoc thoat', () => {
    const { chuHtml } = soanMailSaiQuaNhieu({ ten: '<script>x</script>' });
    assert.ok(!chuHtml.includes('<script>'));
});

test('ca hai la thu deu co tieu de khong rong', () => {
    assert.ok(soanMailMaDatLai({ ten: 'Sang', ma: '482913' }).tieuDe.length > 0);
    assert.ok(soanMailSaiQuaNhieu({ ten: 'Sang' }).tieuDe.length > 0);
});

/* ------------------ thu bao mat khau vua bi doi ------------------------- */

test('thu bao doi mat khau noi ro thoi diem', () => {
    const { chuHtml, chuThuong } = soanMailDaDoiMatKhau({
        ten: 'Sang',
        luc: new Date('2026-09-17T03:00:00Z'),
    });
    // Nguoi doc phai doi chieu duoc voi "luc do minh dang lam gi".
    for (const ban of [chuHtml, chuThuong]) {
        assert.match(ban, /2026/);
    }
});

test('thu bao doi mat khau chi duong phai lam gi khi KHONG phai minh doi', () => {
    // Bao suong "mat khau da doi" thi nan nhan doc xong khong biet lam gi.
    // Phai noi ro: doi mat khau HOM THU truoc, roi moi gianh lai tai khoan -
    // vi ke kia dang giu quyen vao chinh hom thu do.
    const { chuHtml, chuThuong } = soanMailDaDoiMatKhau({ ten: 'Sang', luc: new Date() });
    for (const ban of [chuHtml, chuThuong]) {
        assert.match(ban, /KHÔNG phải bạn/);
        assert.match(ban, /hộp thư/);
    }
});

test('thu bao doi mat khau: moc thoi gian hong thi ghi "khong ro"', () => {
    const { chuThuong } = soanMailDaDoiMatKhau({ ten: 'Sang', luc: new Date('hong') });
    assert.match(chuThuong, /không rõ/);
    assert.ok(!chuThuong.includes('Invalid Date'));
});

test('ten trong thu bao doi mat khau duoc thoat', () => {
    const { chuHtml } = soanMailDaDoiMatKhau({
        ten: '<img src=x onerror=alert(1)>',
        luc: new Date(),
    });
    assert.ok(!chuHtml.includes('<img src=x'));
});
