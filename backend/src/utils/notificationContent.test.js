// Chay:  npm test
//
// Chi test notificationContent.js - phan HAM THUAN. Viec ghi thong bao xuong CSDL
// nam o notificationController.js va khong test o day: CI khong co MONGO_URI, va
// mot test phu thuoc CSDL la mot test se do vi ly do khong lien quan gi toi ma
// nguon.

const test = require('node:test');
const assert = require('node:assert');

const {
    buildNotification,
    isInternalPath,
    truncate,
    VALID_TYPES,
    MAX_TITLE_LENGTH,
    MAX_CONTENT_LENGTH,
} = require('./notificationContent');

test('duongDanNoiBo chan moi dia chi ben ngoai', () => {
    // Day la rao chan quan trong nhat cua file: duong dan di thang vao the <a>.
    assert.strictEqual(isInternalPath('https://vi-du.com/bay'), '');
    assert.strictEqual(isInternalPath('http://vi-du.com'), '');

    // '//vi-du.com' trong bi hieu la duong dan noi bo nhung trinh duyet doc no
    // la dia chi ngoai theo giao thuc hien tai.
    assert.strictEqual(isInternalPath('//vi-du.com'), '');

    assert.strictEqual(isInternalPath('javascript:alert(1)'), '');
    assert.strictEqual(isInternalPath('/courses'), '/courses');
    assert.strictEqual(isInternalPath('  /user/profile  '), '/user/profile');
});

test('duongDanNoiBo bo duong dan qua dai thay vi cat cut', () => {
    // Cat mot duong dan la tao ra mot duong dan KHAC, tro toi cho khong ai
    // ngo. Tha khong co lien ket con hon co lien ket sai.
    const length = '/' + 'a'.repeat(600);
    assert.strictEqual(isInternalPath(length), '');
});

test('duongDanNoiBo khong vo khi nhan gia tri khong phai chuoi', () => {
    assert.strictEqual(isInternalPath(null), '');
    assert.strictEqual(isInternalPath(undefined), '');
    assert.strictEqual(isInternalPath(123), '');
    assert.strictEqual(isInternalPath({}), '');
});

test('catChu gom khoang trang va cat dung do dai', () => {
    assert.strictEqual(truncate('  hai   khoang  ', 100), 'hai khoang');
    assert.strictEqual(truncate('abcdef', 3), 'ab…');
    assert.strictEqual(truncate('abc', 3), 'abc');
    assert.strictEqual(truncate(null, 10), '');
});

test('dungThongBao tu choi loai khong co trong bang', () => {
    const outcome = buildNotification('loai_bia_ra');
    assert.strictEqual(outcome.ok, false);
    assert.match(outcome.loi, /khong hop le/);
});

test('moi loai trong LOAI_HOP_LE deu dung duoc, khong loai nao nem ngoai le', () => {
    // Bang enum trong model va bang noi dung o day phai khop nhau. Test nay bat
    // truong hop them loai vao model ma quen viet noi dung cho no.
    for (const loai of VALID_TYPES) {
        const outcome = buildNotification(loai, {});
        assert.strictEqual(outcome.ok, true, `loai ${loai} phai dung duoc voi du lieu rong`);
        assert.ok(outcome.thongBao.tieuDe.length > 0, `loai ${loai} phai co tieu de`);
        assert.strictEqual(outcome.thongBao.loai, loai);
    }
});

test('don_duoc_duyet co ten khoa thi dan ten vao, khong co thi van chay', () => {
    const size = buildNotification('don_duoc_duyet', { tenKhoa: 'Lập trình C', courseSlug: 'lap-trinh-c' });
    assert.ok(size.thongBao.noiDung.includes('Lập trình C'));
    assert.strictEqual(size.thongBao.duongDan, '/course?slug=lap-trinh-c');

    const none = buildNotification('don_duoc_duyet', {});
    assert.strictEqual(none.ok, true);
    assert.strictEqual(none.thongBao.duongDan, '/user/profile');
});

test('slug duoc ma hoa nen khong pha duoc chuoi truy van', () => {
    // Slug la du lieu tu CSDL, nhung khong co gi bao dam no sach: admin go tay
    // duoc. Khong ma hoa thi mot slug chua '&' se de ra tham so la.
    const outcome = buildNotification('don_duoc_duyet', { tenKhoa: 'X', courseSlug: 'a&b=c' });
    assert.strictEqual(outcome.thongBao.duongDan, '/course?slug=a%26b%3Dc');
});

test('he_thong khong cho nhet duong dan ngoai vao', () => {
    // Loai nay nhan duong dan tu noi goi nen la cho de bi loi nhat.
    const outcome = buildNotification('he_thong', {
        tieuDe: 'Bao tri',
        noiDung: 'He thong bao tri luc 2h sang.',
        duongDan: 'https://trang-gia.com',
    });
    assert.strictEqual(outcome.ok, true);
    assert.strictEqual(outcome.thongBao.duongDan, '');
});

test('tieu de va noi dung khong bao gio vuot nguong cua model', () => {
    // Vuot nguong la Mongoose nem loi validate, ma noi goi thi dang giua chung
    // viec duyet don - hong o day la hong ca viec chinh.
    const outcome = buildNotification('he_thong', {
        tieuDe: 'T'.repeat(500),
        noiDung: 'N'.repeat(3000),
        duongDan: '/courses',
    });
    assert.ok(outcome.thongBao.tieuDe.length <= MAX_TITLE_LENGTH);
    assert.ok(outcome.thongBao.noiDung.length <= MAX_CONTENT_LENGTH);
});

